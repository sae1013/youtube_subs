import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AxiosInstance } from 'axios';
import { subMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { AXIOS_INSTANCE } from '../common/http/axios.provider';
import { EXCEL_READER } from '../common/excel/excel.provider';
import type { ExcelReader } from '../common/excel/excel.provider';
import type { GmailMailer } from 'src/common/email/gmail.provider';
import {
  LastChangedStatus,
  OrderDetail,
  SmartstoreResponse,
  OrderInfo,
} from './types';
import { getProdAndCountryByString, parseProductOption } from '../common/utils';
import { GMAIL_MAILER } from 'src/common/email/gmail.provider';
// import { genHtmlTemplate } from 'src/common/email/templates/template1';
import * as crypto from 'crypto';
import { Country, ProductType } from '../common';
import { ProductConfigService } from '../product-config/product-config.service';
import { EXCEL_URL_BY_PROD_COUNTRY } from '../common/excel/variables';

@Injectable()
export class OrdersService {
  ADMIN_EMAIL_ADDR = 'sae1013@gmail.com';
  private readonly prodType: ProductType;
  private readonly country: Country<typeof this.prodType>;

  constructor(
    private readonly configService: ConfigService,
    private readonly productConfigService: ProductConfigService,
    @Inject(AXIOS_INSTANCE) private readonly http: AxiosInstance,
    @Inject(EXCEL_READER) private readonly excelReader: ExcelReader,
    @Inject(GMAIL_MAILER) private readonly gmailMailer: GmailMailer,
  ) {
    // this.prodType = this.configService.get('PRODUCT_TYPE') as ProductType;
    // this.country = this.configService.get('COUNTRY') as Country<
    //   typeof this.prodType
    // >;
  }

  /**
   * 자동화의 시작지점
   */
  async processOrders() {
    // 배송처리할 상품목록. 메일전송에 성공하면 채워넣는다.
    const productOrderIdList: string[] = [];

    // STEP 1
    // 최근 결제된 주문 ID 배열을 가져온다
    const paidOrderIds = await this.findLastChangedPaidOrders();

    if (paidOrderIds.length < 1) {
      return;
    }

    // STEP 2
    // 결제된 항목들의 Order List를 가져온다.
    // const originalProductId = String(
    //   this.productConfigService.getOriginalProductId(
    //     this.prodType,
    //     this.country,
    //   ),
    // );
    // 상세데이터 조회
    const ordersInfo: OrderDetail[] = await this.getOrdersInfo(paidOrderIds);
    console.log('ordersInfo:', ordersInfo);
    if (ordersInfo.length < 1) return;
    // STEP 3
    // orders info 를 순회하면서, 엑셀파일을 읽고 해당 하는 상품이 있는 경우 메일을 발송한다.
    // 만약 수량이 부족하면 관리자에게 메일을 보낸다.

    for (const orderInfo of ordersInfo) {
      const { ordererName, ordererId } = orderInfo.order;
      const {
        quantity,
        productOption,
        productOrderId,
        shippingAddress: { tel1 },
        originalProductId,
      } = orderInfo.productOrder;

      // const [prod, country]: [ProductType, Country<typeof this.prodType>] =
      //   getProdAndCountryByString(
      //     this.productConfigService.getSnapshot().PRODUCT_BY_KEY[
      //       originalProductId
      //     ],
      //   );
      const { amount, unit } = parseProductOption(productOption);

      let redeemCd = '';
      const spreadsheetId = EXCEL_URL_BY_PROD_COUNTRY[prod][country] || '';

      for (let i = 0; i < quantity; i++) {
        // 엑셀에서 가져온 row 데이터.
        const rows = await this.excelReader.readRows(spreadsheetId, {
          range: '시트1!A2:C',
        });
        // 보낼 상품의 타겟 행
        const targetRow = rows.findIndex((row) => {
          const rowAmt = row[0] as string;
          redeemCd = row[1] as string;
          const useYn = row[2] as string;

          return (
            rowAmt === amount && useYn.toLowerCase() === 'n' && redeemCd.trim()
          );
        });

        // 문자발송
        try {
          await this.sendSMS(
            tel1,
            `애플기프트샵 입니다. ${amount}${unit} 코드:\n ${redeemCd} \n감사합니다.`,
          );
          // 배송처리 할 리스트에 담기.
          if (!productOrderIdList.includes(productOrderId)) {
            productOrderIdList.push(productOrderId);
          }
        } catch (err) {
          console.error(err);
        }
        // 엑셀 업데이트
        try {
          await this.excelReader.writeRows(
            targetRow,
            spreadsheetId,
            {},
            'y',
            '이메일 없음',
            ordererName,
            tel1,
            ordererId,
          );
        } catch (err) {
          console.error(err);
        }
      }
    }
    // 문자발송 및 엑셀 업데이트 이후 최종 발송처리
    await this.postDeliveryProducts(productOrderIdList);
  }

  async findLastChangedPaidOrders(): Promise<string[]> {
    const params = {
      lastChangedFrom: this.getLastChangedFrom(180),
    };
    try {
      const response = await this.http.get<
        SmartstoreResponse<LastChangedStatus>
      >('/v1/pay-order/seller/product-orders/last-changed-statuses', {
        params,
      });
      const lastChangeStatuses: OrderInfo[] =
        response.data.data?.lastChangeStatuses ?? [];

      return this.getPaidOrderIds(lastChangeStatuses);
    } catch (err) {
      console.log('minwooerr', err);
      return [];
    }
  }

  getPaidOrderIds(orderInfoList: OrderInfo[]) {
    return orderInfoList
      .filter((x) => x.lastChangedType === 'PAYED')
      .map((x) => x.productOrderId);
  }

  /**
   * 주문된 상품 상세조회
   * @param productOrderIds
   */
  async getOrdersInfo(productOrderIds: string[]): Promise<OrderDetail[] | []> {
    const payload = {
      productOrderIds,
    };
    try {
      const response = await this.http.post<SmartstoreResponse<OrderDetail[]>>(
        '/v1/pay-order/seller/product-orders/query',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  /**
   * 상품발송처리
   * @param productOrderIdList 상품 배열
   */
  async postDeliveryProducts(productOrderIdList) {
    const dispatchProductOrders = productOrderIdList.map((orderId) => {
      return {
        productOrderId: orderId,
        deliveryMethod: 'NOTHING',
        deliveryCompanyCode: '',
        trackingNumber: '',
        dispatchDate: this.formatGMT9TimeZone(new Date()),
      };
    });

    const payload = {
      dispatchProductOrders,
    };
    try {
      await this.http.post(
        '/v1/pay-order/seller/product-orders/dispatch',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return true;
    } catch (err) {
      console.error('postDeliveryProducts:', err);
      return false;
    }
  }

  /**
   * N 분전 시간을 string으로변환
   * @param minutes
   * @private
   */
  private getLastChangedFrom(minutes: number): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const N_minutesAgo: Date = subMinutes(new Date(), minutes);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    return formatInTimeZone(
      N_minutesAgo,
      'Asia/Seoul',
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
    );
  }

  private formatGMT9TimeZone(date: Date) {
    return formatInTimeZone(date, 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
  }

  async sendSMS(customerNumber: string, text: string) {
    function generateSignature(apiSecret, dateTime, salt) {
      const data = dateTime + salt;
      return crypto.createHmac('sha256', apiSecret).update(data).digest('hex');
    }

    //	"""Authorization 헤더 생성"""
    function createAuthHeader(apiKey, apiSecret) {
      const dateTime = new Date().toISOString();
      const salt = crypto.randomBytes(16).toString('hex');
      const signature = generateSignature(apiSecret, dateTime, salt);

      return `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`;
    }

    const apiKey = this.configService.get('SOLAPI_KEY') as string;
    const apiSecret = this.configService.get('SOLAPI_SECRET') as string;

    const authHeader = createAuthHeader(apiKey, apiSecret);
    const reqUrl = 'https://api.solapi.com/messages/v4/send-many/detail';
    const reqParam = {
      messages: [
        {
          from: '010-8361-9220',
          to: customerNumber,
          text: text,
        },
      ],
    };

    try {
      const response = await this.http.post(reqUrl, reqParam, {
        headers: {
          'x-skip-auth': true,
          Authorization: authHeader,
        },
      });
      return 200;
    } catch (err) {
      console.log(err);
    }
  }
}

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
  parse,
  isValid,
  startOfDay,
  differenceInCalendarDays,
  format,
} from 'date-fns';

import {
  LastChangedStatus,
  OrderDetail,
  SmartstoreResponse,
  OrderInfo,
} from './types';
import { GMAIL_MAILER } from 'src/common/email/gmail.provider';
// import { genHtmlTemplate } from 'src/common/email/templates/template1';
import * as crypto from 'crypto';
import { Country, DEFAULT_RANGE, ProductType } from '../common';
import { ProductConfigService } from '../product-config/product-config.service';
import { getEmailTemplate } from './emailtemplate';

type ExpireTargetResult =
  | {
      ok: false;
      isTarget: false;
      reason: 'invalid_date';
      expireAt: null;
      daysUntilExpire: null;
    }
  | {
      ok: true;
      isTarget: boolean;
      reason: 'expired' | 'within_window' | 'too_early';
      expireAt: Date;
      daysUntilExpire: number;
    };

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
  ) {}

  /**
   * 유튜브 회원에게 만료알람 보내기 만료날짜: 해당 날짜 2월28일 자정 2월 26일자정
   */
  async sendYoutubeAlert() {
    const response = await this.excelReader.readRows(
      this.configService.get('YOUTUBE_SPREAD_ID') ?? '',
      { range: '유튜브 프리미엄 인도계정!G2:L' },
    );

    for (const row of response) {
      const [expireDate, useYn, contact, channel, etc, nickname] = row;

      try {
        if (useYn === 'n' || !String(contact ?? '').trim()) {
          throw new Error(
            `${nickname}은 자동발송을 원하지않거나 주소가 없습니다.`,
          );
        }

        const r = this.isExpireTarget(expireDate, new Date(), {
          minDaysBefore: 1,
          maxDaysBefore: 3, // ✅ 여기 매개변수로 조절
          includeExpired: true, // ✅ 만료 지난 사람 포함
        });
        if (!nickname) {
          throw new Error('구분선 빈칸');
        }
        if (!r.ok)
          throw new Error(
            `${nickname}님의 엑셀 날짜를 확인해주세요: ${expireDate}`,
          );
        if (!r.isTarget)
          throw new Error(
            `${nickname}님은 발송 대상이 아닙니다. (남은일수=${r.daysUntilExpire}, reason=${r.reason})`,
          );

        const textMessage = `
              안녕하세요. 유튜브 프리미엄 만료 전 안내 문자/메일 드립니다.\n만료: ${this.toKoreanMonthDay(expireDate)}\n(${r.reason === 'expired' ? '이미 만료' : '만료 임박'}) \n\n입금계좌: 3333060031134 \n 입금은행: 카카오뱅크 \n 계좌주: 정민우\n\n입금시 본인의 닉네임으로 입금해주시면 확인이 빠릅니다.\n본명으로 입금하실 경우 입금 후 별도로 알려주시면 감사드리겠습니다.\n좋은 하루 되세요~^^`.trim();

        const isSMS = contact.includes('@') ? 0 : 1;

        console.log(`${nickname}에게 발송`);

        const emailMessage = getEmailTemplate({
          expireDate: this.toKoreanMonthDay(expireDate),
          reason: r.reason === 'expired' ? '이미 만료' : '만료 임박',
        });

        /**
         * 대고객 문자/메일발송입니다. 아래 주석은 유의해주세요.
         */
        // if (isSMS) {
        //   const response = await this.sendSMS(contact, textMessage);
        // } else {
        //   const response = await this.gmailMailer.send({
        //     to: contact,
        //     subject: '유튜브 프리미엄 갱신안내',
        //     html: emailMessage,
        //     from: 'sae1013@gmail.com',
        //   });
        // }
      } catch (err) {
        // 필요하면 err 로그
        console.log(err?.message ?? err);
      }
    }

    return 200;
  }

  isExpireTarget(
    dateStr: string,
    now: Date = new Date(),
    options?: {
      // "D-1 ~ D-5" 처럼 범위 지정
      minDaysBefore?: number; // default 1
      maxDaysBefore?: number; // default 5
      includeExpired?: boolean; // default true
    },
  ): ExpireTargetResult {
    const minDaysBefore = options?.minDaysBefore ?? 1;
    const maxDaysBefore = options?.maxDaysBefore ?? 5;
    const includeExpired = options?.includeExpired ?? true;

    // 날짜 문자열 -> Date (서버 TZ=KST라면 KST 00:00으로 파싱)
    const parsed = parse(String(dateStr).trim(), 'yyyy.MM.dd', new Date());
    if (!isValid(parsed)) {
      return {
        ok: false,
        isTarget: false,
        reason: 'invalid_date',
        expireAt: null,
        daysUntilExpire: null,
      };
    }

    // 만료 시점을 "해당 날짜 자정(00:00)"으로 강제
    const expireAt = startOfDay(parsed);
    const today = startOfDay(now);

    // expireAt - today (달력 기준 남은 일수)
    const daysUntilExpire = differenceInCalendarDays(expireAt, today);

    // 과거(<0)면 => 이미 만료(자정 기준)
    if (daysUntilExpire < 0) {
      return {
        ok: true,
        isTarget: includeExpired,
        reason: 'expired',
        expireAt,
        daysUntilExpire,
      };
    }

    // D-1 ~ D-5 타겟
    const withinWindow =
      (daysUntilExpire >= minDaysBefore && daysUntilExpire <= maxDaysBefore) ||
      daysUntilExpire === 0;

    return {
      ok: true,
      isTarget: withinWindow,
      reason: withinWindow ? 'within_window' : 'too_early',
      expireAt,
      daysUntilExpire,
    };
  }

  toKoreanMonthDay(dateStr: string) {
    const d = parse(dateStr, 'yyyy.MM.dd', new Date());
    if (!isValid(d)) throw new Error(`Invalid date: ${dateStr}`);

    return format(d, 'M월 d일'); // 예: 12월 25일
  }

  async sendEmail(receiver, template) {
    const response = await this.gmailMailer.send({
      to: 'sae1013@gmail.com',
      subject: '유튜브 프리미엄 갱신안내',
      html: template,
      from: 'sae1013@gmail.com',
    });
    return template;
  }
  /**
   * 자동화의 시작지점
   */
  async processOrders() {
    // 배송처리할 상품목록. 메일전송에 성공하면 채워넣는다.
    const productOrderIdList: string[] = [];
    const S3ProdInfoByKey = this.productConfigService.getSnapshot();
    // STEP 1
    // 최근 결제된 주문 ID 배열을 가져온다
    const paidOrderIds = await this.findLastChangedPaidOrders();

    if (paidOrderIds.length < 1) {
      return;
    }

    // STEP 2
    // productId 를 이용하여 오더정보를 가져온다.
    const ordersInfo: OrderDetail[] = await this.getOrdersInfo(paidOrderIds);
    console.log('ordersInfo:', ordersInfo);
    if (ordersInfo.length < 1) return;

    // STEP 3
    // orders info 를 순회하면서, 엑셀파일을 읽고 해당 하는 상품이 있는 경우 문자를 발송한다.
    for (const orderInfo of ordersInfo) {
      const { ordererName, ordererId } = orderInfo.order;
      const {
        quantity,
        // productOption,
        optionManageCode, // 옵션별칭
        productOrderId,
        shippingAddress: { tel1 },
        originalProductId,
      } = orderInfo.productOrder;

      //TODO: 금액 , 단위 따로 뽑아오기
      const unit = S3ProdInfoByKey[originalProductId]?.unit;

      const spreadsheetId =
        S3ProdInfoByKey[originalProductId]?.spreadsheetId || '';

      // 주문갯수에따라 순회
      for (let i = 0; i < quantity; i++) {
        // 엑셀에서 가져온 row 데이터.
        const rows = await this.excelReader.readRows(spreadsheetId, {
          range: DEFAULT_RANGE,
        });
        // 보낼 상품의 타겟 행
        const targetRowIdx = rows.findIndex((row) => {
          const redeemCd = row[1]; // 코드
          const useYn = row[2]; // 사용여부
          const rowOptionCode = row[3]; // 옵션 코드

          // 주문들어온 옵션과 타겟의 옵션코드를보고 사용n이면 리턴
          return (
            String(optionManageCode) === String(rowOptionCode) &&
            useYn.toLowerCase() === 'n' &&
            redeemCd.trim()
          );
        });

        // 상품이 품절이면 리턴
        if (targetRowIdx < 0) return;

        const [amount, redeemCd, useYn, rowOptionCode] = rows[targetRowIdx]; // 대상 상품 / 양, 코드, 사용여부, 옵션코드

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
            targetRowIdx,
            spreadsheetId,
            {},
            'y',
            rowOptionCode,
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

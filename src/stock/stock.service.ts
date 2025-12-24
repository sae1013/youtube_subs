import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AXIOS_INSTANCE } from '../common/http/axios.provider';
import type { AxiosInstance } from 'axios';
import type { ExcelReader } from '../common/excel/excel.provider';
import { EXCEL_READER } from '../common/excel/excel.provider';
import { createOptionMapperByValue } from './const/optionMapper';
import { Country, DEFAULT_RANGE, ProductType } from '../common';
import { ProductConfigService } from '../product-config/product-config.service';

@Injectable()
export class StockService {
  constructor(
    private readonly configService: ConfigService,
    private readonly productConfigService: ProductConfigService,
    @Inject(AXIOS_INSTANCE) private readonly http: AxiosInstance,
    @Inject(EXCEL_READER) private readonly excelReader: ExcelReader,
  ) {}

  async getStockByOptions(spreadsheetId, option) {
    const rows = await this.excelReader.readRows(spreadsheetId, option);

    // 각 로우 별로 파싱해서 object 키 값 형태로 내려준다.
    // ex) {100:3, 389:5 , 300: 7} 이런식으로, 옵션코드 : 잔여갯수
    const optionStockTable = rows.reduce((acc, cur) => {
      const [value, _, useYn, optionCode] = cur as unknown as string[];
      if ((useYn as unknown as string).toLowerCase() === 'n') {
        acc.set(optionCode, (acc.get(optionCode) ?? 0) + 1);
      }
      return acc;
    }, new Map());

    // 'y' 인경우도 세서 - 하는경우 보정로직
    for (const [key, value] of optionStockTable) {
      if (value < 0) {
        optionStockTable.set(key, 0);
      }
    }
    return optionStockTable;
  }

  /**
   * 원하는 데이터 구조:
   * 12605435 :
   */
  async updateOptionStock() {
    // 모든 키를 반복해야한다.
    const S3ProdInfoByKey = this.productConfigService.getSnapshot();
    Object.entries(S3ProdInfoByKey).forEach(([key, productObj]) => {
      // !TODO 앞에 반복문 추가해서 매아이템마다 모두 돌 수 있도록 수정하기.
      const spreadSheetId: string = productObj['spreadsheetId'];
      const optionStockTable = await this.getStockByOptions(); // spreadSheetId, option 넣어주기.
      const productType = this.configService.get('PRODUCT_TYPE') as ProductType;
      const country = this.configService.get('COUNTRY') as Country<
        typeof productType
      >;
      // 1) 해당 상품/국가에 대한 옵션 리스트 가져오기
      const optionCombinations =
        this.productConfigService.getOptionCombinations(productType, country); // 재고 맵

      const optionMapperByValue = createOptionMapperByValue(optionCombinations);
      const originalProductId = this.productConfigService.getOriginalProductId(
        productType,
        country,
      );

      const bodyParam = {
        productSalePrice: {
          salePrice: this.productConfigService.getBasePrice(
            productType,
            country,
          ),
        },
        optionInfo: {
          optionCombinations: Array.from(optionStockTable).map(([k, v]) => {
            return {
              id: optionMapperByValue[k as keyof typeof optionMapperByValue].id,
              stockQuantity: v,
              price:
                optionMapperByValue[k as keyof typeof optionMapperByValue]
                  ?.price,
              usable: true,
            };
          }),
          useStockManagement: true,
        },
      };

      try {
        await this.http.put(
          `/v1/products/origin-products/${originalProductId}/option-stock`,
          bodyParam,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      } catch (e) {
        console.log(e);
      }
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AXIOS_INSTANCE } from '../common/http/axios.provider';
import type { AxiosInstance } from 'axios';
import type { ExcelReader } from '../common/excel/excel.provider';
import { EXCEL_READER } from '../common/excel/excel.provider';
import { createOptionMapperByValue } from './const/optionMapper';
import { DEFAULT_RANGE } from '../common';
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
      const [_, _, useYn, optionCode] = cur as unknown as string[];
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

    for (const [key, productObj] of Object.entries(S3ProdInfoByKey)) {
      // 상품마다 spreadid가다름
      const spreadSheetId: string = productObj['spreadsheetId'];
      const optionStockTable = await this.getStockByOptions(spreadSheetId, {
        range: DEFAULT_RANGE,
      });

      // 1) 해당 상품/국가에 대한 옵션 리스트 가져오기
      const optionCombinations = productObj['option_combinations']; // 옵션 별 객체 배열

      // optionMapperByValue
      const optionMapperByCodeMap =
        createOptionMapperByValue(optionCombinations); // optionCombinations가 배열에서 {}

      const originalProductId = productObj['originalProdId'];

      const bodyParam = {
        productSalePrice: {
          salePrice: productObj['base_price'],
        },
        optionInfo: {
          optionCombinations: Array.from(optionStockTable).map(([k, v]) => {
            return {
              id: optionMapperByCodeMap[k as keyof typeof optionMapperByCodeMap]
                .id,
              stockQuantity: v,
              price:
                optionMapperByCodeMap[k as keyof typeof optionMapperByCodeMap]
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
    }
  }
}

// 엑셀에서 조회 , 재고 업데이트
// /v1/products/origin-products/:originProductNo/option-stock , originProductNo 12650488610 , 53712097198 , channel product No 12707577730
import { Controller, Get } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // @Get('/stocks')
  // getStock() {
  //   this.stockService.getStockByOptions();
  // }

  @Get('/stocks/update-option')
  updateStock() {
    this.stockService.updateOptionStock();
  }
}

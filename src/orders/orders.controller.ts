import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/orders/last-changed-orders')
  async findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.ordersService.findLastChangedPaidOrders();
    return {
      data: {
        msg: 'success',
        code: 200,
      },
    };
  }

  @Get('/orders/process-auto')
  async processAuto() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.ordersService.processOrders();
    return {
      data: {
        msg: 'success',
        code: 200,
      },
    };
  }

  @Get('excel')
  excel() {
    // this.ordersService.test();
    return 200;
  }

  @Get('sms')
  sendSMS() {
    this.ordersService.sendSMS('01083619220', '안녕하세요.');
    return 200;
  }

  // @Get('/email')
  // email() {
  //   this.ordersService.gmail();
  //   return 200;
  // }
}

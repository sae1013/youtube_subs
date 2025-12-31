import { Controller, Get, Header } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { getEmailTemplate } from './emailtemplate';

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
    const message = `안녕하세요.유튜브 프리미엄 만료 전 안내 문자/메일 드립니다. \n 만료: (3일 전 이미 만료) \n 입금계좌: 3333060031134 \n 입금은행: 카카오뱅크 \n 계좌주: 정민우 \n \n입금시 본인의 닉네임으로 입금해주시면 확인이 빠릅니다. \n본명으로 입금하실 경우 입금 후 별도로 알려주시면 감사드리겠습니다. \n 좋은 하루 되세요~^^`;
    this.ordersService.sendSMS('01083619220', message);
    return 200;
  }

  @Get('youtube-email')
  async sendEmail() {
    const receiver = 'sae1013@gmail.com';
    const template = getEmailTemplate({ name: 'minwoo' });
    return await this.ordersService.sendEmail(receiver, template);
  }

  @Get('youtube-alert')
  @Header('content-type', 'text/html; charset=utf-8')
  sendYoutubeAlert() {
    this.ordersService.sendYoutubeAlert();
  }

  // @Get("youtube-page")
  // @Header('content-type', 'text/html; charset=utf-8')
  // page(){
  //   return
  // }
}

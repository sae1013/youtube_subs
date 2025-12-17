import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { StockModule } from './stock/stock.module';
import { ExcelModule } from './common/excel/excel.module';
import { ProductConfigModule } from './product-config/product-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    OrdersModule,
    StockModule,
    AuthModule,
    JobsModule,
    ExcelModule,
    ProductConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

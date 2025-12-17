import { Global, Module } from '@nestjs/common';
import { ProductConfigService } from './product-config.service';

@Global()
@Module({
  providers: [ProductConfigService],
  exports: [ProductConfigService],
})
export class ProductConfigModule {}

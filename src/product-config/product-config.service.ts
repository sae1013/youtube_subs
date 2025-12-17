import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  BASE_PRICE as DEFAULT_BASE_PRICE,
  OPTION_COMBINATIONS as DEFAULT_OPTION_COMBINATIONS,
  ORIGINAL_PRODUCT_ID as DEFAULT_ORIGINAL_PRODUCT_ID,
  OptionCombination,
} from '../stock/const/optionMapper';
import { ByProdCountry, Country, ProductType } from '../common';

type ProductConfigShape = {
  ORIGINAL_PRODUCT_ID: ByProdCountry<number>;
  BASE_PRICE: ByProdCountry<number>;
  OPTION_COMBINATIONS: ByProdCountry<OptionCombination[]>;
  PRODUCT_BY_KEY: number;
};

@Injectable()
export class ProductConfigService implements OnModuleInit {
  private readonly logger = new Logger(ProductConfigService.name);

  // Keep a local snapshot so everything reads the same cached object.
  private snapshot: ProductConfigShape = {
    PRODUCT_BY_KEY: 1232424,
    ORIGINAL_PRODUCT_ID: DEFAULT_ORIGINAL_PRODUCT_ID,
    BASE_PRICE: DEFAULT_BASE_PRICE,
    OPTION_COMBINATIONS: DEFAULT_OPTION_COMBINATIONS,
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const configUrl = this.configService.get<string>('PRODUCT_CONFIG_URL');

    if (!configUrl) {
      this.logger.warn(
        'PRODUCT_CONFIG_URL is not defined. Falling back to local option mapper values.',
      );
      return;
    }

    try {
      const response = await axios.get<ProductConfigShape>(configUrl, {
        timeout: 30000,
      });
      const data = response.data;

      this.snapshot = data;
    } catch (error) {
      this.logger.error(
        `Failed to load remote product config from ${configUrl}`,
        error as Error,
      );
    }
  }

  getOriginalProductId<P extends ProductType, C extends Country<P>>(
    productType: P,
    country: C,
  ): number {
    return this.snapshot.ORIGINAL_PRODUCT_ID[productType][country];
  }

  getBasePrice<P extends ProductType, C extends Country<P>>(
    productType: P,
    country: C,
  ): number {
    return this.snapshot.BASE_PRICE[productType][country];
  }

  getOptionCombinations<P extends ProductType, C extends Country<P>>(
    productType: P,
    country: C,
  ): OptionCombination[] {
    return this.snapshot.OPTION_COMBINATIONS[productType][country];
  }

  getSnapshot(): ProductConfigShape {
    return this.snapshot;
  }
}

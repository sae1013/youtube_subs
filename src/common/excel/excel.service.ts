import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXCEL_READER, type ExcelReader } from './excel.provider';

@Injectable()
export class ExcelService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(EXCEL_READER) private readonly excelReader: ExcelReader,
  ) {}

  async readFile() {
    const rows = await this.excelReader.readRows('test', {});
    console.log(rows);
  }
}

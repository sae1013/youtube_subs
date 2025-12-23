import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { EXCEL_URL_BY_PROD_COUNTRY } from './variables';
import { Country, ProductType } from '../index';

export type ExcelCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type ExcelRow = string[];

export interface ExcelReadOptions {
  sheetName?: string;
  range?: string | number;
  raw?: boolean;
}

export interface ExcelReader {
  sheets?: sheets_v4.Sheets;

  readRows<T extends ExcelRow = ExcelRow>(
    spreadSheetId: string,
    options: ExcelReadOptions,
  ): Promise<T[]>;

  writeRows(
    targetRow: number,
    spreadsheetId: string,
    options,
    ...args
  ): Promise<number>;
}

export const EXCEL_READER = Symbol('EXCEL_READER');

const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const excelReaderProvider: Provider = {
  provide: EXCEL_READER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ExcelReader => {
    const auth = new google.auth.JWT({
      email: configService.get<string>('GOOGLE_CLIENT_EMAIL'),
      key: configService
        .get<string>('GOOGLE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n'),
      scopes: SHEETS_SCOPES,
    });
    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    const readRows = async <T extends ExcelRow = ExcelRow>(
      spreadSheetId: string,
      options,
    ) => {
      const context = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadSheetId,
        range: options?.range || '',
      });

      const rows = (context.data.values ?? []) as unknown as T[]; // 2차원 배열
      return rows;
    };

    const writeRows = async (
      targetRow: number,
      spreadSheetId: string,
      options,
      ...args
    ) => {
      try {
        const response = await sheets.spreadsheets.values.update({
          spreadsheetId: spreadSheetId,
          range: `시트1!C${targetRow + 2}:H${targetRow + 2}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [args],
          },
        });
        return response.data?.updatedRows ?? 0;
      } catch (err) {
        console.error('writeRows:', err);
        throw new Error('엑셀시트 업데이트 실패');
      }
    };
    return {
      readRows,
      writeRows,
    };
  },
};

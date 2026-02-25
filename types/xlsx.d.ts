declare module "xlsx-js-style" {
  import * as XLSX from "xlsx";
  export = XLSX;
}

declare module "xlsx" {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
    Props?: object;
    Custprops?: object;
  }

  export interface WorkSheet {
    [cell: string]: CellObject | unknown;
    "!ref"?: string;
    "!margins"?: object;
    "!cols"?: ColInfo[];
    "!rows"?: RowInfo[];
    "!merges"?: Range[];
    "!protect"?: object;
    "!autofilter"?: AutoFilterInfo;
  }

  export interface CellObject {
    t: "b" | "n" | "e" | "s" | "d" | "z";
    v?: boolean | number | string | Date;
    w?: string;
    f?: string;
    r?: string;
    h?: string;
    c?: Comments;
    z?: string;
    l?: Hyperlink;
    s?: CellStyle;
  }

  export interface CellStyle {
    font?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strike?: boolean;
      color?: { rgb?: string };
      sz?: number;
      name?: string;
    };
    fill?: {
      fgColor?: { rgb?: string };
      bgColor?: { rgb?: string };
      patternType?: string;
    };
    border?: {
      top?: BorderStyle;
      bottom?: BorderStyle;
      left?: BorderStyle;
      right?: BorderStyle;
    };
    alignment?: {
      horizontal?: "left" | "center" | "right";
      vertical?: "top" | "center" | "bottom";
      wrapText?: boolean;
    };
  }

  export interface BorderStyle {
    style?: string;
    color?: { rgb?: string };
  }

  export interface ColInfo {
    wch?: number;
    wpx?: number;
    width?: number;
    hidden?: boolean;
    level?: number;
  }

  export interface RowInfo {
    hpx?: number;
    hpt?: number;
    hidden?: boolean;
    level?: number;
  }

  export interface Range {
    s: CellAddress;
    e: CellAddress;
  }

  export interface CellAddress {
    c: number;
    r: number;
  }

  export interface AutoFilterInfo {
    ref: string;
  }

  export interface Comments {
    a?: string;
    t?: string;
  }

  export interface Hyperlink {
    Target: string;
    Tooltip?: string;
  }

  export interface WritingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string";
    bookType?: string;
    bookSST?: boolean;
    sheet?: string;
    compression?: boolean;
    Props?: object;
    cellStyles?: boolean;
  }

  export interface ParsingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string";
    raw?: boolean;
    codepage?: number;
    cellFormula?: boolean;
    cellHTML?: boolean;
    cellNF?: boolean;
    cellStyles?: boolean;
    cellText?: boolean;
    cellDates?: boolean;
    dateNF?: string;
    sheetStubs?: boolean;
    sheetRows?: number;
    bookDeps?: boolean;
    bookFiles?: boolean;
    bookProps?: boolean;
    bookSheets?: boolean;
    bookVBA?: boolean;
    password?: string;
    WTF?: boolean;
    sheets?: number | string | string[];
    PRN?: boolean;
    xlfn?: boolean;
    FS?: string;
  }

  export interface Sheet2JSONOpts {
    raw?: boolean;
    range?: string | number;
    header?: "A" | number | string[];
    dateNF?: string;
    defval?: unknown;
    blankrows?: boolean;
    skipHidden?: boolean;
    UTC?: boolean;
  }

  export interface JSON2SheetOpts {
    header?: string[];
    dateNF?: string;
    cellDates?: boolean;
    skipHeader?: boolean;
    origin?: string | CellAddress | number;
  }

  export interface AOA2SheetOpts {
    dateNF?: string;
    cellDates?: boolean;
    sheetStubs?: boolean;
    origin?: string | CellAddress | number;
  }

  export const utils: {
    book_new(): WorkBook;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name?: string): void;
    aoa_to_sheet<T>(data: T[][], opts?: AOA2SheetOpts): WorkSheet;
    json_to_sheet<T>(data: T[], opts?: JSON2SheetOpts): WorkSheet;
    sheet_to_json<T>(ws: WorkSheet, opts?: Sheet2JSONOpts): T[];
    sheet_to_csv(ws: WorkSheet, opts?: object): string;
    sheet_to_html(ws: WorkSheet, opts?: object): string;
    sheet_to_formulae(ws: WorkSheet): string[];
    encode_cell(cell: CellAddress): string;
    decode_cell(address: string): CellAddress;
    encode_range(range: Range): string;
    decode_range(address: string): Range;
    encode_col(col: number): string;
    decode_col(col: string): number;
    encode_row(row: number): number;
    decode_row(row: number): number;
    sheet_add_aoa<T>(ws: WorkSheet, data: T[][], opts?: AOA2SheetOpts): WorkSheet;
    sheet_add_json<T>(ws: WorkSheet, data: T[], opts?: JSON2SheetOpts): WorkSheet;
  };

  export function read(data: unknown, opts?: ParsingOptions): WorkBook;
  export function readFile(filename: string, opts?: ParsingOptions): WorkBook;
  export function write(wb: WorkBook, opts?: WritingOptions): unknown;
  export function writeFile(wb: WorkBook, filename: string, opts?: WritingOptions): void;
  export function writeFileAsync(filename: string, wb: WorkBook, opts?: WritingOptions): Promise<void>;
}

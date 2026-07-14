/** Bill / document payload used by the renderer & designer */
export interface BackendData {
  Identify?: number;
  /** Header field values, e.g. { 单据编号: 'SO-001', 客户: 'Acme' } */
  Tb: Record<string, unknown>;
  /** Detail rows */
  TbDetail: Record<string, unknown>[];
  /** Header field metadata (for designer palette) */
  TbHeaders: FieldMeta[];
  /** Detail column metadata (for designer palette) */
  TbDetailHeaders: FieldMeta[];
}

export interface FieldMeta {
  Key: string;
  Title: string;
  IsPrint?: boolean;
  PrintWidth?: number;
  Type?: string;
  Visible?: boolean;
  [key: string]: unknown;
}

export interface PaperConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export type PrintSectionKey = 'header' | 'detail' | 'footer';

export interface PrintSectionConfig {
  key: PrintSectionKey;
  title: string;
  top: number;
  height: number;
  visible: boolean;
  autoFlow?: boolean;
  printMode?: 'every' | 'first' | 'last';
}

export interface PrintSectionsConfig {
  header: PrintSectionConfig;
  detail: PrintSectionConfig;
  footer: PrintSectionConfig;
}

export interface HeaderFieldConfig {
  key: string;
  title: string;
  left: number;
  top: number;
  fontSize: number;
  width: number;
  bold: boolean;
  align: 'left' | 'center' | 'right';
  showLabel: boolean;
  section?: PrintSectionKey;
}

export interface DetailColumnConfig {
  key: string;
  title: string;
  width: number;
  align: 'left' | 'center' | 'right';
  visible: boolean;
  type?: string;
  /** Force decimal places for numeric columns; undefined = no forced format */
  decimalPlaces?: number | null;
}

export interface FreeElementConfig {
  type: 'text' | 'hline' | 'rect' | 'barcode' | 'qrcode';
  left: number;
  top: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  section?: PrintSectionKey;
  barcodeFormat?: string;
}

export interface SummaryRowConfig {
  label: string;
  field: string;
  method: 'sum' | 'count' | 'avg' | 'none';
  position: 'header' | 'footer';
}

export interface PrintTemplateConfig {
  paper: PaperConfig;
  sections?: PrintSectionsConfig;
  headerFields: HeaderFieldConfig[];
  detailColumns: DetailColumnConfig[];
  freeElements: FreeElementConfig[];
  summaryRows: SummaryRowConfig[];
  tableLeft: number;
  tableTop: number;
  sequenceColumnWidth?: number;
  detailHeaderHeight?: number;
  detailRowHeight?: number;
  allowTableOverflow?: boolean;
  headerNoWrap?: boolean;
  title: string;
  titleFontSize: number;
  titleTop?: number;
  titleLeft?: number;
  titleWidth?: number;
  titleMarginBottom?: number;
  rowsPerPage: number;
  repeatHeader: boolean;
  repeatColumnHeader: boolean;
  footerText: string;
  showPageNumber: boolean;
  version: number;
}

/** Persist / load template JSON by formType key */
export interface TemplateStore {
  load(formType: string): Promise<string | null>;
  save(formType: string, templateJson: string): Promise<void>;
}

export type MessageLevel = 'success' | 'warning' | 'error' | 'info';

export interface PrintOptions {
  formType: string;
  data: BackendData;
  /** Override store for this call; falls back to global configure() */
  store?: TemplateStore;
  /** Optional static HTML fallback when no JSON template is saved */
  fallbackHtml?: string;
  onMessage?: (level: MessageLevel, text: string) => void;
}

export interface VueBillPrintConfig {
  store?: TemplateStore;
  onMessage?: (level: MessageLevel, text: string) => void;
}

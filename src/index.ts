export type {
  BackendData,
  FieldMeta,
  PaperConfig,
  PrintSectionKey,
  PrintSectionConfig,
  PrintSectionsConfig,
  HeaderFieldConfig,
  DetailColumnConfig,
  FreeElementConfig,
  SummaryRowConfig,
  PrintTemplateConfig,
  TemplateStore,
  MessageLevel,
  PrintOptions,
  VueBillPrintConfig,
} from './types';

export { formatDateValue } from './format';
export {
  configure,
  createLocalStorageStore,
  getStore,
  emitMessage,
} from './storage';
export {
  printBill,
  silentInitAndPrint,
} from './print';
export {
  renderFromConfigAsync,
  getHtmlTemplate,
  htmlPrint,
  DEFAULT_ROWS_PER_PAGE,
  computeMaxFittingRows,
  computeContinuationFittingRows,
  computeDetailBodyHeightPt,
  syncDetailSectionHeight,
  getTitleTopPt,
  pageRowCapacity,
} from './render';

export { default as PrintDesigner } from './PrintDesigner.vue';

import './style.css';

// ---- i18n ----
export { t, st, setLocale, getLocale } from './i18n';
export type { SupportedLocale } from './i18n';

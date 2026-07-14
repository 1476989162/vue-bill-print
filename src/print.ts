import type { PrintOptions } from './types';
import { htmlPrint } from './render';

/**
 * Public print entry.
 *
 * @example
 * ```ts
 * import { configure, createLocalStorageStore, printBill } from 'vue-bill-print'
 *
 * configure({ store: createLocalStorageStore() })
 * await printBill({ formType: '销售出库', data: billData })
 * ```
 */
export const printBill = async (options: PrintOptions): Promise<void> => {
  await htmlPrint(options.formType, options.data, {
    store: options.store,
    fallbackHtml: options.fallbackHtml,
    onMessage: options.onMessage,
  });
};

/** Alias kept for apps migrating from silentInitAndPrint */
export const silentInitAndPrint = (
  formType: string,
  data: PrintOptions['data'],
  opts?: Omit<PrintOptions, 'formType' | 'data'>,
) => printBill({ formType, data, ...opts });

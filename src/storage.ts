import type { TemplateStore, VueBillPrintConfig, MessageLevel } from './types';

const LS_PREFIX = 'vue-bill-print:';

/** Default store: browser localStorage */
export const createLocalStorageStore = (prefix = LS_PREFIX): TemplateStore => ({
  async load(formType: string) {
    try {
      return localStorage.getItem(prefix + formType);
    } catch {
      return null;
    }
  },
  async save(formType: string, templateJson: string) {
    localStorage.setItem(prefix + formType, templateJson);
  },
});

let globalConfig: VueBillPrintConfig = {
  store: createLocalStorageStore(),
  onMessage: (level, text) => {
    if (level === 'error') console.error('[vue-bill-print]', text);
    else if (level === 'warning') console.warn('[vue-bill-print]', text);
    else console.log('[vue-bill-print]', text);
  },
};

/** Configure default store / message handler once at app bootstrap */
export const configure = (cfg: VueBillPrintConfig) => {
  globalConfig = {
    ...globalConfig,
    ...cfg,
    store: cfg.store ?? globalConfig.store,
    onMessage: cfg.onMessage ?? globalConfig.onMessage,
  };
};

export const getStore = (override?: TemplateStore): TemplateStore =>
  override || globalConfig.store || createLocalStorageStore();

export const emitMessage = (
  level: MessageLevel,
  text: string,
  override?: (level: MessageLevel, text: string) => void,
) => {
  (override || globalConfig.onMessage)?.(level, text);
};

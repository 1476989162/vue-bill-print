import { ref, computed } from "vue";
import { zhCN } from "./zh-CN";
import { en } from "./en";

/* ---------- Reactive (Vue) ---------- */

const localeRef = ref<"zh-CN" | "en">("zh-CN");
const dictRef = computed(() => (localeRef.value === "en" ? en : zhCN));

/**
 * Reactive translation function — use in Vue components / templates.
 * Usage:  t("toolbar.paper")  or  t("render.pageNum", 1, 3)
 */
export function t(key: string, ...args: (string | number)[]): string {
  let msg = dictRef.value[key];
  if (msg == null) msg = zhCN[key] ?? key;
  return interpolate(msg, ...args);
}

/* ---------- Non-reactive (for pure TS / render.ts) ---------- */

let staticDict: Record<string, string> = { ...zhCN };

/**
 * Static translation function — for use outside Vue's reactivity system.
 * Kept in sync with setLocale().
 */
export function st(key: string, ...args: (string | number)[]): string {
  let msg = staticDict[key];
  if (msg == null) msg = zhCN[key] ?? key;
  return interpolate(msg, ...args);
}

/* ---------- Locale switching ---------- */

export type SupportedLocale = "zh-CN" | "en";

export function setLocale(locale: SupportedLocale) {
  localeRef.value = locale;
  staticDict = locale === "en" ? { ...en } : { ...zhCN };
}

export function getLocale(): SupportedLocale {
  return localeRef.value;
}

/* ---------- Internal ---------- */

function interpolate(msg: string, ...args: (string | number)[]): string {
  args.forEach((v, i) => {
    msg = msg.replace(new RegExp(`\\{${i}\\}`, "g"), String(v));
  });
  return msg;
}

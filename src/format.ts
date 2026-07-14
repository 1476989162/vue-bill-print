/** Lightweight date formatter (no dayjs dependency).
 * Optional format string supports tokens: YYYY MM DD HH mm ss
 * e.g. 'YYYY-MM-DD' or 'YYYY/MM/DD HH:mm' */
export const formatDateValue = (value: string, withTime = false, format?: string): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // already formatted or partial string
    return withTime ? String(value).replace('T', ' ').slice(0, 19) : String(value).slice(0, 10);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let base = withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : date;
  if (format) {
    base = format
      .replace('YYYY', String(d.getFullYear()))
      .replace('MM', pad(d.getMonth() + 1))
      .replace('DD', pad(d.getDate()))
      .replace('HH', pad(d.getHours()))
      .replace('mm', pad(d.getMinutes()))
      .replace('ss', pad(d.getSeconds()));
  }
  return base;
};

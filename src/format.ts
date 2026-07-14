/** Lightweight date formatter (no dayjs dependency) */
export const formatDateValue = (value: string, withTime = false): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // already formatted or partial string
    return withTime ? String(value).replace('T', ' ').slice(0, 19) : String(value).slice(0, 10);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!withTime) return date;
  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

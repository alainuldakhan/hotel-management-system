export const formatCurrency = (amount: number, currency = '₸') =>
  `${amount.toLocaleString('ru-KZ')} ${currency}`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatNights = (nights: number) =>
  nights === 1 ? '1 ночь' : nights < 5 ? `${nights} ночи` : `${nights} ночей`;

export const toInputDate = (date: string | Date) =>
  new Date(date).toISOString().split('T')[0];

export const today = () => new Date().toISOString().split('T')[0];
export const addDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

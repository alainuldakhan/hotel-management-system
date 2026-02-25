import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from './client';

/**
 * Скачивает PDF файл через прямой fetch с Bearer токеном.
 * window.open не передаёт заголовки авторизации, поэтому используем Blob download.
 */
async function downloadPdf(url: string, filename: string): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Ошибка генерации PDF: ${response.statusText}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export const reportsApi = {
  /** Скачать PDF счёт-фактуру */
  downloadInvoicePdf: (invoiceId: string, invoiceNumber: string) =>
    downloadPdf(
      `${API_BASE_URL}/reports/invoice/${invoiceId}`,
      `invoice-${invoiceNumber}.pdf`,
    ),

  /** Скачать ежедневный отчёт по заселению */
  downloadDailyOccupancyReport: (date?: string) => {
    const dateParam = date ? `?date=${date}` : '';
    const label = date ?? new Date().toISOString().slice(0, 10);
    return downloadPdf(
      `${API_BASE_URL}/reports/daily-occupancy${dateParam}`,
      `occupancy-${label}.pdf`,
    );
  },

  /** Скачать отчёт по выручке */
  downloadRevenueReport: (from: string, to: string, groupBy = 'month') =>
    downloadPdf(
      `${API_BASE_URL}/reports/revenue?from=${from}&to=${to}&groupBy=${groupBy}`,
      `revenue-${from}-${to}.pdf`,
    ),
};

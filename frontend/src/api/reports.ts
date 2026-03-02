import client from './client';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const reportsApi = {
  downloadInvoice: async (invoiceId: string, invoiceNumber: string) => {
    const { data } = await client.get(`/reports/invoice/${invoiceId}`, { responseType: 'blob' });
    downloadBlob(data as Blob, `invoice-${invoiceNumber}.pdf`);
  },
  downloadDailyOccupancy: async (date?: string) => {
    const { data } = await client.get('/reports/daily-occupancy', { params: { date }, responseType: 'blob' });
    const d = date ?? new Date().toISOString().split('T')[0];
    downloadBlob(data as Blob, `occupancy-${d}.pdf`);
  },
  downloadRevenue: async (from: string, to: string, groupBy = 'month') => {
    const { data } = await client.get('/reports/revenue', { params: { from, to, groupBy }, responseType: 'blob' });
    downloadBlob(data as Blob, `revenue-${from}-${to}.pdf`);
  },
};

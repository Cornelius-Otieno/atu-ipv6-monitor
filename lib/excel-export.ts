import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string) {
  try {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}-${date}.xlsx`);
  } catch (e: any) {
    console.error('Export failed:', e);
  }
}

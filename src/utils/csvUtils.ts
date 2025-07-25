import Papa from 'papaparse';
import { CSVRow, ProcessedRow } from '@/types/reward';

export const parseCSV = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value, header) => {
        if (header === 'amount') {
          return parseFloat(value) || 0;
        }
        return value?.toString().trim() || '';
      },
      complete: (results) => {
        try {
          const rows = results.data as CSVRow[];
          
          // Validate required fields
          const validRows = rows.filter(row => {
            return row.recipient_email && 
                   row.recipient_name && 
                   row.amount && 
                   row.amount > 0;
          });

          if (validRows.length === 0) {
            reject(new Error('No valid rows found. Please ensure your CSV has recipient_email, recipient_name, and amount columns.'));
            return;
          }

          resolve(validRows);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};

export const downloadCSV = (rows: ProcessedRow[], filename: string = 'reward_summary.csv') => {
  const csvData = rows.map(row => ({
    recipient_email: row.recipient_email,
    amount: row.amount,
    recipient_name: row.recipient_name,
    message: row.message || '',
    status: row.status,
    reward_id: row.reward_id || '',
    error_message: row.error_message || '',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
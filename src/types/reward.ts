export interface CSVRow {
  recipient_email: string;
  amount: number;
  recipient_name: string;
  message?: string;
}

export interface ProcessedRow extends CSVRow {
  id: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  reward_id?: string;
  error_message?: string;
}

export interface TremendousResponse {
  order: {
    id: string;
    rewards: Array<{
      id: string;
      value: {
        denomination: number;
      };
    }>;
  };
}

export interface TremendousError {
  errors: Array<{
    message: string;
    code?: string;
  }>;
}
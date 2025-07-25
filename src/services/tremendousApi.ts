import { TremendousResponse, TremendousError } from '@/types/reward';

// CORS proxy for testing only - NOT for production use
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = 'https://api.tremendous.com/api/v2';
const API_KEY = 'TEST_1LdZjYD9BpUEPTyFPFMWW8aQcbXF7xDK'; // Static API key as provided
const FUNDING_SOURCE_ID = '5NJ0STL48TM1';
const CAMPAIGN_ID = 'IRCSABCCXGAV';

export interface SendRewardRequest {
  recipient_email: string;
  recipient_name: string;
  amount: number;
  message?: string;
}

export const sendReward = async (request: SendRewardRequest): Promise<TremendousResponse> => {
  const response = await fetch(`${CORS_PROXY}${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment: {
        funding_source_id: FUNDING_SOURCE_ID,
      },
      reward: {
        value: {
          denomination: request.amount,
        },
        delivery: {
          method: 'EMAIL',
        },
        recipient: {
          name: request.recipient_name,
          email: request.recipient_email,
        },
        campaign_id: CAMPAIGN_ID,
        ...(request.message && { 
          custom_fields: [
            {
              id: 'message',
              value: request.message
            }
          ]
        }),
      },
    }),
  });

  if (!response.ok) {
    const errorData: TremendousError = await response.json();
    throw new Error(errorData.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
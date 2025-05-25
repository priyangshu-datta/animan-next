import axios from 'axios';
import { getValidAccessToken } from '../auth/auth-flow-async';

export async function rpcRequest({ action, context, metadata }) {
  const accessToken = await getValidAccessToken();
  try {
    const response = await axios.post('/api/command', {
      action,
      context,
      metadata: {
        accessToken,
        ...metadata,
      },
    });

    return response.data;
  } catch (error) {
    console.log({ error: error.response.data.error });
    throw error.response.data.error;
  }
}

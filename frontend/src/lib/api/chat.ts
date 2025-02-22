import { type Message } from '@/types/chat';
import { handleResponse } from './utils';

const API_URL = process.env.API_URL;

export async function* streamChat(messages: Message[], model: string) {
  const response = await fetch(`${API_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ messages, model }),
  }).then(handleResponse);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}

export async function* enhanceCode(code: string, model?: string) {
  const response = await fetch(`${API_URL}/api/v1/enhance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ code, model }),
  }).then(handleResponse);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}

export async function getModels() {
  const response = await fetch(`${API_URL}/api/v1/models`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(handleResponse);

  return response.json();
}

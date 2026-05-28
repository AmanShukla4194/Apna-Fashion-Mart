import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        loginWith: {
          email: true,
        },
      },
    },
  });
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { fetchAuthSession } = await import('aws-amplify/auth');
  let authHeaders: Record<string, string> = {};
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;
  } catch {
    // unauthenticated request
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

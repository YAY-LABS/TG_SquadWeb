export default async function fetchAPI(
  method: string,
  path: string,
  body: any = null,
  contentType: string = 'json'
) {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = API_BASE_URL + path;
    const response = await fetch(url, {
      method: method,
      headers:
        contentType === 'json'
          ? {
              Authorization: import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string,
              'Content-Type': 'application/json',
            }
          : {
              Authorization: import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string,
            },
      body: body && contentType === 'json' ? JSON.stringify(body) : body,
    });
    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

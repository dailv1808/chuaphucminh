export const API_BASE_URL = window.API_BASE_URL || 'https://api.chuaphucminh.top';
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE_URL.replace(/\/$/, '')}/${String(endpoint).replace(/^\//, '')}`;
};

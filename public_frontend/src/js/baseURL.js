function getApiUrl(endpoint) {
//  const BASE_URL = 'http://192.168.0.200:8000';
  const BASE_URL = 'https://api.chuaphucminh.top'; // Build PROD
  return BASE_URL.replace(/\/$/, '') + '/' + String(endpoint || '').replace(/^\//, '');
}


import { getApiUrl } from './config.js';
// src/js/logout.js
function logout() {
  localStorage.removeItem('access_token');
  window.location.href = '/login.html';
}

// Central API configuration for all non-module admin scripts.
(function() {
  var DEFAULT_API_BASE_URL = 'https://api.chuaphucminh.top';
  window.API_BASE_URL = window.API_BASE_URL || DEFAULT_API_BASE_URL;
  window.getApiUrl = function(endpoint) {
    if (!endpoint) return window.API_BASE_URL;
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return window.API_BASE_URL.replace(/\/$/, '') + '/' + String(endpoint).replace(/^\//, '');
  };
})();

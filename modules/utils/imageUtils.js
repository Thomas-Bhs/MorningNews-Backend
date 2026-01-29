const ALLOWED_IMAGE_DOMAINS = require('../config/allowedImages');

function isValidImageUrl(url) {
  if (!url) return false;

  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_IMAGE_DOMAINS.includes(hostname) || hostname.endsWith('cloudfront.net');
  } catch (err) {
    return false;
  }
}

module.exports = { isValidImageUrl };

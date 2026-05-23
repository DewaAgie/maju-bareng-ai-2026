import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a unique QR code string for a member.
 */
export const generateQRCodeString = () => {
  return `GYM-${crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
};

/**
 * Generate a unique barcode value for a member.
 */
export const generateBarcodeValue = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${timestamp}${random}`;
};

/**
 * Generate a QR code data URL image from a string.
 */
export const generateQRCodeDataURL = async (text) => {
  return QRCode.toDataURL(text, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};

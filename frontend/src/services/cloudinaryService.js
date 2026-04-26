import axios from 'axios';
import { axiosPublic } from '../config/axiosPublic';

const SIGNATURE_ENDPOINT = '/api/cloudinary/signature';

/**
 * Get signature from backend for signed upload to Cloudinary.
 * @param {string} folder 
 * @param {string} upload_preset 
 * @returns {Promise<{signature: string, timestamp: number, api_key: string, cloud_name: string, upload_preset: string, folder: string}>}
 */
export async function getCloudinarySignature(folder = 'bamboo-academy', upload_preset = null) {
  try {
    const res = await axiosPublic.post(SIGNATURE_ENDPOINT, { folder, upload_preset });
    // if backend returned HTML instead of JSON, throw error
    if (typeof res.data === 'string' && /^\s*<!doctype/i.test(res.data)) {
      throw new Error('Signature endpoint returned HTML. Check backend URL/proxy.');
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get cloudinary signature', err.response?.data || err.message || err);
    throw err;
  }
}

/**
 * Upload file directly to Cloudinary using a signature from our backend.
 * @param {File} file 
 * @param {string} folder 
 * @param {string} upload_preset 
 * @returns {Promise<any>}
 */
export async function uploadFileToCloudinary(file, folder = 'bamboo-academy', upload_preset = null) {
  const sig = await getCloudinarySignature(folder, upload_preset);
  const cloudName = sig.cloud_name;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sig.api_key);
  fd.append('timestamp', sig.timestamp);
  fd.append('signature', sig.signature);
  if (sig.upload_preset) fd.append('upload_preset', sig.upload_preset);
  if (sig.folder) fd.append('folder', sig.folder);

  try {
    // Avoid withCredentials for Cloudinary
    const res = await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data; // contains secure_url
  } catch (err) {
    console.error('Cloudinary upload error', err.response?.data || err.message || err);
    const msg = err.response?.data?.error?.message || 'Cloudinary upload failed';
    throw new Error(msg);
  }
}

export default { getCloudinarySignature, uploadFileToCloudinary };

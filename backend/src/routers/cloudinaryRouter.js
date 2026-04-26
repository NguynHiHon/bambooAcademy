const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

// POST /api/cloudinary/signature
// Body: { folder?: string, upload_preset?: string }
// Returns: { signature, timestamp, api_key, cloud_name, upload_preset }
router.post('/signature', (req, res) => {
  try {
    const { folder, upload_preset } = req.body || {};

    const apiSecret = process.env.API_SECRET_CLOUDINARY;
    const apiKey = process.env.API_KEY_CLOUDINARY;
    const cloudName = process.env.CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return res.status(500).json({ message: 'Cloudinary not configured on server (CLOUD_NAME/API_KEY_CLOUDINARY/API_SECRET_CLOUDINARY).' });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build parameters to sign. Cloudinary expects parameters sorted by key.
    const paramsToSign = {};
    paramsToSign.timestamp = timestamp;
    if (folder) paramsToSign.folder = folder;
    if (upload_preset) paramsToSign.upload_preset = upload_preset;

    const keys = Object.keys(paramsToSign).sort();
    const stringToSign = keys.map(k => `${k}=${paramsToSign[k]}`).join('&');

    const signature = crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');

    return res.json({
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      upload_preset: upload_preset || null,
      folder: folder || null,
    });
  } catch (err) {
    console.error('signature error', err);
    return res.status(500).json({ message: 'Failed to generate signature' });
  }
});

module.exports = router;

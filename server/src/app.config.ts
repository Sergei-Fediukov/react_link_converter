export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.API_HOST || 'http://localhost:3000',
  db: process.env.DB_URI,
  attachment: {
    expirationInterval: process.env.ATTACHMENT_LIVE_TIME || '15m',
  },
  requestTimeout: 30 * 1000,
  fileUpload: {
    isRemoteUpload: process.env.IS_REMOTE_UPLOAD_ENABLED === 'true' || false,
  },
  cloudinary: {
    cloudName: process.env.CLD_CLOUD_NAME,
    apiKey: process.env.CLD_API_KEY,
    apiSecret: process.env.CLD_API_SECRET,
  },
})

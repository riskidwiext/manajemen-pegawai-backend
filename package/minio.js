const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : undefined,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

console.log(process.env.MINIO_ENDPOINT)

module.exports = minioClient;
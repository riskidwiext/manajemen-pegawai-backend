const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'cdnapi.riski-labs.site', 
  useSSL: true,
  accessKey: 'minio',    
  secretKey: 'Poweranger@90', 
});

module.exports = minioClient;
const mongoose = require('mongoose');

const fileNodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['folder', 'file'], required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'FileNode', default: null },
  path: { type: String, required: true },  // misal: /folder1/folder2/file.txt
  minioObjectName: { type: String },       // nama object di MinIO, kalau type file
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FileNode', fileNodeSchema);
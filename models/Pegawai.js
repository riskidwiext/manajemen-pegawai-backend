const mongoose = require('mongoose');

const pegawaiSchema = new mongoose.Schema({
  NIP: { type: String, required: true, unique: true },
  PANGKAT: String,
  GOL: String,
  TMT: String,
  JABATAN: String,
  TMT_JABATAN_STRUKTURAL: String,
  MASA_KERJA: {
    TAHUN: Number,
    BULAN: Number
  },
  PENDIDIKAN: {
    FAKULTAS: String,
    JURUSAN: String,
    TAHUN_LULUS: Number
  },
  DIKLAT_JABATAN_STRUKTURAL: String,
  TAHUN_DIklAT: Number,
  USIA: Number
}, { collection: 'pegawai', timestamps: true });

module.exports = mongoose.model('Pegawai', pegawaiSchema);
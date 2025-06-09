const mongoose = require('mongoose');

const NotifikasiSchema = new mongoose.Schema({
  nama: String, // Nama pegawai
  nip: String,
  tipe: String, // "Kenaikan Pangkat" / "Kenaikan Gaji"
  tanggal: Date, // Tanggal kenaikan
  pesan: String,
  sudahDibaca: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notifikasi', NotifikasiSchema);
const mongoose = require('mongoose');

const GlobalConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // contoh: "kenaikan_pangkat_tahun"
  value: { type: mongoose.Schema.Types.Mixed, required: true } // bisa Number, String, Object, dsb
});

module.exports = mongoose.model('GlobalConfig', GlobalConfigSchema);
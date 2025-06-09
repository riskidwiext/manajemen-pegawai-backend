const express = require('express');
const Notifikasi = require('../models/Notifikasi');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const notif = await Notifikasi.find().sort({ createdAt: -1 }).limit(50);
    res.json({
      response_code: "S20013",
      message: "Daftar notifikasi berhasil diambil.",
      data: notif
    });
  } catch (err) {
    res.status(500).json({
      response_code: "E50013",
      message: "Gagal mengambil notifikasi.",
      data: null
    });
  }
});

module.exports = router;
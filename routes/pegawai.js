const express = require('express');
const Pegawai = require('../models/Pegawai');
const PegawaiResponse = require('../constants/pegawaiResponse');
const GlobalConfig = require('../models/GlobalConfig'); // Ganti ke GlobalConfig
const router = express.Router();

// Create
router.post('/', async (req, res) => {
  try {
    const pegawai = new Pegawai(req.body);
    await pegawai.save();
    res.status(PegawaiResponse.SUCCESS_CREATE.code).json({
      response_code: PegawaiResponse.SUCCESS_CREATE.iso,
      message: PegawaiResponse.SUCCESS_CREATE.message,
      data: pegawai
    });
  } catch (err) {
    let resp = PegawaiResponse.GENERAL_CREATE_ERROR;
    if (err.code === 11000) {
      resp = PegawaiResponse.DUPLICATE_NIP;
    } else if (err.name === 'ValidationError') {
      resp = PegawaiResponse.VALIDATION_ERROR;
    }
    res.status(resp.code).json({
      response_code: resp.iso,
      message: resp.message,
      data: null
    });
  }
});

// Read all with pagination & filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.NIP) filter.NIP = { $regex: req.query.NIP, $options: 'i' };
    if (req.query.JABATAN) filter.JABATAN = { $regex: req.query.JABATAN, $options: 'i' };
    if (req.query.PANGKAT) filter.PANGKAT = { $regex: req.query.PANGKAT, $options: 'i' };
    if (req.query.GOL) filter.GOL = { $regex: req.query.GOL, $options: 'i' };

    const [pegawai, total] = await Promise.all([
      Pegawai.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Pegawai.countDocuments(filter)
    ]);

    res.json({
      response_code: PegawaiResponse.SUCCESS_GET.iso,
      message: PegawaiResponse.SUCCESS_GET.message,
      data: pegawai,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(PegawaiResponse.GENERAL_GET_ERROR.code).json({
      response_code: PegawaiResponse.GENERAL_GET_ERROR.iso,
      message: PegawaiResponse.GENERAL_GET_ERROR.message,
      data: null
    });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const pegawai = await Pegawai.findById(req.params.id);
    if (!pegawai) return res.status(PegawaiResponse.NOT_FOUND.code).json({
      response_code: PegawaiResponse.NOT_FOUND.iso,
      message: PegawaiResponse.NOT_FOUND.message,
      data: null
    });
    res.json({
      response_code: PegawaiResponse.SUCCESS_GET.iso,
      message: PegawaiResponse.SUCCESS_GET.message,
      data: pegawai
    });
  } catch (err) {
    res.status(PegawaiResponse.INVALID_ID.code).json({
      response_code: PegawaiResponse.INVALID_ID.iso,
      message: PegawaiResponse.INVALID_ID.message,
      data: null
    });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const pegawai = await Pegawai.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pegawai) return res.status(PegawaiResponse.NOT_FOUND.code).json({
      response_code: PegawaiResponse.NOT_FOUND.iso,
      message: PegawaiResponse.NOT_FOUND.message,
      data: null
    });
    res.json({
      response_code: PegawaiResponse.SUCCESS_UPDATE.iso,
      message: PegawaiResponse.SUCCESS_UPDATE.message,
      data: pegawai
    });
  } catch (err) {
    let resp = PegawaiResponse.GENERAL_UPDATE_ERROR;
    if (err.name === 'ValidationError') {
      resp = PegawaiResponse.UPDATE_VALIDATION_ERROR;
    }
    res.status(resp.code).json({
      response_code: resp.iso,
      message: resp.message,
      data: null
    });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const pegawai = await Pegawai.findByIdAndDelete(req.params.id);
    if (!pegawai) return res.status(PegawaiResponse.NOT_FOUND.code).json({
      response_code: PegawaiResponse.NOT_FOUND.iso,
      message: PegawaiResponse.NOT_FOUND.message,
      data: null
    });
    res.json({
      response_code: PegawaiResponse.SUCCESS_DELETE.iso,
      message: PegawaiResponse.SUCCESS_DELETE.message,
      data: null
    });
  } catch (err) {
    res.status(PegawaiResponse.GENERAL_DELETE_ERROR.code).json({
      response_code: PegawaiResponse.GENERAL_DELETE_ERROR.iso,
      message: PegawaiResponse.GENERAL_DELETE_ERROR.message,
      data: null
    });
  }
});

// Matriks jumlah pegawai per unit (untuk chart)
router.get('/dashboard/per-unit', async (req, res) => {
  try {
    const data = await Pegawai.aggregate([
      { $group: { _id: "$JABATAN", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Generate kode 2 huruf kapital unik untuk setiap jabatan
    const kodeSet = new Set();
    const kodeMap = {};
    data.forEach(item => {
      let kode;
      do {
        kode = Math.random().toString(36).substring(2, 4).toUpperCase();
      } while (kodeSet.has(kode) || !/^[A-Z]{2}$/.test(kode));
      kodeSet.add(kode);
      kodeMap[item._id] = kode;
    });

    const categories = data.map(item => kodeMap[item._id]);
    const legend = data.map(item => `${kodeMap[item._id]}: ${item._id || 'LAINNYA'}`);
    const series = data.map(item => item.count);

    res.json({
      response_code: "S20011",
      message: "Data pegawai per unit berhasil diambil.",
      data: {
        categories, // kode random 2 huruf untuk chart
        legend,     // kode:jabatan untuk legend chart
        series
      }
    });
  } catch (err) {
    res.status(500).json({
      response_code: "E50011",
      message: "Gagal mengambil data pegawai per unit.",
      data: null
    });
  }
});

// Dashboard summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const totalPegawai = await Pegawai.countDocuments();

    // Ambil konfigurasi kenaikan pangkat dari GlobalConfig (default 4 tahun jika belum ada)
    let config = await GlobalConfig.findOne({ key: "kenaikan_pangkat_tahun" });
    const tahunKenaikan = config ? config.value : 4;

    // Ambil tanggal hari ini
    const now = new Date();

    // Cari pegawai yang akan naik pangkat dalam 3 bulan ke depan
    const pegawai = await Pegawai.find({ TMT: { $exists: true, $ne: null } });

    const pegawaiAkanNaik = pegawai.filter(p => {
      // TMT format: "dd/mm/yyyy"
      const [day, month, year] = (p.TMT || '').split('/');
      if (!day || !month || !year) return false;
      const tmtDate = new Date(`${year}-${month}-${day}`);
      const nextKenaikan = new Date(tmtDate);
      nextKenaikan.setFullYear(nextKenaikan.getFullYear() + tahunKenaikan);

      // 3 bulan ke depan
      const batas = new Date(now);
      batas.setMonth(batas.getMonth() + 3);

      return nextKenaikan > now && nextKenaikan <= batas;
    });

    res.json({
      response_code: "S20012",
      message: "Summary dashboard berhasil diambil.",
      data: {
        totalPegawai,
        tahunKenaikan,
        jumlahAkanNaik: pegawaiAkanNaik.length,
        pegawaiAkanNaik
      }
    });
  } catch (err) {
    res.status(500).json({
      response_code: "E50012",
      message: "Gagal mengambil summary dashboard.",
      data: null
    });
  }
});

module.exports = router;
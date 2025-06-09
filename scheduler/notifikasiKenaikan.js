const Pegawai = require('../models/Pegawai');
const Notifikasi = require('../models/Notifikasi');
const GlobalConfig = require('../models/GlobalConfig');

async function generateNotifikasi() {
  try {
    // Ambil config hari minimal notifikasi
    const configHari = await GlobalConfig.findOne({ key: "notif_min_hari" });
    const minHari = configHari ? configHari.value : 90;

    // Ambil config tahun kenaikan pangkat/gaji
    const configPangkat = await GlobalConfig.findOne({ key: "kenaikan_pangkat_tahun" });
    const tahunPangkat = configPangkat ? configPangkat.value : 4;

    const configGaji = await GlobalConfig.findOne({ key: "kenaikan_gaji_tahun" });
    const tahunGaji = configGaji ? configGaji.value : 2;

    const now = new Date();
    const batas = new Date(now);
    batas.setDate(batas.getDate() + minHari);

    const pegawai = await Pegawai.find();

    let notifCount = 0;

    for (const p of pegawai) {
      // --- Kenaikan Pangkat ---
      if (p.TMT) {
        const [day, month, year] = (p.TMT || '').split('/');
        if (day && month && year) {
          const tmtDate = new Date(`${year}-${month}-${day}`);
          const nextPangkat = new Date(tmtDate);
          nextPangkat.setFullYear(nextPangkat.getFullYear() + tahunPangkat);

          if (nextPangkat > now && nextPangkat <= batas) {
            // Cek sudah ada notifikasi serupa?
            const exist = await Notifikasi.findOne({
              nip: p.NIP,
              tipe: "Kenaikan Pangkat",
              tanggal: nextPangkat
            });
            if (!exist) {
              await Notifikasi.create({
                nama: p.NAMA || '',
                nip: p.NIP,
                tipe: "Kenaikan Pangkat",
                tanggal: nextPangkat,
                pesan: `${p.NAMA || ''} Kenaikan Pangkat pada ${nextPangkat.toISOString().slice(0,10)}`
              });
              notifCount++;
            }
          }
        }
      }
      // --- Kenaikan Gaji (tambahkan logika sesuai kebutuhan) ---
    }

    console.log(`[NOTIFIKASI KENAIKAN] Selesai. Notifikasi baru dibuat: ${notifCount}`);
  } catch (err) {
    console.error('[NOTIFIKASI KENAIKAN] ERROR:', err);
  }
}

module.exports = generateNotifikasi;
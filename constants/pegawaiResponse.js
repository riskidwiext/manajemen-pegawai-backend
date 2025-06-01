const PegawaiResponse = {
  SUCCESS_CREATE: { code: 201, iso: 'S20101', message: 'Pegawai berhasil ditambahkan.' },
  SUCCESS_GET:    { code: 200, iso: 'S20001', message: 'Data pegawai berhasil diambil.' },
  SUCCESS_UPDATE: { code: 200, iso: 'S20002', message: 'Data pegawai berhasil diperbarui.' },
  SUCCESS_DELETE: { code: 200, iso: 'S20003', message: 'Pegawai berhasil dihapus.' },

  NOT_FOUND:      { code: 404, iso: 'E40401', message: 'Pegawai tidak ditemukan.' },
  DUPLICATE_NIP:  { code: 400, iso: 'E40001', message: 'NIP sudah terdaftar.' },
  VALIDATION_ERROR: { code: 400, iso: 'E40002', message: 'Data pegawai tidak lengkap atau tidak valid.' },
  UPDATE_VALIDATION_ERROR: { code: 400, iso: 'E40003', message: 'Data update tidak valid.' },

  GENERAL_CREATE_ERROR: { code: 400, iso: 'E40004', message: 'Gagal menambah pegawai.' },
  GENERAL_UPDATE_ERROR: { code: 400, iso: 'E40005', message: 'Gagal memperbarui data pegawai.' },
  GENERAL_GET_ERROR:    { code: 500, iso: 'E50001', message: 'Terjadi kesalahan saat mengambil data pegawai.' },
  GENERAL_DELETE_ERROR: { code: 500, iso: 'E50002', message: 'Terjadi kesalahan saat menghapus pegawai.' },
  INVALID_ID:           { code: 500, iso: 'E50003', message: 'ID tidak valid atau terjadi kesalahan saat mengambil data pegawai.' }
};

module.exports = PegawaiResponse;
# Manajemen Pegawai Backend

Backend aplikasi manajemen pegawai menggunakan Node.js, Express, MongoDB, dan MinIO.

## Fitur

- **Manajemen User**: Registrasi, login, autentikasi JWT.
- **Manajemen File**: Upload, download, hapus, rename file/folder (MinIO & MongoDB).
- **Manajemen Pegawai**: CRUD data pegawai, filter, pagination.
- **Dashboard**: Endpoint matriks/statistik pegawai untuk kebutuhan chart (ApexCharts).

## Instalasi

1. **Clone repo**
   ```sh
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Buat file `.env`**
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/namadb
   JWT_SECRET=your_jwt_secret
   ```

4. **Jalankan server**
   ```sh
   npm run dev
   ```

## Struktur API

### User
- `POST   /api/users/register` — Registrasi user
- `POST   /api/users/login` — Login user

### File Manager
- `GET    /api/files/list/:parentId?` — List file/folder
- `POST   /api/files/upload` — Upload file
- `GET    /api/files/download/:id` — Download file
- `DELETE /api/files/delete/:id` — Hapus file/folder
- `PUT    /api/files/rename/:id` — Rename file/folder

### Pegawai
- `POST   /api/pegawai` — Tambah pegawai
- `GET    /api/pegawai` — List pegawai (support filter & pagination)
- `GET    /api/pegawai/:id` — Detail pegawai
- `PUT    /api/pegawai/:id` — Update pegawai
- `DELETE /api/pegawai/:id` — Hapus pegawai

#### Filter & Pagination
Contoh:
```
GET /api/pegawai?JABATAN=Kepala&GOL=IVb&page=1&limit=5
```

#### Dashboard Matriks
- `GET /api/pegawai/dashboard/matriks` — Statistik total, per golongan, jabatan, pangkat
- `GET /api/pegawai/dashboard/per-unit` — Data jumlah pegawai per unit (untuk chart)

## Response Format

```json
{
  "response_code": "S20001",
  "message": "Data pegawai berhasil diambil.",
  "data": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

## Testing dengan curl

- List pegawai:
  ```
  curl "http://localhost:3000/api/pegawai?page=1&limit=10"
  ```
- Filter pegawai:
  ```
  curl "http://localhost:3000/api/pegawai?JABATAN=Kepala"
  ```
- Data untuk chart:
  ```
  curl "http://localhost:3000/api/pegawai/dashboard/per-unit"
  ```

## Catatan

- Field timestamp (`createdAt`, `updatedAt`) otomatis pada data pegawai baru.
- Untuk data lama, update manual jika ingin menambah timestamp.
- Pastikan MinIO dan MongoDB sudah berjalan sebelum menjalankan backend.

---
docker build -t manajemen-pegawai-backend .
docker run -d --network app-network --name manajemen-pegawai-backend -p 8011:8011 manajemen-pegawai-backend

**Lisensi:** MIT
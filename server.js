const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const userRoutes = require('./routes/user');
const fileManagerRoutes = require('./routes/fileManager')
const cors = require('cors');
const pegawaiRouter = require('./routes/pegawai');
const cron = require('node-cron');
const generateNotifikasi = require('./scheduler/notifikasiKenaikan');

const app = express();

app.use(express.json());
// Izinkan semua origin dan method (untuk pengembangan)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use('/api/users', userRoutes);
app.use('/api/files', fileManagerRoutes);
app.use('/api/pegawai', pegawaiRouter);
app.use('/api/notifikasi', require('./routes/notifikasi'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Jalankan setiap menit
cron.schedule('* * * * *', async () => {
  console.log('Menjalankan scheduler notifikasi kenaikan...');
  await generateNotifikasi();
});

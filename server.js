const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const userRoutes = require('./routes/user');
const fileManagerRoutes = require('./routes/fileManager')
const cors = require('cors')
const pegawaiRouter = require('./routes/pegawai');

const app = express();
app.use(cors())
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/files', fileManagerRoutes);
app.use('/api/pegawai', pegawaiRouter);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));

# Gunakan image Node.js LTS yang ringan
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Salin seluruh source code ke dalam container
COPY . .

# Set environment variable agar Node.js berjalan di mode production
ENV NODE_ENV=production

# Copy env production file as .env in container
COPY .env.production .env

# Expose port aplikasi (ganti jika port berbeda)
EXPOSE 8011

# Jalankan aplikasi
CMD ["node", "server.js"]
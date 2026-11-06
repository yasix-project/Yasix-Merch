FROM node:20-alpine

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client (build-time, tidak membutuhkan koneksi database)
RUN npx prisma generate

# Copy source code
COPY . .

# Buat folder uploads jika belum ada
RUN mkdir -p uploads/products uploads/documents

# Expose port backend
EXPOSE 5000

# Perintah menjalankan server Express
CMD ["node", "index.js"]

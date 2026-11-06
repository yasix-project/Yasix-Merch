FROM node:20-alpine

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (termasuk devDependencies sementara untuk prisma generate)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Buat folder uploads jika belum ada
RUN mkdir -p uploads/products uploads/documents

# Expose port backend
EXPOSE 5000

# Perintah menjalankan migrasi skema dan server Express
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]

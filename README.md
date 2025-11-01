# Expense Tracker App

Aplikasi pelacak pengeluaran berbasis Next.js dengan Prisma (PostgreSQL).

## Prasyarat
- Node.js 18+ (disarankan LTS)
- PostgreSQL yang berjalan dan dapat diakses
- npm (atau yarn/pnpm)

## Setup Cepat
1. Salin env contoh menjadi file `.env`.
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` dan isi variabel berikut:
   - `DATABASE_URL` → connection string PostgreSQL (contoh: `postgresql://user:password@localhost:5432/expense_tracker?schema=public`)
   - `JWT_SECRET` → rahasia untuk signing token

3. Instal dependensi.
   ```bash
   npm install
   ```

4. Generate Prisma Client.
   ```bash
   npx prisma generate
   ```

5. Sinkronkan schema ke database (membuat tabel).
   ```bash
   npx prisma db push
   ```

## Menjalankan Aplikasi (Development)
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

## Skrip yang Tersedia
- `npm run dev` → Menjalankan Next.js dev server
- `npm run build` → Build untuk production
- `npm run start` → Menjalankan hasil build

## Prisma
- File schema: `prisma/schema.prisma`
- Generator client output: `app/generated/prisma`

Perintah umum:
- Generate client: `npx prisma generate`
- Push schema ke DB: `npx prisma db push`
- Buka Prisma Studio: `npx prisma studio`

## Troubleshooting
- Error koneksi DB: pastikan `DATABASE_URL` benar dan database dapat diakses.
- Error saat `db seed`: pastikan `ts-node` terpasang, atau ubah script seed untuk menggunakan `tsx` bila diperlukan.
- Perubahan schema tidak terlihat: jalankan ulang `npx prisma generate` setelah mengubah `schema.prisma`.

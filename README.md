# Siber

Website kelas Siber — notes pelajaran, pengumuman, dan kas kelas. Fork dari
[dashboard-basecode](../base/dashboard-basecode) (lihat `plan.md` di sana buat arsitektur dasarnya).

## Akses

- **Publik** (`/`, `/notes`, `/announcements`): cuma judul + ringkasan (excerpt). Gak perlu login.
- **Login** (role apa aja, termasuk `member`): baca isi lengkap notes/pengumuman + lihat kas.
- **Admin**: create/edit/delete notes, pengumuman, transaksi kas, kelola user & role.

## Quickstart

```bash
pnpm install

cp .env.example .env.local
# generate AUTH_SECRET:
openssl rand -base64 33

# Postgres (port 5433 — beda dari basecode biar bisa jalan bareng)
docker compose -f docker/docker-compose.yml up db -d

pnpm db:migrate
pnpm db:seed
# -> print admin login (default: admin@example.com / ChangeMe123!)

pnpm dev
# -> http://localhost:3001
```

Bikin akun buat temen sekelas lewat `/dashboard/users` (assign role `member`, sudah ke-seed
otomatis dengan akses read-only ke notes/pengumuman/kas).

## Fitur khusus (di luar basecode)

| Fitur                                               | Lokasi                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Notes & Pengumuman (satu implementasi, beda `type`) | `src/features/posts/`, route `/dashboard/[section]/*`                                                          |
| Kas                                                 | `src/features/kas/`, route `/dashboard/kas/*`                                                                  |
| List publik (teaser only)                           | `src/app/notes/page.tsx`, `src/app/announcements/page.tsx`                                                     |
| Markdown rendering                                  | `src/features/posts/components/markdown-content.tsx` (react-markdown + remark-gfm + `@tailwindcss/typography`) |

Permission baru: `notes:*`, `announcements:*`, `kas:*` (CRUD granular) — kelola lewat
`/dashboard/roles` sama kayak permission bawaan basecode.

## Docker / port

Biar bisa jalan bareng `dashboard-basecode` tanpa bentrok:

|                 | dashboard-basecode | siber   |
| --------------- | ------------------ | ------- |
| App             | :3000              | :3001   |
| Postgres (host) | :5432              | :5433   |
| DB name         | `dashboard`        | `siber` |

Lihat `plan.md` buat keputusan desain lengkap (kenapa posts digabung, dll).

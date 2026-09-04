# Siber — Plan

Website kelas Siber (`siber.domainnya.my.id`). Fork dari `dashboard-basecode` (lihat basecode-nya di
`E:\Dev\AI\base\dashboard-basecode` untuk arsitektur dasar: Next.js 16, Auth.js, RBAC
permission-based, Drizzle/Postgres, Docker).

## Kebutuhan

- **Notes pelajaran** — materi per topik, markdown.
- **Pengumuman** — sama strukturnya kayak notes, beda kategori aja.
- **Kas** — catatan transaksi (pemasukan/pengeluaran) + saldo berjalan.
- **Akses**: publik cuma liat judul + excerpt (gak liat isi). Login (role apa aja) bisa liat isi
  lengkap notes/pengumuman + kas. Cuma admin yang bisa create/edit/delete.
- Registrasi user: manual oleh admin (`/dashboard/users`), bukan self-register.

## Keputusan desain

- **Notes & Pengumuman = satu tabel `posts`** dibedain lewat kolom `type` ("note" |
  "announcement") — strukturnya identik (title, excerpt, markdown content, author, timestamps),
  jadi satu implementasi dipakai buat dua fitur. Route dashboard-nya juga digabung jadi
  `/dashboard/[section]/*` (section = "notes" atau "announcements") biar gak ada 2x kode yang
  gampang drift.
- **Akses publik vs login**: list publik (`/notes`, `/announcements`) cuma nampilin title+excerpt
  dari `listPostsPublic()` (query khusus, kolom `content` gak pernah di-select). Link "baca
  selengkapnya" ngarah ke `/dashboard/[section]/[id]` — proxy.ts basecode udah otomatis nge-gate
  `/dashboard/*`, jadi gak perlu logic baru buat redirect ke `/login`.
- **Permission baru** (nambah ke RBAC basecode, granular CRUD per resource):
  `notes:{create,read,update,delete}`, `announcements:{create,read,update,delete}`,
  `kas:{create,read,update,delete}`.
- **Role `member`** di-seed default (selain `admin`) — permission read-only ke notes/pengumuman/kas,
  biar admin tinggal assign role ini ke user baru tanpa perlu bikin role manual dulu.
- **Markdown rendering**: `react-markdown` + `remark-gfm`, styling pakai `@tailwindcss/typography`
  (`prose` classes) — cuma di-render di halaman full-content (`/dashboard/[section]/[id]`), gak
  pernah di halaman publik.
- **Kas**: `amount` integer (Rupiah, tanpa desimal), `type` enum `in`/`out`. Saldo dihitung on the
  fly dari `getKasBalance()` (sum in - sum out), bukan kolom running-balance tersimpan.

## Port & DB terpisah dari basecode

Biar `dashboard-basecode` dan `siber` bisa jalan bareng tanpa bentrok:

|                      | dashboard-basecode | siber   |
| -------------------- | ------------------ | ------- |
| App port             | 3000               | 3001    |
| Postgres port (host) | 5432               | 5433    |
| DB name              | `dashboard`        | `siber` |

## Status

- [x] Clone dari basecode, rebrand (nama, homepage, sidebar title)
- [x] Schema: `posts` (notes+pengumuman), `kas_transactions`
- [x] Permission baru + role `member` default di seed
- [x] Fitur posts: query publik (teaser) + query lengkap + CRUD actions + form + markdown render
- [x] Fitur kas: query + CRUD actions + form
- [x] Halaman publik: `/notes`, `/announcements`
- [x] Halaman dashboard: `/dashboard/[section]` (list/new/detail/edit), `/dashboard/kas` (list/new/edit)
- [x] Homepage nampilin pengumuman terbaru
- [x] `tsc` + `eslint` bersih
- [ ] Migrate + seed ke DB live (belum dicoba di sesi ini — jalanin `pnpm docker:up` lalu
      `pnpm db:migrate && pnpm db:seed`)
- [ ] Testing manual oleh pemilik project (diminta jangan dites otomatis dulu)
- [ ] Deploy ke `siber.domainnya.my.id` (belum dibahas — tentuin platform hosting-nya nanti)

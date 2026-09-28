# Dokumentasi Business Profile Management (MVP)

Dokumentasi ini berisi penjelasan arsitektur, kebijakan *Source of Truth*, otorisasi role, spesifikasi API lengkap beserta contoh payload request/response, dan petunjuk pengujian Postman untuk modul **Business Profile Management** pada platform **Katamereka.id**.

---

## 1. Konsep & Source of Truth Policy

1. **External Data Provider**:
   - Data bisnis awal dapat diperoleh dari provider eksternal (Geoapify/Google).
   - Selama bisnis **belum diklaim** (`is_claimed = false`), sync eksternal dapat memperbarui informasi lokasi dan alamat.

2. **Owner-Managed Data (Source of Truth)**:
   - Setelah bisnis **berhasil diklaim** (`is_claimed = true`), data yang dikelola oleh Owner/Admin bisnis menjadi **Source of Truth Utama** untuk platform Katamereka.
   - Apabila dilakukan sync ulang dari Geoapify, sistem **TIDAK AKAN MENIMPA/OVERWRITE** data yang dikelola owner (`name`, `description`, `phone`, `email`, `website`, `address`, `category`, `logo_url`, `cover_url`, `opening_hours`, `social_media`). Sync eksternal hanya akan memperbarui data teknis seperti `external_synced_at`.

---

## 2. Hak Akses (Authorization Matrix)

Pengecekan keamanan menggunakan `AuthGuard('jwt')`, `BusinessMemberGuard`, dan `BusinessRoleGuard`:

| Endpoint | HTTP Method | Min. Role | Keterangan |
| :--- | :--- | :--- | :--- |
| `/businesses/:businessId/profile` | `GET` | `MEMBER` | Owner, Admin, & Member dapat melihat profil |
| `/businesses/:businessId/profile` | `PATCH` | `ADMIN` | Hanya Owner & Admin yang dapat mengedit profil |
| `/businesses/:businessId/logo` | `POST` | `ADMIN` | Hanya Owner & Admin yang dapat upload logo |
| `/businesses/:businessId/cover` | `POST` | `ADMIN` | Hanya Owner & Admin yang dapat upload cover |
| `/businesses/:businessId/logo` | `DELETE` | `ADMIN` | Hanya Owner & Admin yang dapat hapus/reset logo |
| `/businesses/:businessId/cover` | `DELETE` | `ADMIN` | Hanya Owner & Admin yang dapat hapus/reset cover |
| `/businesses/public-profile/:slug` | `GET` | Public | Tanpa Auth, pembacaan publik dari PostgreSQL |

---

## 3. Spesifikasi Endpoint & Contoh Payload Response

### 1. View Managed Business Profile
* **URL**: `GET /businesses/:businessId/profile`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Berhasil mengambil profil manajemen bisnis",
  "data": {
    "id": "7c9e1234-88ab-4711-9a99-123456789abc",
    "name": "TransGO Rental Jakarta",
    "slug": "transgo-rental-jakarta",
    "description": "Jasa rental mobil lepas kunci dan dengan driver terbaik di Jakarta.",
    "phone": "081234567890",
    "email": "hello@transgo.id",
    "website": "https://transgo.id",
    "address": "Jl. Raya Pasar Minggu No. 12",
    "city": "Jakarta Selatan",
    "province": "DKI Jakarta",
    "postal_code": "12510",
    "category": "Car Rental",
    "categories": ["Car Rental", "Transportation"],
    "logo_url": "/uploads/logos/1727530000000-123456789.png",
    "cover_url": "/uploads/covers/1727530000000-987654321.jpg",
    "opening_hours": {
      "monday": { "open": "08:00", "close": "21:00", "closed": false },
      "tuesday": { "open": "08:00", "close": "21:00", "closed": false },
      "wednesday": { "open": "08:00", "close": "21:00", "closed": false },
      "thursday": { "open": "08:00", "close": "21:00", "closed": false },
      "friday": { "open": "08:00", "close": "21:00", "closed": false },
      "saturday": { "open": "09:00", "close": "18:00", "closed": false },
      "sunday": { "open": null, "close": null, "closed": true }
    },
    "social_media": {
      "instagram": "https://instagram.com/transgo.id",
      "facebook": null,
      "tiktok": "https://tiktok.com/@transgo.id",
      "linkedin": null
    },
    "latitude": -6.2738,
    "longitude": 106.8412,
    "profile_completion": 100,
    "profile_completed": true
  }
}
```

---

### 2. Update Business Profile (Partial Update)
* **URL**: `PATCH /businesses/:businessId/profile`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`, `Content-Type: application/json`
* **Request Body (Payload)**:
```json
{
  "name": "TransGO Rental & Travel Jakarta",
  "description": "Layanan sewa mobil mewah dan bus pariwisata 24 jam.",
  "phone": "081234567890",
  "email": "contact@transgo.id",
  "website": "https://transgo.id",
  "address": "Jl. Raya Pasar Minggu No. 15",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "postal_code": "12510",
  "category": "Car Rental",
  "opening_hours": {
    "monday": { "open": "07:00", "close": "22:00", "closed": false },
    "sunday": { "open": "08:00", "close": "20:00", "closed": false }
  },
  "social_media": {
    "instagram": "https://instagram.com/transgo.official",
    "tiktok": "https://tiktok.com/@transgo.official"
  }
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profil bisnis berhasil diperbarui",
  "data": {
    "id": "7c9e1234-88ab-4711-9a99-123456789abc",
    "name": "TransGO Rental & Travel Jakarta",
    "description": "Layanan sewa mobil mewah dan bus pariwisata 24 jam.",
    "phone": "081234567890",
    "email": "contact@transgo.id",
    "website": "https://transgo.id",
    "address": "Jl. Raya Pasar Minggu No. 15",
    "city": "Jakarta Selatan",
    "province": "DKI Jakarta",
    "postal_code": "12510",
    "category": "Car Rental",
    "logo_url": "/uploads/logos/1727530000000-123456789.png",
    "cover_url": "/uploads/covers/1727530000000-987654321.jpg",
    "opening_hours": {
      "monday": { "open": "07:00", "close": "22:00", "closed": false },
      "sunday": { "open": "08:00", "close": "20:00", "closed": false }
    },
    "social_media": {
      "instagram": "https://instagram.com/transgo.official",
      "tiktok": "https://tiktok.com/@transgo.official"
    },
    "profile_completion": 100,
    "profile_completed": true
  }
}
```

---

### 3. Upload Business Logo
* **URL**: `POST /businesses/:businessId/logo`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`
* **Body Type**: `multipart/form-data`
* **Key**: `file` (File gambar `.jpg`, `.jpeg`, `.png`, `.webp`, Max 5MB)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logo bisnis berhasil diunggah",
  "data": {
    "logo_url": "/uploads/logos/1727538901234-567890123.png",
    "profile_completion": 100,
    "profile_completed": true
  }
}
```

---

### 4. Upload Business Cover Photo
* **URL**: `POST /businesses/:businessId/cover`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`
* **Body Type**: `multipart/form-data`
* **Key**: `file` (File gambar `.jpg`, `.jpeg`, `.png`, `.webp`, Max 5MB)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Foto cover bisnis berhasil diunggah",
  "data": {
    "cover_url": "/uploads/covers/1727538909876-123456789.jpg"
  }
}
```

---

### 5. Delete / Reset Logo
* **URL**: `DELETE /businesses/:businessId/logo`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logo bisnis berhasil dihapus"
}
```

---

### 6. Delete / Reset Cover Photo
* **URL**: `DELETE /businesses/:businessId/cover`
* **Header**: `Authorization: Bearer <TOKEN_OWNER_OR_ADMIN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Foto cover bisnis berhasil dihapus"
}
```

---

### 7. Public Business Profile (Frontfacing)
* **URL**: `GET /businesses/public-profile/:slug` (atau `GET /businesses/slug/:slug`)
* **Header**: None (Tanpa Authentication)
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "7c9e1234-88ab-4711-9a99-123456789abc",
    "slug": "transgo-rental-jakarta",
    "name": "TransGO Rental & Travel Jakarta",
    "description": "Layanan sewa mobil mewah dan bus pariwisata 24 jam.",
    "logo_url": "/uploads/logos/1727538901234-567890123.png",
    "cover_url": "/uploads/covers/1727538909876-123456789.jpg",
    "category": "Car Rental",
    "address": "Jl. Raya Pasar Minggu No. 15",
    "city": "Jakarta Selatan",
    "province": "DKI Jakarta",
    "phone": "081234567890",
    "email": "contact@transgo.id",
    "website": "https://transgo.id",
    "opening_hours": {
      "monday": { "open": "07:00", "close": "22:00", "closed": false },
      "sunday": { "open": "08:00", "close": "20:00", "closed": false }
    },
    "social_media": {
      "instagram": "https://instagram.com/transgo.official",
      "tiktok": "https://tiktok.com/@transgo.official"
    },
    "average_rating": 4.8,
    "review_count": 24
  }
}
```

---

## 4. Petunjuk Praktis Pengujian di Postman

1. **Login User Owner/Admin**:
   - `POST http://localhost:3000/auth/login` -> Ambil `accessToken`.
2. **Lihat Profil Manajemen**:
   - `GET http://localhost:3000/businesses/<BUSINESS_ID>/profile` dengan Header `Authorization: Bearer <TOKEN>`.
3. **Edit Profil Bisnis**:
   - `PATCH http://localhost:3000/businesses/<BUSINESS_ID>/profile` dengan JSON body sesuai spesifikasi.
4. **Upload Logo & Cover**:
   - `POST http://localhost:3000/businesses/<BUSINESS_ID>/logo` (body: `form-data`, key `file`).
   - `POST http://localhost:3000/businesses/<BUSINESS_ID>/cover` (body: `form-data`, key `file`).
5. **Cek Tampilan Profil Publik**:
   - `GET http://localhost:3000/businesses/public-profile/<SLUG>` -> Pastikan data terbaru dari PostgreSQL tampil tanpa filter private audit.

# **Begal Backend**

**Begal Backend** adalah aplikasi backend untuk sistem e-commerce dengan fitur penjualan galon dan minuman lainnya. Aplikasi ini dikembangkan sebagai bagian dari **Final Project Tim 4** dalam program **Productzilla MSIB Kampus Merdeka**.

## **Table of Contents**
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## **Features**
- **User Authentication**: Autentikasi berbasis JWT.
- **Role-based Authorization**: Peran `user` dan `seller`.
- **CRUD Operations**:
  - Manajemen Produk
  - Pesanan
  - Ulasan
- **Payment Gateway Integration**: Terhubung dengan Midtrans.
- **Cloud Image Upload**: Upload gambar menggunakan Cloudinary.
- **Email Service**: Fitur lupa password.
- **Rating & Review System**: Ulasan terhubung dengan seller rating secara otomatis.

---

## **Tech Stack**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (dengan Mongoose)
- **Cloud Services**: 
  - Cloudinary (Image Upload)
  - Midtrans (Payment Gateway)
- **Other**: TypeScript, Zod (Validation), Swagger (API Documentation)

---

## **Getting Started**

### **Prerequisites**
1. Install [Node.js](https://nodejs.org/) (v16 atau lebih baru).
2. Install [MongoDB](https://www.mongodb.com/) atau gunakan solusi hosted seperti MongoDB Atlas.

### **Installation**
1. Clone repository ini:
   ```bash
   git clone https://github.com/rezkysyaputra/begal-backend.git
   cd begal-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables dengan membuat file `.env` di root project (lihat [Environment Variables](#environment-variables)).

### **Running the App**
- **Development**: 
  ```bash
  npm run dev
  ```
- **Production**: 
  ```bash
  npm run start
  ```

### **Testing**
Untuk menjalankan tes:
```bash
npm run test
```

---

## **Environment Variables**
Buat file `.env` di direktori root dengan isi seperti berikut:
```env
PORTS=3000

MONGO_URI="your_mongo_connection_string"

JWT_SECRET="your_jwt_secret"

CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_SERVER_KEY="your_midtrans_server_key"
MIDTRANS_APP_URL="https://app.sandbox.midtrans.com/snap/v1/transactions"

NODE_ENV="development"

EMAIL_USER="your_email"
EMAIL_PASS="your_email_password"
BASE_URL="your_base_api_url"
```

---

## **API Documentation**
Dokumentasi API dibuat menggunakan **Swagger**.

### **Akses Dokumentasi API**
Setelah server dijalankan, buka [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

---

# Setup Google Analytics untuk JD'SIGN Marketplace

## Langkah-langkah Setup:

### 1. Buat Akun Google Analytics
- Kunjungi: https://analytics.google.com
- Klik "Start measuring"
- Masukkan nama account: "JD'SIGN Marketplace"
- Pilih data sharing settings
- Klik "Next"

### 2. Setup Property
- Property name: "JD'SIGN Marketplace"
- Reporting time zone: "Asia/Jakarta"
- Currency: "Indonesian Rupiah (IDR)"
- Klik "Next"

### 3. Business Information
- Industry category: "Technology"
- Business size: Pilih sesuai kebutuhan
- How you plan to use Google Analytics: Pilih yang relevan
- Klik "Create"

### 4. Dapatkan Measurement ID
- Setelah property dibuat, Anda akan mendapat Measurement ID
- Format: G-XXXXXXXXXX
- Copy Measurement ID ini

### 5. Install di Website
Tambahkan ke `src/App.tsx`:

```tsx
import GoogleAnalytics from './components/GoogleAnalytics';

// Di dalam App component, tambahkan:
<GoogleAnalytics measurementId="G-XXXXXXXXXX" />
```

### 6. Setup Goals
- Masuk ke Admin > Goals
- Buat goal untuk:
  - Product views
  - Add to cart
  - Checkout completion
  - Contact form submissions

### 7. Monitor Performance
- Real-time reports
- Audience insights
- Traffic sources
- Conversion tracking

## URL Website: https://my-marketplace-sigma.vercel.app

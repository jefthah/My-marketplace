import React from 'react'
import { Link } from 'react-router-dom'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-white to-blue-50 flex items-start justify-center py-16">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-blue-900">Kebijakan Privasi</h1>
          <p className="text-sm text-blue-600 mt-2">Terakhir diperbarui: 1 Januari 2025</p>
        </header>

        <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Kami menghargai privasi Anda. Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan
            melindungi informasi pribadi Anda ketika Anda menggunakan layanan kami.
          </p>

          <h2 className="font-medium text-base text-blue-800">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Informasi dapat mencakup nama, alamat email, informasi pembayaran (jika relevan), serta data penggunaan
            yang dihasilkan saat Anda menavigasi situs.
          </p>

          <h2 className="font-medium text-base text-blue-800">2. Penggunaan Informasi</h2>
          <p>
            Kami menggunakan data untuk menyediakan layanan, memproses pembayaran, meningkatkan pengalaman pengguna,
            serta mengirimkan pemberitahuan penting mengenai akun dan transaksi.
          </p>

          <h2 className="font-medium text-base text-blue-800">3. Keamanan</h2>
          <p>
            Kami menerapkan langkah-langkah teknis dan prosedural untuk melindungi informasi Anda. Namun, tidak ada
            metode transmisi melalui internet yang sepenuhnya aman.
          </p>

          <h2 className="font-medium text-base text-blue-800">4. Hak Anda</h2>
          <p>
            Anda dapat meminta akses, pembaruan, atau penghapusan data pribadi Anda sesuai dengan undang-undang yang
            berlaku. Silakan hubungi kami jika Anda ingin menggunakan hak tersebut.
          </p>

          <h2 className="font-medium text-base text-blue-800">Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan kirim email ke
            <a href="mailto:jdsign28@gmail.com" className="text-blue-600 underline ml-1">jdsign28@gmail.com</a>.
          </p>
        </section>

        <footer className="mt-8 text-right">
          <Link to="/" className="text-sm text-blue-700 hover:underline">Kembali ke Beranda</Link>
        </footer>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage

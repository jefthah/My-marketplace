const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({ // Fixed: createTransport (without 'er')
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Optimizations for faster email delivery
      pool: true, // use pooled connections
      maxConnections: 5, // limit connections
      maxMessages: 100, // limit messages per connection
      rateDelta: 1000, // 1 second between messages
      rateLimit: 5, // max 5 messages per rateDelta
      // Connection timeout configurations
      connectionTimeout: 2 * 60 * 1000, // 2 minutes
      socketTimeout: 2 * 60 * 1000, // 2 minutes
      greetingTimeout: 30 * 1000, // 30 seconds
      // Additional optimizations
      logger: false, // disable logging for performance
      debug: false, // disable debug for performance
      // Retry configuration
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Create direct transporter for critical emails (faster)
  createDirectTransporter() {
    return nodemailer.createTransport({ // Fixed: createTransport (without 'er')
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Direct connection - no pooling for immediate send
      pool: false,
      connectionTimeout: 30 * 1000, // 30 seconds
      socketTimeout: 30 * 1000, // 30 seconds
      greetingTimeout: 15 * 1000, // 15 seconds
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendPortfolioSourceCode(email, customerName, orderData, sourceCodeAvailable) {
    try {
      console.log(`🚀 Starting DIRECT email send to: ${email}`);
      console.log(`📁 Source code available: ${sourceCodeAvailable}`);
      
      const startTime = Date.now();
      
      // Use direct transporter for faster delivery
      const directTransporter = this.createDirectTransporter();
      
      // Create download URL - use provided URL or fallback to order page
      const downloadUrl = orderData.downloadUrl || `http://localhost:5173/order/${orderData.orderId}`;
      
      // Add download info to orderData
      const enhancedOrderData = {
        ...orderData,
        downloadUrl,
        sourceCodeFileName: 'source-code.zip' // Generic filename since stored in DB
      };
      
      const mailOptions = {
        from: `JD'SIGN Portfolio <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎯 Source Code Portfolio Website - Order #${orderData.orderNumber}`,
        html: this.getPortfolioDeliveryTemplate(customerName, enhancedOrderData),
        // Remove attachments to avoid Gmail security blocks
        // attachments: [],
        // Priority settings for immediate delivery
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const info = await directTransporter.sendMail(mailOptions);
      
      // Close the direct connection immediately
      directTransporter.close();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ DIRECT email sent successfully in ${duration}ms`);
      console.log(`📧 Message ID: ${info.messageId}`);
      console.log(`✅ Email accepted: ${info.accepted}`);
      console.log(`❌ Email rejected: ${info.rejected}`);
      
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      throw new Error(`Portfolio source code could not be sent: ${error.message}`);
    }
  }

  getPortfolioDeliveryTemplate(customerName, orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Source Code Portfolio Website</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .download-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10B981; }
          .instructions { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          .button { 
            display: inline-block !important; 
            background-color: #4F46E5 !important; 
            color: #ffffff !important; 
            padding: 15px 30px !important; 
            text-decoration: none !important; 
            border-radius: 5px !important; 
            margin: 10px 0 !important; 
            font-weight: bold !important;
            font-size: 16px !important;
            border: none !important;
            mso-padding-alt: 15px 30px !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Source Code Portfolio Website</h1>
            <p>Terima kasih telah mempercayai JD'SIGN!</p>
          </div>
          
          <div class="content">
            <h2>Halo ${customerName}! 👋</h2>
            
            <p>Pembayaran Anda untuk <strong>${orderData.productName}</strong> telah berhasil diproses!</p>
            
            <div class="download-section">
              <h3>📦 Open Source Code</h3>
              <p>Source code portfolio website Anda telah siap untuk diakses!</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${orderData.downloadUrl}" 
                   style="display: inline-block !important; 
                          background-color: #4F46E5 !important; 
                          color: #ffffff !important; 
                          padding: 15px 30px !important; 
                          text-decoration: none !important; 
                          border-radius: 5px !important; 
                          font-weight: bold !important;
                          font-size: 16px !important;
                          font-family: Arial, sans-serif !important;">
                  � Open Source Code
                </a>
              </div>
              
              <p style="font-size: 12px; color: #666; text-align: center;">
                Link akan membuka Google Drive dengan source code Anda. Anda juga bisa mengakses halaman order Anda kapan saja.
              </p>
              
              <p><strong>Yang Anda Dapatkan:</strong></p>
              <ul>
                <li>✅ Complete HTML, CSS, JavaScript source code</li>
                <li>✅ Responsive design untuk semua device</li>
                <li>✅ Modern dan professional layout</li>
                <li>✅ Easy to customize</li>
                <li>✅ Documentation lengkap</li>
              </ul>
            </div>
            
            <div class="instructions">
              <h3>🚀 Cara Download & Customize:</h3>
              <ol>
                <li>Klik tombol "Open Source Code" di atas untuk membuka Google Drive</li>
                <li>Download file ZIP dari Google Drive</li>
                <li>Extract file ZIP yang sudah di-download</li>
                <li>Buka folder dan edit file <code>index.html</code></li>
                <li>Ganti informasi personal di file <code>js/config.js</code></li>
                <li>Upload ke hosting atau gunakan GitHub Pages</li>
                <li>Siap digunakan! 🎊</li>
              </ol>
            </div>
            
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${orderData.orderNumber}</li>
              <li>Product: ${orderData.productName}</li>
              <li>Amount: Rp ${parseInt(orderData.totalAmount).toLocaleString('id-ID')}</li>
              <li>Date: ${new Date(orderData.createdAt).toLocaleDateString('id-ID')}</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://jdsign-portfolio.com/support" 
                 style="display: inline-block !important; 
                        background-color: #10B981 !important; 
                        color: #ffffff !important; 
                        padding: 12px 25px !important; 
                        text-decoration: none !important; 
                        border-radius: 5px !important; 
                        font-weight: bold !important;
                        font-size: 14px !important;
                        font-family: Arial, sans-serif !important;
                        margin: 5px !important;">
                💬 Butuh Bantuan?
              </a>
              <a href="https://jdsign-portfolio.com/gallery" 
                 style="display: inline-block !important; 
                        background-color: #8B5CF6 !important; 
                        color: #ffffff !important; 
                        padding: 12px 25px !important; 
                        text-decoration: none !important; 
                        border-radius: 5px !important; 
                        font-weight: bold !important;
                        font-size: 14px !important;
                        font-family: Arial, sans-serif !important;
                        margin: 5px !important;">
                🎨 Lihat Portfolio Lain
              </a>
            </div>
            
            <div class="footer">
              <p>Jika ada pertanyaan, jangan ragu untuk menghubungi kami!</p>
              <p><strong>JD'SIGN Team</strong><br>
              Email: support@jdsign.com<br>
              WhatsApp: +62-XXX-XXXX-XXXX</p>
              
              <p style="font-size: 12px; color: #999;">
                Email ini dikirim otomatis. Mohon jangan reply ke email ini.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPaymentSuccessEmail(email, username, paymentData) {
    try {
      const mailOptions = {
        from: `JD'SIGN <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Konfirmasi Pembayaran Berhasil - JD\'SIGN',
        html: this.getPaymentSuccessTemplate(username, paymentData),
        priority: 'high'
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment success email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending payment success email:', error);
      throw new Error('Payment success email could not be sent');
    }
  }

  getPaymentSuccessTemplate(username, paymentData) {
    return `<h1>Pembayaran Berhasil!</h1><p>Halo ${username}, pembayaran Anda sebesar Rp ${parseInt(paymentData.amount).toLocaleString('id-ID')} untuk pesanan ${paymentData.orderId} telah berhasil diproses.</p>`;
  }

  async sendPaymentExpiredNotification(notificationData) {
    try {
      const mailOptions = {
        from: `JD'SIGN <${process.env.EMAIL_USER}>`,
        to: notificationData.email,
        subject: 'Transaksi Dibatalkan - Waktu Pembayaran Habis - JD\'SIGN',
        html: this.getPaymentExpiredTemplate(notificationData),
        priority: 'high'
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment expired email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending payment expired email:', error);
      throw new Error('Payment expired email could not be sent');
    }
  }

  getPaymentExpiredTemplate(data) {
    const formattedAmount = parseInt(data.amount).toLocaleString('id-ID');
    const formattedDate = new Date(data.expiredAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaksi Dibatalkan - JD'SIGN</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .alert-icon {
            font-size: 48px;
            color: #e74c3c;
            margin: 20px 0;
          }
          .main-content {
            margin-bottom: 30px;
          }
          .transaction-details {
            background: #f8f9fa;
            border-left: 4px solid #e74c3c;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
          }
          .detail-row {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: bold;
            color: #555;
          }
          .detail-value {
            color: #333;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
          }
          .action-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 10px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
          }
          .warning {
            color: #e74c3c;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">JD'SIGN</div>
            <div class="alert-icon">⚠️</div>
            <h1 style="color: #e74c3c; margin: 0;">Transaksi Dibatalkan</h1>
            <p style="margin: 5px 0; color: #666;">Waktu pembayaran telah habis</p>
          </div>

          <div class="main-content">
            <p>Halo <strong>${data.username}</strong>,</p>
            
            <p>Kami ingin menginformasikan bahwa transaksi Anda telah <span class="warning">dibatalkan secara otomatis</span> karena pembayaran tidak diterima dalam batas waktu yang ditentukan.</p>

            <div class="transaction-details">
              <h3 style="margin-top: 0; color: #e74c3c;">Detail Transaksi:</h3>
              <div class="detail-row">
                <span class="detail-label">ID Transaksi:</span>
                <span class="detail-value">${data.transactionID}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ID Pesanan:</span>
                <span class="detail-value">${data.orderID}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Jumlah:</span>
                <span class="detail-value amount">Rp ${formattedAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Dibatalkan pada:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value warning">EXPIRED</span>
              </div>
            </div>

            <p><strong>Mengapa transaksi dibatalkan?</strong></p>
            <ul>
              <li>Pembayaran tidak diterima dalam waktu <strong>10 menit</strong> setelah transaksi dibuat</li>
              <li>Sistem otomatis membatalkan transaksi untuk menjaga keamanan</li>
              <li>Ini adalah prosedur standar untuk mencegah masalah pembayaran</li>
            </ul>

            <div class="action-section">
              <h3 style="margin-top: 0; color: #856404;">Ingin melanjutkan pembelian?</h3>
              <p>Jangan khawatir! Anda masih bisa melakukan pemesanan ulang dengan mudah.</p>
              <a href="${process.env.FRONTEND_URL}" class="btn">Kembali ke Toko</a>
              <a href="${process.env.FRONTEND_URL}/products" class="btn">Lihat Produk</a>
            </div>

            <p><strong>Tips untuk pembayaran selanjutnya:</strong></p>
            <ul>
              <li>Pastikan Anda menyelesaikan pembayaran dalam waktu 10 menit</li>
              <li>Siapkan metode pembayaran sebelum melakukan checkout</li>
              <li>Jika mengalami masalah, segera hubungi customer service kami</li>
            </ul>
          </div>

          <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem JD'SIGN</p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi support@jdsign.com</p>
            <p style="color: #999; font-size: 10px;">
              © 2024 JD'SIGN. All rights reserved.<br>
              Email ini dikirim karena Anda melakukan transaksi di platform kami.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
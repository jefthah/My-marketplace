// Email service untuk mengirim produk digital via email
export interface EmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    downloadUrl: string;
  }>;
}

export const emailService = {
  // Simulasi mengirim email dengan download links
  sendDownloadLinks: async (emailData: EmailData): Promise<boolean> => {
    try {
      // Simulasi API call ke email service
      console.log('Sending email to:', emailData.customerEmail);
      console.log('Order:', emailData.orderNumber);
      console.log('Items:', emailData.items);

      // Simulate email template
      const emailTemplate = `
        <h2>Thank you for your purchase, ${emailData.customerName}!</h2>
        <p>Your order ${emailData.orderNumber} has been completed.</p>
        <h3>Download Links:</h3>
        <ul>
          ${emailData.items.map(item => `
            <li>
              <strong>${item.name}</strong><br>
              <a href="${item.downloadUrl}" style="color: #3B82F6; text-decoration: underline;">
                Download Now
              </a>
            </li>
          `).join('')}
        </ul>
        <p>These links will be valid for 30 days.</p>
        <p>Thank you for choosing JD'SIGN!</p>
      `;

      // In real implementation, send this to email service API
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Email sent successfully!');
      console.log('Email template:', emailTemplate);

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  // Simulasi membuat download URLs untuk produk
  generateDownloadUrl: (productId: string, orderNumber: string): string => {
    // In real implementation, generate secure temporary download URLs
    const baseUrl = 'https://cdn.jdsign.com/downloads';
    const token = btoa(`${productId}-${orderNumber}-${Date.now()}`);
    return `${baseUrl}/${productId}?token=${token}`;
  },

  // Simulasi validasi email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

export default emailService;

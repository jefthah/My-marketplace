// Simple email queue system
const emailService = require('./emailService'); // Move import to top

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // Add email to queue
  add(emailData) {
    this.queue.push(emailData);
    console.log(`📨 Email added to queue. Queue length: ${this.queue.length}`);
    
    // Start processing if not already processing
    if (!this.processing) {
      this.process();
    }
  }

  // Process queue
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`🔄 Starting email queue processing. Items: ${this.queue.length}`);

    while (this.queue.length > 0) {
      const emailData = this.queue.shift();
      
      try {
        console.log(`📤 Processing email for: ${emailData.email}`);
        
        // Use the imported emailService
        await emailService.sendPortfolioSourceCode(
          emailData.email,
          emailData.customerName,
          emailData.orderData,
          emailData.sourceCodePath
        );
        
        console.log(`✅ Email sent successfully to: ${emailData.email}`);
        
      } catch (error) {
        console.error(`❌ Failed to send email to: ${emailData.email}`, error);
        
        // Retry logic - add back to queue for retry (max 3 attempts)
        if (!emailData.retryCount) {
          emailData.retryCount = 1;
        } else {
          emailData.retryCount++;
        }
        
        if (emailData.retryCount <= 3) {
          console.log(`🔄 Retrying email (attempt ${emailData.retryCount}/3) for: ${emailData.email}`);
          this.queue.push(emailData);
        } else {
          console.error(`❌ Max retries reached for: ${emailData.email}`);
        }
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
    console.log(`✅ Email queue processing completed`);
  }
}

module.exports = new EmailQueue();

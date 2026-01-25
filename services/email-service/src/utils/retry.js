class RetryUtil {
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        // Don't wait after the last attempt
        if (attempt < maxRetries) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RetryUtil();
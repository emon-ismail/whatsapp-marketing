// Simple WhatsApp number checker
export const checkWhatsAppNumber = async (phoneNumber) => {
  try {
    // Clean the phone number
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Method 1: Try to open WhatsApp and check if it redirects properly
    const checkUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=test`;
    
    // Create a hidden iframe to test the URL
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = checkUrl;
      
      let timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false); // Assume no WhatsApp if timeout
      }, 3000);
      
      iframe.onload = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(true); // WhatsApp exists
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(false); // No WhatsApp
      };
      
      document.body.appendChild(iframe);
    });
  } catch (error) {
    console.error('Error checking WhatsApp:', error);
    return false;
  }
};

// Alternative method using fetch (may be blocked by CORS)
export const checkWhatsAppNumberAPI = async (phoneNumber) => {
  try {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // This would require a backend service or CORS proxy
    const response = await fetch(`https://api.whatsapp.com/send?phone=${cleanNumber}`, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking WhatsApp API:', error);
    return false;
  }
};
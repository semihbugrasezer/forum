"use client";

const getSessionClientSide = () => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'your-cookie-name') {
      try {
        if (value.startsWith('base64-')) {
          const encoded = value.replace('base64-', '');
          const decoded = atob(encoded); // Browser ortamı için
          return JSON.parse(decoded);
        }
        return JSON.parse(value);
      } catch (error) {
        console.error('Client cookie parse hatası:', error);
      }
    }
  }
  return null;
}; 
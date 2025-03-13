// WebSocket bağlantısı için yardımcı fonksiyon
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * WebSocket bağlantısını başlatır
 * @param {string} url WebSocket sunucu URL'i
 * @param {Function} onMessage Mesaj alındığında çağrılacak callback
 * @param {Function} onError Hata oluştuğunda çağrılacak callback
 * @returns {WebSocket} WebSocket bağlantısı
 */
export const initiateWebSocket = (
  url = "wss://localhost:3000/ws",
  onMessage = () => {},
  onError = () => {}
) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("WebSocket bağlantısı zaten açık.");
    return ws;
  }

  try {
    console.log("WebSocket bağlantısı başlatılıyor...");
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket bağlantısı başarıyla kuruldu.");
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("WebSocket mesajı işlenirken hata:", error);
        onMessage(event.data);
      }
    };

    ws.onerror = (error) => {
      console.warn("WebSocket bağlantı hatası:", error);
      onError(error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket bağlantısı kapandı. Kod:", event.code);

      // Sayfa kapanırken veya kullanıcı çıkış yaptığında normal kapatma
      if (event.code === 1000 || event.code === 1001) {
        console.log("WebSocket bağlantısı normal şekilde kapatıldı.");
        return;
      }

      // Başarısız bağlantı durumunda tekrar deneme (sadece geliştirme ortamında)
      if (
        process.env.NODE_ENV === "development" &&
        reconnectAttempts < MAX_RECONNECT_ATTEMPTS
      ) {
        reconnectAttempts++;
        console.log(
          `WebSocket yeniden bağlanma girişimi ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`
        );
        setTimeout(() => {
          initiateWebSocket(url, onMessage, onError);
        }, RECONNECT_DELAY);
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(
          "Maksimum yeniden bağlanma denemesi aşıldı. WebSocket bağlantısı devre dışı bırakıldı."
        );
      }
    };

    return ws;
  } catch (error) {
    console.error("WebSocket başlatılırken hata:", error);
    onError(error);
    return null;
  }
};

/**
 * WebSocket bağlantısını kapatır
 */
export const closeWebSocket = () => {
  if (ws) {
    ws.close(1000, "Kullanıcı tarafından kapatıldı");
    ws = null;
    console.log("WebSocket bağlantısı kapatıldı.");
  }
};

/**
 * WebSocket üzerinden mesaj gönderir
 * @param {any} data Gönderilecek veri
 * @returns {boolean} Gönderim başarılı mı?
 */
export const sendWebSocketMessage = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      const message = typeof data === "object" ? JSON.stringify(data) : data;
      ws.send(message);
      return true;
    } catch (error) {
      console.error("WebSocket mesajı gönderilirken hata:", error);
      return false;
    }
  } else {
    console.warn("WebSocket bağlantısı açık değil. Mesaj gönderilemedi.");
    return false;
  }
};

// Geliştirici için yardımcı fonksiyon - WebSocket bağlantısını devre dışı bırak
export const disableWebSocket = () => {
  closeWebSocket();
  console.log("WebSocket bağlantısı devre dışı bırakıldı.");
  // localStorage'a kaydet
  localStorage.setItem("websocketDisabled", "true");
  return true;
};

// Geliştirici için yardımcı fonksiyon - WebSocket bağlantısını etkinleştir
export const enableWebSocket = (url, onMessage, onError) => {
  localStorage.removeItem("websocketDisabled");
  return initiateWebSocket(url, onMessage, onError);
};

// WebSocket bağlantısı etkin mi kontrol et
export const isWebSocketEnabled = () => {
  return localStorage.getItem("websocketDisabled") !== "true";
};

export default {
  initiateWebSocket,
  closeWebSocket,
  sendWebSocketMessage,
  disableWebSocket,
  enableWebSocket,
  isWebSocketEnabled,
};

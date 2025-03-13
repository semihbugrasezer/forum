/**
 * API İstekleri Yardımcı Fonksiyonları
 * Güvenli HTTP istekleri ve API çağrıları için yardımcı fonksiyonlar
 */
import { sanitizeInput, maskApiKey } from "./securityUtils";

/**
 * Ortak fetch tabanlı API istek fonksiyonu
 * @param {string} url - İstek URL'i
 * @param {Object} options - Fetch seçenekleri
 * @return {Promise} - API yanıtı
 */
export const fetchApi = async (url, options = {}) => {
  try {
    const {
      method = "GET",
      headers = {},
      body,
      withCredentials = false,
      timeout = 30000,
      retry = 0,
      retryDelay = 1000,
    } = options;

    // Default headers
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Authorization header ekleme
    if (options.token) {
      defaultHeaders["Authorization"] = `Bearer ${options.token}`;

      // API anahtarı loglama güvenliği
      console.info("API request with token:", maskApiKey(options.token));
    }

    // Timeout işlevi için promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeout);
    });

    // Fetch işlevi için promise
    const fetchPromise = fetch(url, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: withCredentials ? "include" : "same-origin",
    });

    // İstek gönderimi ve timeout kontrolü
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // Yanıt kontrolü
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error ${response.status}`,
      }));

      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    // Yanıt parse işlemi
    const data = await response.json();
    return data;
  } catch (error) {
    // Retry kontrolü
    if (retry > 0) {
      console.log(`API retry attempt left: ${retry}`);

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchApi(url, { ...options, retry: retry - 1 });
    }

    console.error("API request failed:", sanitizeInput(error.message || ""));
    throw error;
  }
};

/**
 * GET isteği gönderir
 * @param {string} url - İstek URL'i
 * @param {Object} options - İstek seçenekleri
 * @return {Promise} - API yanıtı
 */
export const get = (url, options = {}) => {
  return fetchApi(url, { ...options, method: "GET" });
};

/**
 * POST isteği gönderir
 * @param {string} url - İstek URL'i
 * @param {Object} data - Gönderilecek veri
 * @param {Object} options - İstek seçenekleri
 * @return {Promise} - API yanıtı
 */
export const post = (url, data, options = {}) => {
  return fetchApi(url, { ...options, method: "POST", body: data });
};

/**
 * PUT isteği gönderir
 * @param {string} url - İstek URL'i
 * @param {Object} data - Gönderilecek veri
 * @param {Object} options - İstek seçenekleri
 * @return {Promise} - API yanıtı
 */
export const put = (url, data, options = {}) => {
  return fetchApi(url, { ...options, method: "PUT", body: data });
};

/**
 * DELETE isteği gönderir
 * @param {string} url - İstek URL'i
 * @param {Object} options - İstek seçenekleri
 * @return {Promise} - API yanıtı
 */
export const del = (url, options = {}) => {
  return fetchApi(url, { ...options, method: "DELETE" });
};

/**
 * URL parametrelerini güvenli bir şekilde oluşturur
 * @param {Object} params - URL parametreleri
 * @return {string} - URL query string
 */
export const buildQueryParams = (params = {}) => {
  if (!params || Object.keys(params).length === 0) return "";

  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // String olmayan değerleri stringe çevir
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      // Parametreleri sanitize et
      urlParams.append(sanitizeInput(key), sanitizeInput(stringValue));
    }
  });

  return `?${urlParams.toString()}`;
};

/**
 * API hata yönetimi için yardımcı fonksiyon
 * @param {Error} error - Yakalanan hata
 * @return {Object} - Formatlı hata nesnesi
 */
export const handleApiError = (error) => {
  // Orijinal hatayı loglama
  console.error("Original API error:", error);

  // Hata yanıtını formatlama
  const formattedError = {
    message: sanitizeInput(error.message || "Bilinmeyen bir hata oluştu"),
    status: error.status || 500,
    timestamp: new Date().toISOString(),
  };

  return formattedError;
};

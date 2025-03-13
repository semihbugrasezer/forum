/**
 * Form Yardımcı Fonksiyonları
 * Form işlemleri, doğrulama ve güvenli veri işleme için yardımcı fonksiyonlar
 */
import { sanitizeInput, sanitizeHtml } from "./securityUtils";

/**
 * Form girişlerini doğrular ve hata mesajlarını döndürür
 * @param {Object} values - Form değerleri
 * @param {Object} validationRules - Doğrulama kuralları
 * @return {Object} Hata mesajları
 */
export const validateForm = (values, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = values[field];

    // Zorunlu alan kontrolü
    if (rules.required && (!value || value.trim() === "")) {
      errors[field] = rules.requiredMessage || `${field} alanı zorunludur`;
      return;
    }

    // Minimum uzunluk kontrolü
    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] =
        rules.minLengthMessage ||
        `${field} en az ${rules.minLength} karakter olmalıdır`;
      return;
    }

    // Maksimum uzunluk kontrolü
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[field] =
        rules.maxLengthMessage ||
        `${field} en fazla ${rules.maxLength} karakter olmalıdır`;
      return;
    }

    // Email formatı kontrolü
    if (rules.isEmail && value && !/\S+@\S+\.\S+/.test(value)) {
      errors[field] =
        rules.emailMessage || "Geçerli bir e-posta adresi giriniz";
      return;
    }

    // Şifre eşleşme kontrolü
    if (rules.matchField && values[rules.matchField] !== value) {
      errors[field] =
        rules.matchMessage ||
        `${field} ile ${rules.matchField} alanları eşleşmiyor`;
      return;
    }

    // Özel doğrulama kuralı
    if (rules.customValidator && typeof rules.customValidator === "function") {
      const customError = rules.customValidator(value, values);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

/**
 * Form verilerini temizler ve güvenli hale getirir
 * @param {Object} formData - Form verileri
 * @param {Object} options - Temizleme seçenekleri
 * @return {Object} Temizlenmiş form verileri
 */
export const sanitizeFormData = (formData, options = {}) => {
  const sanitizedData = {};
  const { allowHtml = [] } = options;

  Object.keys(formData).forEach((field) => {
    const value = formData[field];

    // Değer null/undefined ise atla
    if (value === null || value === undefined) {
      sanitizedData[field] = value;
      return;
    }

    // HTML içeriğine izin verilen alanlar
    if (allowHtml.includes(field) && typeof value === "string") {
      sanitizedData[field] = sanitizeHtml(value);
      return;
    }

    // String değerler için sanitize işlemi
    if (typeof value === "string") {
      sanitizedData[field] = sanitizeInput(value);
      return;
    }

    // Diğer tipler (sayı, boolean, vb.)
    sanitizedData[field] = value;
  });

  return sanitizedData;
};

/**
 * Form gönderim işlemini gerçekleştirir
 * @param {Object} values - Form değerleri
 * @param {Function} submitFn - Gönderim işlevi
 * @param {Object} options - Gönderim seçenekleri
 * @return {Promise} Gönderim sonucu
 */
export const handleFormSubmit = async (values, submitFn, options = {}) => {
  try {
    const {
      validationRules = {},
      sanitizeOptions = {},
      onSuccess,
      onError,
    } = options;

    // Form doğrulama
    const errors = validateForm(values, validationRules);

    if (Object.keys(errors).length > 0) {
      if (onError) onError({ validationErrors: errors });
      return { success: false, errors };
    }

    // Form verilerini temizleme
    const sanitizedData = sanitizeFormData(values, sanitizeOptions);

    // Form gönderimi
    const result = await submitFn(sanitizedData);

    if (onSuccess) onSuccess(result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Form submission error:", error);

    if (options.onError) {
      options.onError({
        submitError: sanitizeInput(
          error.message || "Form gönderilirken bir hata oluştu"
        ),
      });
    }

    return {
      success: false,
      error: sanitizeInput(
        error.message || "Form gönderilirken bir hata oluştu"
      ),
    };
  }
};

/**
 * İnput yardımcı fonksiyonları
 */
export const inputHelpers = {
  getInputProps: (field, formState = {}, setFormState) => {
    const { values = {}, errors = {} } = formState;

    return {
      id: field,
      name: field,
      value: values[field] || "",
      onChange: (e) => {
        const newValues = { ...values, [field]: e.target.value };
        setFormState({ ...formState, values: newValues });
      },
      onBlur: (e) => {
        // Input alanının kaybedildiği durumlarda özel işlemler yapılabilir
      },
      "aria-invalid": errors[field] ? "true" : "false",
      "aria-describedby": errors[field] ? `${field}-error` : undefined,
    };
  },

  getFormState: (initialValues = {}) => {
    return {
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      submitCount: 0,
    };
  },
};

import React, { Component } from "react";
import { sanitizeInput } from "../../utils/securityUtils";

/**
 * Uygulama genelinde render hatalarını yakalayan bileşen
 * Bu sayede beklenmeyen hatalar nedeniyle kullanıcıların beyaz ekran görmesini engelleyebiliriz
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Bir sonraki render işleminde hata ekranını göstermek için state'i güncelle
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hata detaylarını state'e kaydet
    this.setState({ errorInfo });

    // Hata bilgisini güvenli bir şekilde konsola kaydet
    console.error("React Error Boundary yakalandı:", {
      error: sanitizeInput(error.toString()),
      componentStack: sanitizeInput(errorInfo.componentStack),
    });

    // İsteğe bağlı: Hata raporlama servisine gönder (örn. Sentry)
    this.logErrorToService(error, errorInfo);
  }

  // Hata izleme servisine gönder (örnek)
  logErrorToService(error, errorInfo) {
    // Bu fonksiyon bir hata izleme servisine (örn. Sentry, LogRocket) hataları gönderebilir
    // Örnek: Sentry.captureException(error, { extra: errorInfo });

    // Burada hassas verileri temizleme
    const sanitizedError = {
      message: sanitizeInput(error.message || "Bilinmeyen Hata"),
      stack: sanitizeInput(error.stack || ""),
      componentStack: sanitizeInput(errorInfo.componentStack || ""),
    };

    // Anonim olarak LogRocket veya benzeri bir servise gönderebilirsiniz
    console.info("Hata izleme servisine gönderildi:", sanitizedError);
  }

  // Uygulamayı yenileme işlevi
  handleRestart = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Hata olduğunda gösterilecek kullanıcı dostu bir arayüz
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="mt-4 text-xl font-bold text-gray-900">
                Bir şeyler yanlış gitti
              </h1>
              <p className="mt-2 text-gray-600">
                Beklenmeyen bir hata oluştu. Teknik ekibimiz bilgilendirildi.
              </p>

              <div className="mt-6 space-y-4">
                <button
                  onClick={this.handleRestart}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ana Sayfaya Dön
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sayfayı Yenile
                </button>
              </div>

              {process.env.NODE_ENV === "development" && (
                <details className="mt-6 text-left bg-gray-50 p-4 rounded-md">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Hata Detayları (Geliştirici)
                  </summary>
                  <div className="mt-4">
                    <p className="text-sm text-red-600 font-mono overflow-auto">
                      {this.state.error && this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 text-xs text-gray-600 overflow-auto p-2 bg-gray-100 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Hata yoksa normal çocuk bileşenleri render et
    return this.props.children;
  }
}

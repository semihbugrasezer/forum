"use client";

import Script from "next/script";
import { useMemo } from "react";

interface AdsenseProps {
  slot: string;
  style?: React.CSSProperties;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
}

export function Adsense({ slot, style, format = "auto", responsive = true }: AdsenseProps) {
  // useMemo ile isProduction değerini hesaplayalım
  // Bu değer sadece bileşen mount edildiğinde hesaplanacak
  const isProduction = useMemo(() => {
    return typeof window !== "undefined" && 
      !window.location.hostname.includes("localhost") && 
      process.env.NODE_ENV === "production";
  }, []);

  if (!isProduction) {
    return (
      <div 
        style={{ 
          ...style, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "#f1f5f9", 
          color: "#64748b",
          padding: "1rem",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          height: format === "vertical" ? "600px" : "100px",
          width: "100%"
        }}
      >
        Reklam alanı (geliştirme ortamında gösterilmez)
      </div>
    );
  }

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
      <Script id={`adsense-${slot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </>
  );
} 
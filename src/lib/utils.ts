import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Metadata } from "next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tarihi formatlar
 * @param date Tarih nesnesi
 * @returns Formatlanmış tarih string'i
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 24 saatten kısa ise "bugün", "dün" veya saat formatı
  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) {
        return "az önce";
      }
      return `${minutes} dakika önce`;
    }
    if (hours < 24) {
      return `${hours} saat önce`;
    }
  }

  // 1 gün önce
  if (days === 1) {
    return "dün";
  }

  // 7 günden az ise gün olarak göster
  if (days < 7) {
    return `${days} gün önce`;
  }

  // Normal tarih formatı
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatter.format(date);
}

/**
 * Sayıları formatlı göstermek için
 * @param num Formatlanacak sayı
 * @returns Formatlanmış sayı
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Metin kısaltma fonksiyonu
 * @param text Kısaltılacak metin
 * @param maxLength Maximum uzunluk
 * @returns Kısaltılmış metin
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * URL'i slug formatına dönüştürür
 * @param title Başlık
 * @returns slug formatı
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

/**
 * Text içindeki HTML etiketlerini temizler
 * @param html HTML içeren metin
 * @returns Temizlenmiş metin
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, "");
}

export function formatRelativeTime(date: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) {
    return "az önce";
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} dakika önce`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} saat önce`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} gün önce`;
  } else if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} hafta önce`;
  } else if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} ay önce`;
  } else {
    const years = Math.floor(diff / year);
    return `${years} yıl önce`;
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text
  }
  return text.slice(0, length) + "..."
}

export function generateMetadata(title: string, description?: string): Metadata {
  return {
    title: `${title} - THY Forum`,
    description: description || `THY Forum - ${title}`,
  };
}

export const createSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatExtendedDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

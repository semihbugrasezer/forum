"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const footerLinks = [
    {
      title: "THY Forum",
      links: [
        { name: "Ana Sayfa", href: "/" },
        { name: "Hakkımızda", href: "/about" },
        { name: "Gizlilik Politikası", href: "/privacy" },
        { name: "Kullanım Koşulları", href: "/terms" },
      ],
    },
    {
      title: "Topluluk",
      links: [
        { name: "Forum", href: "/(forum)" },
        { name: "Popüler Konular", href: "/(forum)/trending" },
        { name: "Yeni Konular", href: "/(forum)/recent" },
        { name: "Miles&Smiles", href: "/(forum)/miles-and-smiles" },
      ],
    },
    {
      title: "Kaynaklar",
      links: [
        { name: "Seyahat Rehberleri", href: "/(forum)/guides" },
        { name: "Sık Sorulan Sorular", href: "/faq" },
        { name: "Bilet İptal/İade", href: "/(forum)/refund" },
        { name: "Miles&Smiles Rehberi", href: "/(forum)/miles-guide" },
      ],
    },
    {
      title: "İletişim",
      links: [
        { name: "İletişim Formu", href: "/contact" },
        { name: "Destek", href: "/support" },
        { name: "Öneriler", href: "/suggestions" },
        { name: "İş Birliği", href: "/partnership" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/TK_TR" },
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/TurkishAirlines" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/turkishairlines" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/turkish-airlines" },
    { name: "Youtube", icon: Youtube, href: "https://www.youtube.com/turkishairlines" },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container px-4 py-10 mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
          {footerLinks.map((category) => (
            <div key={category.title} className="mb-8 lg:mb-0">
              <h2 className="mb-6 text-sm font-semibold text-gray-600 uppercase dark:text-gray-400">
                {category.title}
              </h2>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-800 md:flex-row">
          <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center mb-4 md:mb-0 md:mr-6">
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md text-primary font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 transition-all"
                >
                  <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <span className="font-bold">THY Forum</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Türk Hava Yolları Forum Platformu. Tüm hakları saklıdır.
            </p>
          </div>

          <div className="flex space-x-2">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

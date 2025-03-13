import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yeni Konu - THY Forum",
  description: "Türk Hava Yolları Forum'unda yeni bir konu oluşturun ve topluluğumuzla paylaşın.",
};

export default function NewTopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
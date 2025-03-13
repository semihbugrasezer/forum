import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, MessageSquarePlus } from "lucide-react";
import { generateMetadata, formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = generateMetadata(
  "Konu Yönetimi",
  "THY Forum konu yönetimi ve moderasyon işlemleri"
);

const topics = [
  {
    id: "1",
    title: "Miles&Smiles kart yenileme",
    author: "ahmet_yilmaz",
    category: "Miles&Smiles",
    status: "Aktif",
    comments: 15,
    views: 234,
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "2",
    title: "İstanbul-Londra uçuşu",
    author: "mehmet_demir",
    category: "Uçuş Deneyimleri",
    status: "Aktif",
    comments: 8,
    views: 156,
    createdAt: new Date("2024-03-18"),
  },
  {
    id: "3",
    title: "Bagaj problemi",
    author: "ayse_kaya",
    category: "Genel Konular",
    status: "Kilitli",
    comments: 25,
    views: 412,
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    title: "Business Class deneyimi",
    author: "can_ozturk",
    category: "Uçuş Deneyimleri",
    status: "Aktif",
    comments: 12,
    views: 189,
    createdAt: new Date("2024-03-20"),
  },
];

const categories = [
  "Tümü",
  "Genel Konular",
  "Uçuş Deneyimleri",
  "Miles&Smiles",
  "Teknik Konular",
];

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Konular</CardTitle>
              <CardDescription>
                Forum konularını yönetin
              </CardDescription>
            </div>
            <Button className="w-full sm:w-auto">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Yeni Konu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Konu ara..." className="pl-8" />
            </div>
            <Select defaultValue="Tümü">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead className="hidden md:table-cell">Yazar</TableHead>
                  <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="hidden sm:table-cell">Yorumlar</TableHead>
                  <TableHead className="hidden md:table-cell">Görüntülenme</TableHead>
                  <TableHead className="hidden lg:table-cell">Tarih</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {topic.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {topic.author}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {topic.category}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          topic.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {topic.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatNumber(topic.comments)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatNumber(topic.views)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {formatDate(topic.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Menüyü aç</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          <DropdownMenuItem>Kategori Değiştir</DropdownMenuItem>
                          <DropdownMenuItem>Kilitle/Aç</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
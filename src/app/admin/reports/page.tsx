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
import { MoreHorizontal, Search } from "lucide-react";
import { generateMetadata, formatDate } from "@/lib/utils";

export const metadata: Metadata = generateMetadata(
  "Rapor Yönetimi",
  "THY Forum rapor yönetimi ve moderasyon işlemleri"
);

const reports = [
  {
    id: "1",
    type: "Konu",
    content: "Miles&Smiles kart yenileme",
    reporter: "ahmet_yilmaz",
    reason: "Spam",
    status: "Beklemede",
    createdAt: new Date("2024-03-20T14:30:00"),
  },
  {
    id: "2",
    type: "Yorum",
    content: "İstanbul-Londra uçuşu yorumu",
    reporter: "mehmet_demir",
    reason: "Uygunsuz İçerik",
    status: "İnceleniyor",
    createdAt: new Date("2024-03-21T09:15:00"),
  },
  {
    id: "3",
    type: "Kullanıcı",
    content: "user123",
    reporter: "ayse_kaya",
    reason: "Taciz",
    status: "Çözüldü",
    createdAt: new Date("2024-03-19T16:45:00"),
  },
  {
    id: "4",
    type: "Konu",
    content: "Business Class deneyimi",
    reporter: "can_ozturk",
    reason: "Reklam",
    status: "Beklemede",
    createdAt: new Date("2024-03-21T11:20:00"),
  },
];

const reportTypes = ["Tümü", "Konu", "Yorum", "Kullanıcı"];
const reportStatuses = ["Tümü", "Beklemede", "İnceleniyor", "Çözüldü", "Reddedildi"];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Raporlar</CardTitle>
              <CardDescription>
                Kullanıcı raporlarını yönetin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rapor ara..." className="pl-8" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="Tümü">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Tür seç" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="Tümü">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Durum seç" />
                </SelectTrigger>
                <SelectContent>
                  {reportStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tür</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead className="hidden md:table-cell">Raporlayan</TableHead>
                  <TableHead className="hidden lg:table-cell">Sebep</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="hidden sm:table-cell">Tarih</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.content}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {report.reporter}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {report.reason}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === "Beklemede"
                            ? "bg-yellow-100 text-yellow-800"
                            : report.status === "İnceleniyor"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "Çözüldü"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell whitespace-nowrap">
                      {formatDate(report.createdAt)}
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
                          <DropdownMenuItem>İçeriği Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem>İncele</DropdownMenuItem>
                          <DropdownMenuItem>Durum Güncelle</DropdownMenuItem>
                          <DropdownMenuItem>İçeriği Kaldır</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Raporu Sil
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
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateMetadata, formatNumber } from "@/lib/utils";
import { ArrowDown, ArrowUp, Users, MessageSquare, Flag, Activity } from "lucide-react";

export const metadata: Metadata = generateMetadata(
  "İstatistikler",
  "THY Forum istatistikleri ve analiz verileri"
);

const stats = [
  {
    title: "Toplam Kullanıcı",
    value: 12453,
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Toplam Konu",
    value: 3567,
    change: "+8%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Aktif Raporlar",
    value: 45,
    change: "-5%",
    trend: "down",
    icon: Flag,
  },
  {
    title: "Günlük Aktivite",
    value: 876,
    change: "+15%",
    trend: "up",
    icon: Activity,
  },
];

const popularTopics = [
  {
    title: "Miles&Smiles kart yenileme",
    views: 1234,
    comments: 45,
    category: "Miles&Smiles",
  },
  {
    title: "İstanbul-Londra uçuşu",
    views: 987,
    comments: 32,
    category: "Uçuş Deneyimleri",
  },
  {
    title: "Business Class deneyimi",
    views: 876,
    comments: 28,
    category: "Uçuş Deneyimleri",
  },
  {
    title: "Bagaj problemi çözümü",
    views: 765,
    comments: 56,
    category: "Genel Konular",
  },
];

const activeUsers = [
  {
    username: "ahmet_yilmaz",
    topics: 23,
    comments: 156,
    lastActive: "2 saat önce",
  },
  {
    username: "mehmet_demir",
    topics: 18,
    comments: 134,
    lastActive: "35 dakika önce",
  },
  {
    username: "ayse_kaya",
    topics: 15,
    comments: 98,
    lastActive: "1 saat önce",
  },
  {
    username: "can_ozturk",
    topics: 12,
    comments: 87,
    lastActive: "3 saat önce",
  },
];

const timeRanges = ["Son 24 Saat", "Son 7 Gün", "Son 30 Gün", "Son 3 Ay", "Son 1 Yıl"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">İstatistikler</h2>
        <Select defaultValue="Son 7 Gün">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Zaman aralığı seç" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
                <div className="flex items-center pt-1 text-xs">
                  {stat.trend === "up" ? (
                    <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popüler Konular</CardTitle>
            <CardDescription>
              En çok görüntülenen ve yorum alan konular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                    <TableHead className="text-right">Görüntülenme</TableHead>
                    <TableHead className="text-right">Yorumlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularTopics.map((topic) => (
                    <TableRow key={topic.title}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {topic.title}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {topic.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(topic.views)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(topic.comments)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktif Kullanıcılar</CardTitle>
            <CardDescription>
              En çok katkı sağlayan kullanıcılar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead className="text-right">Konular</TableHead>
                    <TableHead className="text-right">Yorumlar</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Son Aktivite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(user.topics)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(user.comments)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        {user.lastActive}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
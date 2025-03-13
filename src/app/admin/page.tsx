import { Metadata } from "next";
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
import { Users, MessageSquare, Flag, Activity } from "lucide-react";
import { generateMetadata } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata: Metadata = generateMetadata(
  "Admin Dashboard",
  "THY Forum yönetim paneli istatistikleri ve genel bakış"
);

const stats = [
  {
    title: "Toplam Kullanıcı",
    value: "1,234",
    icon: Users,
    description: "Son 30 günde 123 yeni kullanıcı",
    trend: "+12%",
    trendDirection: "up",
  },
  {
    title: "Toplam Konu",
    value: "2,345",
    icon: MessageSquare,
    description: "Son 30 günde 234 yeni konu",
    trend: "+8%",
    trendDirection: "up",
  },
  {
    title: "Aktif Raporlar",
    value: "12",
    icon: Flag,
    description: "İncelenmesi gereken raporlar",
    trend: "-25%",
    trendDirection: "down",
  },
  {
    title: "Günlük Aktivite",
    value: "+24%",
    icon: Activity,
    description: "Geçen haftaya göre artış",
    trend: "+24%",
    trendDirection: "up",
  },
];

const recentActivity = [
  {
    user: "ahmet_yilmaz",
    action: "Yeni konu açtı",
    topic: "Miles&Smiles kart yenileme",
    time: new Date(Date.now() - 5 * 60000), // 5 dakika önce
  },
  {
    user: "mehmet_demir",
    action: "Yorum yaptı",
    topic: "İstanbul-Londra uçuşu",
    time: new Date(Date.now() - 15 * 60000), // 15 dakika önce
  },
  {
    user: "ayse_kaya",
    action: "Rapor edildi",
    topic: "Bagaj problemi",
    time: new Date(Date.now() - 30 * 60000), // 30 dakika önce
  },
  {
    user: "can_ozturk",
    action: "Konu güncelledi",
    topic: "Business Class deneyimi",
    time: new Date(Date.now() - 60 * 60000), // 1 saat önce
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`text-sm font-medium ${
                      stat.trendDirection === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>
            Forum üzerindeki son kullanıcı aktiviteleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead className="hidden md:table-cell">Konu</TableHead>
                  <TableHead>Zaman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={`${activity.user}-${activity.time.getTime()}`}>
                    <TableCell className="font-medium">
                      {activity.user}
                    </TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {activity.topic}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(activity.time)}
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
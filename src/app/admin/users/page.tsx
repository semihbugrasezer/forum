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
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, UserPlus } from "lucide-react";
import { generateMetadata, formatDate } from "@/lib/utils";

export const metadata: Metadata = generateMetadata(
  "Kullanıcı Yönetimi",
  "THY Forum kullanıcı yönetimi ve işlemleri"
);

const users = [
  {
    id: "1",
    username: "ahmet_yilmaz",
    email: "ahmet@example.com",
    role: "Kullanıcı",
    status: "Aktif",
    joinDate: new Date("2024-01-15"),
    lastActive: new Date("2024-03-20"),
  },
  {
    id: "2",
    username: "mehmet_demir",
    email: "mehmet@example.com",
    role: "Moderatör",
    status: "Aktif",
    joinDate: new Date("2023-12-01"),
    lastActive: new Date("2024-03-21"),
  },
  {
    id: "3",
    username: "ayse_kaya",
    email: "ayse@example.com",
    role: "Kullanıcı",
    status: "Askıya Alınmış",
    joinDate: new Date("2024-02-10"),
    lastActive: new Date("2024-03-15"),
  },
  {
    id: "4",
    username: "can_ozturk",
    email: "can@example.com",
    role: "Admin",
    status: "Aktif",
    joinDate: new Date("2023-11-20"),
    lastActive: new Date("2024-03-21"),
  },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Kullanıcılar</CardTitle>
              <CardDescription>
                Tüm forum kullanıcılarını yönetin
              </CardDescription>
            </div>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Kullanıcı
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center py-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Kullanıcı ara..." className="pl-8" />
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead className="hidden md:table-cell">E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="hidden lg:table-cell">Kayıt Tarihi</TableHead>
                  <TableHead className="hidden lg:table-cell">Son Aktivite</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {formatDate(user.joinDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {formatDate(user.lastActive)}
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
                          <DropdownMenuItem>Profili Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          <DropdownMenuItem>Rol Değiştir</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Hesabı Askıya Al
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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { getTopics, deleteTopic } from "@/lib/services/admin-topics";
import { getCategories } from "@/lib/services/admin-categories";

interface Topic {
  id: string;
  title: string;
  user_id: string;
  status: string;
  comment_count: number;
  view_count: number;
  created_at: string;
  author?: {
    name?: string;
    email: string;
  };
  category?: {
    name: string;
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('tr-TR');
}

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [topicsData, categoriesData] = await Promise.all([
          getTopics(selectedCategory),
          getCategories()
        ]);
        
        setTopics(topicsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Supabase gerçek zamanlı abonelik
    const subscription = supabase
      .channel('topics_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'topics' }, 
        loadData
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedCategory, supabase]);

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Bu konuyu silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteTopic(topicId);
      toast.success('Konu başarıyla silindi');
    } catch (error) {
      console.error('Konu silinirken hata:', error);
      toast.error('Konu silinirken bir hata oluştu');
    }
  };

  // Arama filtreleme
  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Konular</h1>
        <Button asChild>
          <Link href="/admin/topics/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Konu
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Konular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Konu başlığı ara..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="text-center py-10">Konular yükleniyor...</div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery ? "Arama kriterlerine uygun konu bulunamadı." : "Henüz konu bulunmuyor."}
              </div>
            ) : (
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
                  {filteredTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {topic.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {topic.author?.name || topic.author?.email || 'Bilinmiyor'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {topic.category?.name || 'Kategori yok'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            topic.status === "active" || !topic.status
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {topic.status === "active" || !topic.status ? "Aktif" : topic.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatNumber(topic.comment_count || 0)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatNumber(topic.view_count || 0)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(topic.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/topics/edit/${topic.id}`)}
                            >
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/forum/topics/${topic.id}`)}
                            >
                              Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="text-red-600"
                            >
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
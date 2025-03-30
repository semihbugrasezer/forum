"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createSlug } from "@/lib/utils";
import dynamic from "next/dynamic";
import "@/styles/easymde.css";

// SimpleMDE markdown editörünü dinamik olarak yükle
import type SimpleMDEEditor from 'react-simplemde-editor';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { 
  ssr: false 
}) as typeof SimpleMDEEditor;

export default function NewTopicPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Kategorileri yükle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      }
    };

    loadCategories();
  }, [supabase]);

  // Başlık değiştiğinde slug oluştur
  useEffect(() => {
    if (title && !slug) {
      setSlug(createSlug(title));
    }
  }, [title, slug]);

  // Form validasyonu
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) errors.title = "Başlık gerekli";
    if (!content.trim()) errors.content = "İçerik gerekli";
    if (!selectedCategory) errors.category = "Kategori seçimi gerekli";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Etiket ekle
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // Etiket kaldır
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Markdown editör seçenekleri
  const editorOptions = {
    autofocus: true,
    spellChecker: false,
    placeholder: "Konu içeriğini buraya yazın...",
    status: false,
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Konu oluşturmak için giriş yapmalısınız");
        router.push("/auth/login?redirectTo=/admin/topics/new");
        return;
      }
      
      const userId = session.user.id;
      const finalSlug = slug || createSlug(title);
      
      // Slug'ın benzersiz olup olmadığını kontrol et
      const { data: existingTopic } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', finalSlug)
        .single();
      
      // Benzersiz slug oluştur
      const uniqueSlug = existingTopic 
        ? `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`
        : finalSlug;
      
      // Yeni konu oluştur
      const { data, error } = await supabase
        .from('topics')
        .insert([
          { 
            title, 
            content,
            slug: uniqueSlug,
            user_id: userId,
            category_id: selectedCategory,
            tags: tags.length > 0 ? tags : null,
            is_admin_post: true, // Admin tarafından oluşturuldu
            status: "active",
            comment_count: 0,
            view_count: 0,
            like_count: 0
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Konu başarıyla oluşturuldu!");
      router.push("/admin/topics");
    } catch (error) {
      console.error("Konu oluşturulurken hata:", error);
      toast.error("Konu oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Yeni Konu</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Konu Detayları</CardTitle>
            <CardDescription>
              Oluşturmak istediğiniz konunun detaylarını girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Başlık ve Slug */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Başlık</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Konu başlığı"
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationErrors.title}
                </p>
              )}
              
              <div className="mt-2">
                <Label htmlFor="slug" className="text-base">URL</Label>
                <div className="flex items-center mt-1">
                  <span className="text-muted-foreground mr-2">/forum/topics/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(createSlug(e.target.value))}
                    placeholder="konu-url"
                  />
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">Kategori</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="category" className={validationErrors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Etiketler */}
            <div className="space-y-2">
              <Label className="text-base">Etiketler (en fazla 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1 text-xs">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Yeni etiket"
                  disabled={tags.length >= 5}
                />
                <Button 
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  Ekle
                </Button>
              </div>
              {tags.length >= 5 && (
                <p className="text-sm text-muted-foreground mt-1">En fazla 5 etiket ekleyebilirsiniz.</p>
              )}
            </div>

            {/* İçerik Editörü */}
            <div className="space-y-2">
              <Label className="text-base">İçerik</Label>
              <Tabs 
                defaultValue="write" 
                onValueChange={(value) => setPreviewMode(value === "preview")}
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Yaz</TabsTrigger>
                  <TabsTrigger value="preview">Önizleme</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <SimpleMDE
                    value={content}
                    onChange={setContent}
                    options={editorOptions}
                  />
                  {validationErrors.content && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {validationErrors.content}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-4 min-h-[300px] prose dark:prose-invert max-w-none">
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <p className="text-muted-foreground">İçerik önizlemesi için metin girin.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2 justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Konuyu Oluştur
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}

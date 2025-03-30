'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, slugify } from "@/lib/utils";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon, Paperclip, Send, AlertTriangle, Lightbulb, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Entegrasyon için TinyMCE API anahtarı (gerçek bir anahtar ile değiştirin)
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'your_tinymce_api_key';

// Kategori verileri
const categories = [
  {
    id: "genel",
    name: "Genel",
    description: "Genel konular ve duyurular",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    id: "miles-and-smiles",
    name: "Miles&Smiles",
    description: "Miles&Smiles programı, mil kazanma ve kullanma",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "ucus-deneyimleri",
    name: "Uçuş Deneyimleri",
    description: "Uçuş deneyimleri ve yorumlar",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "destinasyonlar",
    name: "Destinasyonlar",
    description: "THY uçuş noktaları ve şehir rehberleri",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "ipucları",
    name: "İpuçları ve Öneriler",
    description: "Seyahat ipuçları, bilet alma taktikleri",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "teknik",
    name: "Teknik Konular",
    description: "Web sitesi, mobil uygulama ve rezervasyon sorunları",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    id: "haberler",
    name: "Haberler ve Duyurular",
    description: "THY ile ilgili son haberler ve duyurular",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
];

// Konu tipleri
const topicTypes = [
  { id: "discussion", name: "Tartışma", icon: "comments" },
  { id: "question", name: "Soru", icon: "help-circle" },
  { id: "guide", name: "Rehber", icon: "book" },
  { id: "news", name: "Haber", icon: "newspaper" },
  { id: "poll", name: "Anket", icon: "bar-chart-2" },
];

// Define types for our component
interface UploadedImage {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface ValidationErrors {
  title: string;
  content: string;
  category: string;
}

export default function NewTopicPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const editorRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopicType, setSelectedTopicType] = useState("discussion");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: "",
    content: "",
    category: "",
  });

  // Başlık değiştiğinde otomatik olarak slug oluştur
  useEffect(() => {
    if (title) {
      setSlug(slugify(title));
    }
  }, [title]);

  const handleTabChange = (value: string) => {
    if (value === "preview" && editorRef.current) {
      setPreviewContent(editorRef.current.getContent());
    }
  };

  const validateForm = () => {
    const errors: ValidationErrors = {
      title: "",
      content: "",
      category: "",
    };
    let isValid = true;

    if (!title || title.length < 10) {
      errors.title = "Başlık en az 10 karakter olmalıdır";
      isValid = false;
    }

    if (!content || content.length < 30) {
      errors.content = "İçerik en az 30 karakter olmalıdır";
      isValid = false;
    }

    if (!selectedCategory) {
      errors.category = "Lütfen bir kategori seçin";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleTagAdd = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Gerçek bir uygulamada burası bir bulut depolama servisine yükleme yapacaktır
      const newImages: UploadedImage[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editorRef.current) {
      setContent(editorRef.current.getContent());
    }
    
    if (!validateForm()) {
      toast.error("Lütfen tüm alanları doğru şekilde doldurun");
      return;
    }
    
    setIsSubmitting(true);
    setIsPosting(true);
    
    try {
      // Şu anki kullanıcı bilgilerini al
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Konu oluşturmak için giriş yapmalısınız");
        router.push("/auth/login?redirectTo=/new-topic");
        return;
      }
      
      const userId = session.user.id;
      const finalSlug = slug || slugify(title);
      
      // Slug'ın benzersiz olup olmadığını kontrol et
      const { data: existingTopic } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', finalSlug)
        .single();
        
      // Eğer aynı slug'a sahip konu varsa, slug'a rastgele bir son ek ekle
      const uniqueSlug = existingTopic 
        ? `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`
        : finalSlug;
      
      // Yeni konuyu oluştur
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title, 
          content,
          slug: uniqueSlug,
          user_id: userId,
          category_id: selectedCategory,
          topic_type: selectedTopicType,
          tags: tags.length > 0 ? tags : [],
          created_at: new Date().toISOString(),
          comments_count: 0,
          views: 0,
          likes_count: 0
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success("Konu başarıyla oluşturuldu!");
      
      // Oluşturulan konu sayfasına yönlendir
      router.push(`/topics/${uniqueSlug}`);
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Konu oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?")) {
      router.back();
    }
  };

  // TinyMCE editör yapılandırması
  const editorConfig = {
    height: 400,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-2xl font-bold">Yeni Konu Oluştur</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ana İçerik */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Konu Detayları</CardTitle>
              <CardDescription>
                Konu başlığı, içerik ve diğer ayrıntıları doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Başlık */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    placeholder="Konunuz için dikkat çekici bir başlık yazın"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={validationErrors.title ? "border-red-500" : ""}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {validationErrors.title}
                    </p>
                  )}
                  {title && (
                    <p className="text-xs text-muted-foreground">
                      URL: /topics/{slug}
                    </p>
                  )}
                </div>

                {/* Kategori ve Tür */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="topic-type" className="text-base">Konu Türü</Label>
                    <Select
                      value={selectedTopicType}
                      onValueChange={setSelectedTopicType}
                    >
                      <SelectTrigger id="topic-type">
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {topicTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* İçerik Editörü */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base">İçerik</Label>
                  <Tabs defaultValue="write" onValueChange={handleTabChange}>
                    <TabsList className="mb-2">
                      <TabsTrigger value="write">Yaz</TabsTrigger>
                      <TabsTrigger value="preview">Önizleme</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="min-h-[300px]">
                      <TinyMCEEditor
                        apiKey={TINYMCE_API_KEY}
                        onInit={(evt: any, editor: any) => editorRef.current = editor}
                        initialValue=""
                        init={editorConfig}
                      />
                      {validationErrors.content && (
                        <p className="text-sm text-red-500 flex items-center mt-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.content}
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="preview" className="prose dark:prose-invert max-w-none min-h-[300px] border rounded-md p-4">
                      {previewContent ? (
                        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                      ) : (
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                          <p>İçerik eklediğinizde burada önizleme göreceksiniz.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Etiketler */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-base">Etiketler (Maksimum 5)</Label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleTagRemove(tag)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Etiket ekleyin"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                      disabled={tags.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTagAdd}
                      disabled={!tagInput || tags.length >= 5}
                    >
                      Ekle
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter tuşuna basarak veya Ekle düğmesini kullanarak etiket ekleyebilirsiniz.
                  </p>
                </div>

                {/* Dosya Yükleme */}
                <div className="space-y-2">
                  <Label className="text-base">Görsel Ekle</Label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        multiple
                      />
                      <div className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Görsel Seç
                      </div>
                    </label>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.name} 
                            className="w-full h-20 object-cover rounded-md" 
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            onClick={() => setUploadedImages(uploadedImages.filter(img => img.id !== image.id))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle(title);
                    if (editorRef.current) {
                      setContent(editorRef.current.getContent());
                      setPreviewContent(editorRef.current.getContent());
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Taslak Kaydet
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={isPosting ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Paylaşılıyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Konuyu Paylaş
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sağ Kenar */}
        <div className="md:col-span-1 space-y-6">
          {/* Konu Bilgilendirme Kartı */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Konu Oluşturma İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Başlık</h4>
                  <p className="text-sm text-muted-foreground">
                    Açıklayıcı ve dikkat çekici bir başlık seçin.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-1">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">İçerik</h4>
                  <p className="text-sm text-muted-foreground">
                    Detaylı ve anlaşılır bir açıklama yazın.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Etiketler</h4>
                  <p className="text-sm text-muted-foreground">
                    Konuyla ilgili anahtar kelimeler ekleyin.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link 
                href="#" 
                className="text-sm text-blue-600 hover:underline"
              >
                Forum kurallarını görüntüle
              </Link>
            </CardFooter>
          </Card>
          
          {/* Kategoriler Kartı */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Kategoriler</CardTitle>
              <CardDescription>
                Konunuz için uygun kategoriyi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 pb-4 space-y-1">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className={cn(
                      "p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                      selectedCategory === category.id && "bg-gray-100 dark:bg-gray-800"
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-center">
                      <Badge className={cn("mr-2", category.color)}>
                        {category.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-1 mt-1">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
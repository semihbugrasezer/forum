import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from "../../core/context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../core/services/firebase";

const CreateArticle = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "genel",
    tags: "",
    content: "",
  });
  const [error, setError] = useState("");

  const categories = [
    { id: "genel", name: "Genel Konular" },
    { id: "ucuslar", name: "Uçuşlar" },
    { id: "miles", name: "Miles&Smiles" },
    { id: "destinasyonlar", name: "Destinasyonlar" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Form validasyonu
      if (!formData.title.trim()) {
        throw new Error("Başlık alanı zorunludur");
      }
      if (!formData.content.trim()) {
        throw new Error("İçerik alanı zorunludur");
      }
      if (formData.tags && !isValidTags(formData.tags)) {
        throw new Error("Etiketler virgülle ayrılmış kelimeler olmalıdır");
      }

      // Makale verilerini hazırla
      const articleData = {
        ...formData,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonim",
          avatar:
            currentUser.photoURL ||
            `https://i.pravatar.cc/150?u=${currentUser.uid}`,
        },
        createdAt: new Date().toISOString(),
        slug: createSlug(formData.title),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        views: 0,
        likes: 0,
        comments: 0,
      };

      // Firebase'e kaydet
      await addDoc(collection(db, "articles"), articleData);

      // Başarılı ise anasayfaya yönlendir
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const isValidTags = (tags) => {
    const tagArray = tags.split(",");
    return tagArray.every((tag) =>
      /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s-]+$/.test(tag.trim())
    );
  };

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Yeni Makale Oluştur
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Başlık
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700"
          >
            Etiketler (virgülle ayırın)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="örnek: thy, business-class, seyahat"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            İçerik
          </label>
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; }",
            }}
            onEditorChange={handleEditorChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Yayınlanıyor..." : "Yayınla"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;

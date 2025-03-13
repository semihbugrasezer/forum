import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { FaSpinner } from "react-icons/fa";

const CreatePostForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { category, subcategory, onCreatePost } = location.state || {};

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("Gönderi oluşturmak için giriş yapmalısınız!");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Lütfen başlık ve içerik alanlarını doldurun.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        subcategory,
      };

      const postId = await onCreatePost(postData);
      navigate(`/forum/post/${postId}`);
    } catch (error) {
      console.error("Post creation error:", error);
      setError(error.message || "Gönderi oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Kategori bilgisi bulunamadı. Lütfen forum kategorisinden konu
            oluşturun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Yeni Konu Oluştur
      </h2>

      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Kategori:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {category}
          </span>
          {subcategory && (
            <>
              <span>/</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subcategory}
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Başlık
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
            placeholder="Konu başlığını girin..."
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            İçerik
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
            placeholder="Konu içeriğini girin..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              "Konu Oluştur"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;

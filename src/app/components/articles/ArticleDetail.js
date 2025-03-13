import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { articles } from "../../shared/data/articles";
import {
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const ArticleDetail = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Makaleyi bul
    const foundArticle = articles.find((a) => a.slug === slug);
    if (foundArticle) {
      setArticle(foundArticle);
      // Örnek yorumlar (gerçek uygulamada Firebase'den gelecek)
      setComments([
        {
          id: 1,
          text: "Harika bir yazı olmuş, teşekkürler!",
          author: {
            id: 2,
            name: "Ayşe Yıldız",
            avatar: "https://i.pravatar.cc/150?img=4",
          },
          createdAt: "2024-03-15T10:00:00Z",
        },
        {
          id: 2,
          text: "Bu bilgiler çok işime yarayacak.",
          author: {
            id: 3,
            name: "Mehmet Demir",
            avatar: "https://i.pravatar.cc/150?img=3",
          },
          createdAt: "2024-03-15T11:30:00Z",
        },
      ]);
    }
  }, [slug]);

  const handleLike = () => {
    if (!currentUser) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      return;
    }
    setIsLiked(!isLiked);
    // Firebase'de beğeni sayısını güncelle
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment = {
        id: Date.now(),
        text: comment,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonim",
          avatar:
            currentUser.photoURL ||
            `https://i.pravatar.cc/150?u=${currentUser.uid}`,
        },
        createdAt: new Date().toISOString(),
      };

      // Firebase'e kaydet
      setComments([...comments, newComment]);
      setComment("");
    } catch (error) {
      console.error("Yorum eklenirken hata oluştu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Makale bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-sm overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to={`/category/${article.category}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {article.category.charAt(0).toUpperCase() +
                article.category.slice(1)}
            </Link>
            <span className="text-gray-500">•</span>
            <time className="text-sm text-gray-500">
              {new Date(article.createdAt).toLocaleDateString("tr-TR")}
            </time>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center space-x-4 mb-6">
            <Link
              to={`/profile/${article.author.id}`}
              className="flex items-center space-x-2"
            >
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-medium text-gray-900">
                {article.author.name}
              </span>
            </Link>
          </div>

          <div
            className="prose prose-blue max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm ${
                  isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                }`}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{article.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <span className="flex items-center space-x-1 text-sm text-gray-500">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                <span>{comments.length}</span>
              </span>
              <span className="flex items-center space-x-1 text-sm text-gray-500">
                <EyeIcon className="h-5 w-5" />
                <span>{article.views}</span>
              </span>
            </div>

            <button
              onClick={() =>
                navigator.share({
                  title: article.title,
                  url: window.location.href,
                })
              }
              className="text-gray-500 hover:text-gray-700"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Etiketler */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Etiketler</h2>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Yorumlar */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Yorumlar ({comments.length})
        </h2>

        {currentUser ? (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex items-start space-x-4">
              <img
                src={
                  currentUser.photoURL ||
                  `https://i.pravatar.cc/150?u=${currentUser.uid}`
                }
                alt={currentUser.displayName || "Anonim"}
                className="w-10 h-10 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <textarea
                    rows={3}
                    name="comment"
                    id="comment"
                    className="block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm"
                    placeholder="Bir yorum yazın..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center mb-8">
            <p className="text-gray-600">
              Yorum yapabilmek için{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                giriş yapın
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/profile/${comment.author.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-gray-300">•</span>
                  <time className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                  </time>
                </div>
                <p className="mt-1 text-gray-700">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;

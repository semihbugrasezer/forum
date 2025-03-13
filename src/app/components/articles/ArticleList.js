import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { articles } from "../../shared/data/articles";
import {
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const ArticleList = () => {
  const { category, tag } = useParams();
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [sortBy, setSortBy] = useState("date"); // date, views, likes

  useEffect(() => {
    let filtered = [...articles];

    // Kategori filtresi
    if (category) {
      filtered = filtered.filter((article) => article.category === category);
    }

    // Etiket filtresi
    if (tag) {
      filtered = filtered.filter((article) => article.tags.includes(tag));
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "likes":
          return b.likes - a.likes;
        case "date":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredArticles(filtered);
  }, [category, tag, sortBy]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {category
            ? `${
                category.charAt(0).toUpperCase() + category.slice(1)
              } Makaleleri`
            : tag
            ? `#${tag} Makaleleri`
            : "Tüm Makaleler"}
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="date">En Yeni</option>
          <option value="views">En Çok Görüntülenen</option>
          <option value="likes">En Çok Beğenilen</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link to={`/article/${article.slug}`}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-6">
              <Link
                to={`/category/${article.category}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {article.category.charAt(0).toUpperCase() +
                  article.category.slice(1)}
              </Link>
              <Link to={`/article/${article.slug}`}>
                <h2 className="mt-2 text-xl font-semibold text-gray-900 hover:text-blue-600">
                  {article.title}
                </h2>
              </Link>
              <p className="mt-3 text-gray-600 line-clamp-2">
                {article.content}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <Link
                      to={`/profile/${article.author.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {article.author.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-500">
                  <span className="flex items-center text-sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {article.views}
                  </span>
                  <span className="flex items-center text-sm">
                    <HeartIcon className="h-4 w-4 mr-1" />
                    {article.likes}
                  </span>
                  <span className="flex items-center text-sm">
                    <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1" />
                    {article.comments}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Bu kategoride henüz makale bulunmuyor.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleList;

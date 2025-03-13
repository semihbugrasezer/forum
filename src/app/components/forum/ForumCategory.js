import React from "react";
import { Link } from "react-router-dom";

const ForumCategory = ({ category }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            <Link to={`/forum/${category.slug}`}>{category.name}</Link>
          </h2>
          <p className="mt-2 text-gray-600">{category.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Konular: {category.topicCount}
          </p>
          <p className="text-sm text-gray-500">
            Yanıtlar: {category.replyCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForumCategory;

import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/tr";

const ForumTopic = ({ topic }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            <Link to={`/topic/${topic.id}`}>{topic.title}</Link>
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            <span>
              {topic.author.name} tarafından {moment(topic.createdAt).fromNow()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Yanıtlar: {topic.replyCount}</p>
          <p className="text-sm text-gray-500">Görüntülenme: {topic.views}</p>
        </div>
      </div>
    </div>
  );
};

export default ForumTopic;

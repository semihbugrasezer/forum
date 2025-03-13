import React, { useState, useEffect } from "react";
import { db } from "../../core/services/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../../core/context/AuthContext";
import {
  HeartIcon as HeartIconOutline,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/outline";

const LikeButton = ({ postId, likes }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (likes?.includes(currentUser?.uid)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [likes, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;

    const postRef = doc(db, "posts", postId);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
        });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Beğeni işlemi başarısız:", error);
    }
  };

  return (
    <button onClick={handleLike} className="flex items-center space-x-1">
      {isLiked ? (
        <HeartIconSolid className="h-5 w-5 text-red-500" />
      ) : (
        <HeartIconOutline className="h-5 w-5 text-gray-500" />
      )}
      <span>{likes?.length || 0}</span>
    </button>
  );
};

export default LikeButton;

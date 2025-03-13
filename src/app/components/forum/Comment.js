import React, { useState } from "react";
import { db } from "../../core/services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../core/context/AuthContext";

const Comment = ({ postId }) => {
  const [comment, setComment] = useState("");
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.uid,
        content: comment,
        createdAt: serverTimestamp(),
      });
      setComment("");
    } catch (error) {
      console.error("Yorum eklenemedi:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded"
        rows={2}
        placeholder="Bir yorum yazın..."
      />
      <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded">
        Yorum Yap
      </button>
    </form>
  );
};

export default Comment;

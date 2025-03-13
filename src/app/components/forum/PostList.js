import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Post from "./Post";
import useAuthConstructor from "../../core/constructors/AuthConstructor";
import FormConstructor from "../../core/constructors/FormConstructor";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const auth = useAuthConstructor("postList");
  const formConstructor = new FormConstructor("postList");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

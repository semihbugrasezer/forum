import { useState, useEffect } from "react";

const useTopics = () => {
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from("topics")
          .select(
            `
            *,
            author:profiles(name, email),
            category:categories(name)
          `
          )
          .order("created_at", { ascending: false })
          .timeout(20000); // Increase timeout to 20 seconds

        if (error) throw error;
        setTopics(data);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { topics, error, loading };
};

export default useTopics;

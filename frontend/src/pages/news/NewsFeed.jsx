import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const categories = [
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology"
];

const NewsFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");

  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news", selectedCategory],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/news/${selectedCategory}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || data.details?.message || "Failed to fetch news");
        }
        
        if (!data.articles || data.articles.length === 0) {
          throw new Error("No news articles found");
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
      }
    },
    retry: 1,
  });

  if (error) {
    toast.error(error.message);
  }

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      {/* Header */}
      <div className="flex w-full border-b border-gray-700">
        <h1 className="text-xl font-bold p-4">Trending News</h1>
      </div>

      {/* Categories */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-700">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full capitalize ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>Failed to load news. Please try again later.</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news?.articles?.map((article, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition duration-300"
              >
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2">{article.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {article.description?.slice(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition duration-300"
                  >
                    Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed; 
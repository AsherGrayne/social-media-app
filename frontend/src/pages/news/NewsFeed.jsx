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
  const [imageErrors, setImageErrors] = useState(new Set());

  const { data: news, isLoading, error, refetch } = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleImageError = (articleIndex) => {
    setImageErrors(prev => new Set([...prev, articleIndex]));
  };

  const handleRetry = () => {
    setImageErrors(new Set());
    refetch();
  };

  if (error) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <div className="flex w-full border-b border-gray-700">
          <h1 className="text-xl font-bold p-4">Trending News</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-red-500 mb-4">
            <p className="text-lg font-semibold mb-2">Failed to load news</p>
            <p className="text-sm">{error.message}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
            className={`px-4 py-2 rounded-full capitalize transition-colors ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => {
              setSelectedCategory(category);
              setImageErrors(new Set());
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news?.articles?.map((article, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition duration-300"
              >
                {article.urlToImage && !imageErrors.has(index) && (
                  <div className="relative h-48">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="truncate max-w-[150px]">{article.source.name}</span>
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
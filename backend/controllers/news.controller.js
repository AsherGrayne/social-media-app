import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

export const getNewsByCategory = async (req, res) => {
    try {
        if (!NEWS_API_KEY) {
            console.error("NEWS_API_KEY is not set in environment variables");
            return res.status(500).json({ error: "News API key is not configured" });
        }

        const { category } = req.params;
        console.log("Fetching news for category:", category);
        
        const response = await axios.get(NEWS_API_URL, {
            params: {
                country: 'us',
                category: category,
                apiKey: NEWS_API_KEY
            }
        });

        console.log("News API response status:", response.status);
        console.log("Number of articles received:", response.data.articles?.length || 0);

        res.status(200).json(response.data);
    } catch (error) {
        console.log("Error in getNewsByCategory controller: ", error.message);
        if (error.response) {
            console.log("API Error Response:", error.response.data);
            return res.status(error.response.status).json({ 
                error: "Failed to fetch news",
                details: error.response.data 
            });
        }
        res.status(500).json({ error: "Failed to fetch news" });
    }
}; 
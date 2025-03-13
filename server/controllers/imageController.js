// image/chatController.js
const getImageResponse = async (req, res, openai) => {
    try {
        const { prompt, n, size } = req.body;
        
        const response = await openai.createImage({
          prompt,
          n: n || 1,
          size: size || "512x512",
        });
    
        // response.data contains an array of generated images
        // e.g. response.data.data[0].url
        res.status(200).json({
          images: response.data.data,
        });
      } catch (error) {
        console.error("Error generating image:", error?.response?.data || error.message);
        res.status(500).json({
          error: error?.response?.data?.error?.message || "Something went wrong",
        });
      }
  };
  
  module.exports = { getImageResponse };
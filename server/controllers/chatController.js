// controllers/chatController.js
const getChatResponse = async (req, res, openai) => {
  try {
    const userMessage = req.body.message;
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful AI DM for a solo RPG experience.' },
        { role: 'user', content: userMessage },
      ],
    });

    // The response from createChatCompletion is in response.data
    const assistantMessage = response.data.choices[0].message.content;

    return res.json({ assistantMessage });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return res.status(500).json({ error: 'Error processing your request' });
  }
};

module.exports = { getChatResponse };

  
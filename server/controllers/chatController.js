// controllers/chatController.js

const getChatResponse = async (req, res, openai) => {
  try {
    const { messages } = req.body;
    // Make sure messages is an array and not empty:
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const assistantMessage = completion.data.choices[0].message.content;
    res.status(200).json({ assistantMessage });
  } catch (error) {
    console.error('Error while calling OpenAI API:', error);
    res.status(500).json({ error: 'OpenAI API error' });
  }
};


module.exports = { getChatResponse };


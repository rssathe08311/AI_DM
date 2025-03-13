// router.js
const controllers = require('./controllers');

const router = (app, openai) => {
  app.get('/', controllers.index);

  // Ensure controllers.chat.getChatResponse exists and is a function
  app.post('/chat', (req, res) => {
    controllers.chat.getChatResponse(req, res, openai);
  });

  app.post('/image', (req, res) => {
    controllers.image.getImageResponse(req, res, openai);
  })
  //stretch goal to have the user input their own key into the application so i dont have to spend hella money
};

module.exports = router;


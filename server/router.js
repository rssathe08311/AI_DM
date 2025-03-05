// router.js
//const controllers = require('./controllers');
//
//const router = (app, openai) => {
//  // Existing route
//  app.get('/', controllers.index.index);
//
//  // New route to handle AI chat
//  app.post('/chat', (req, res) => {
//    controllers.chat.getChatResponse(req, res, openai);
//  });
//};
//
//module.exports = router;
//

// router.js
const controllers = require('./controllers');

const router = (app, openai) => {
  app.get('/', controllers.index);

  // Ensure controllers.chat.getChatResponse exists and is a function
  app.post('/chat', (req, res) => {
    controllers.chat.getChatResponse(req, res, openai);
  });
};

module.exports = router;


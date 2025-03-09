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
  //add a /image post enpoint that will communicate with imageController in controllers
  //ver 1 code in chat
  //need to create a button for testing currently and then latter will figure out smother integration with player experience
  //will have to do a similar thing with audio.
  //leave a note for the llm to create as detailed prompt as ppossible to pass into the model.


  //stretch goal to have the user input their own key into the application so i dont have to spend hella money
};

module.exports = router;


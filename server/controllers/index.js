// server/controllers/index.js
const indexController = require('./indexController');
// If you have more controllers, import them similarly
const chatController = require('./chatController'); // if applicable

module.exports = {
  index: indexController,
  chat: chatController,
};

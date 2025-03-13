// server/controllers/index.js
const indexController = require('./indexController');

const chatController = require('./chatController');
const imageController = require('./imageController');

module.exports = {
  index: indexController,
  chat: chatController,
  image: imageController,
};

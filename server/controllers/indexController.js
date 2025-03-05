// server/controllers/indexController.js
module.exports = function (req, res) {
    res.render('index', {
      title: 'Welcome!',
      pageName: 'Home'
    });
  };
  
  
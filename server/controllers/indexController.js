// server/controllers/indexController.js
module.exports = function (req, res) {
    res.render('index', {
      title: 'Adventure Forge',
      pageName: 'Quest Page'
    });
  };
  
  
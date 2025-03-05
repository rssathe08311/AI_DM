// app.js

const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');

// 2) Load dotenv BEFORE using process.env
const dotenv = require('dotenv');
dotenv.config();

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);





// 4) Import the router
const router = require('./router.js');

// 5) Set up Express
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../client/`)));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 6) Set up Handlebars
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: '',
}));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// 7) Favicon
//app.use(favicon(`${__dirname}/../client/img/favicon.png`));

// 8) Pass app + openai client to router
router(app, openai);

// 9) Listen
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${port}`);
});

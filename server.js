import express from 'express';
import UniversalRouter from 'universal-router';
import ReactDOM from 'react-dom/server';
import routes from './routes';
import request from 'request';
import colors from 'colors';

const server = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 8080;

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

const getManifest = baseUrl => new Promise((resolve, reject) => {
  const url = `${baseUrl}/asset-manifest.json`;
  console.log(`Request: ${url}`.debug);
  request.get(url, (error, response, body) =>
    error
      ? reject(`Error loading ${url}: ${error.message}`)
      : resolve(body)
  );
});

// set the view engine to ejs
server.set('view engine', 'ejs');

server.get('*', (req, res, next) => {

  // initialize universal router with fallback route 404 and a generic error page
  const router = new UniversalRouter(routes);

  // resolve path requested using universal router
  console.log(`\nRequest: ${req.path}`.debug);
  router.resolve(req.path)
    .then(({
      assets,
      component,
      title
    }) => {
        const requests = assets.map(asset => getManifest(asset));
        Promise.all(requests).then(responses => {
            console.log(`Assets Retrieved: ${responses}`.debug);
            const css = responses.map((res, i) => `<link rel="stylesheet" href="${assets[i]}/${JSON.parse(res)['main.css']}"/>`).join('');
            const js = responses.map((res, i) => `<script src="${assets[i]}/${JSON.parse(res)['main.js']}"></script>`).join('');
            console.log(`Processing Path: ${req.path}`);
            res.render('index', {
              css,
              js,
              title,
              content: ReactDOM.renderToString(component)
            });
          }
        ).catch(error => {
          console.log(`Error found while processing promises: ${error}`);
          res.send(error);
        });
      }
    ).catch(error => {
      console.log(`Path ignored: ${req.path}`.warn);
      res.send(error.message);
    });
});

server.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});
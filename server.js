import express from 'express';
import UniversalRouter from 'universal-router';
import ReactDOM from 'react-dom/server';
import routes from './routes';
import request from 'request';
import colors from 'colors';

const server = express();
const port = 3000;

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
  request.get(url, (error, response, body) => {
    if (error) return resolve(`Error loading ${url}: ${error.message}`);

    return resolve(body);
  });
});

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
        Promise.all(assets.map(asset => getManifest(asset))).then(responses => {
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
          console.log(`Error found while processing promises: ${error.message}`);
          res.send(error.message);
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
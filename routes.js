import React from 'react';
import history from './history';

const onClick = event => {
  event.preventDefault(); // prevent full page reload
  history.push(event.currentTarget.getAttribute('href')); // do SPA navigation
};

const navTitle = 'Web Tools';

const navItems = JSON.stringify([
  { "active": false, "label": "Tally", "href": "/tally" },
  { "active": false, "label": "404 Page", "href": "/404"  }
]);

const NavBar = () =>
  <standard-navbar title={navTitle} items={navItems}></standard-navbar>;

const routes = [
  {
    path: '/',
    action: () => ({
      title: 'Tally Tool',
      assets: [
        'http://embengineering.com/micro-front-ends-standard-nav-bar',
        'http://embengineering.com/micro-front-ends-tally'
      ],
      component:
        <div>
          <NavBar />
          <br />
          <div className="container">
            <h2>Home Page!</h2>
            </div>
        </div>
    })
  },
  {
    path: '/tally',
    action: () => ({
      title: 'Tally Tool',
      assets: [
        'http://embengineering.com/micro-front-ends-standard-nav-bar',
        'http://embengineering.com/micro-front-ends-tally'
      ],
      component:
        <div>
          <NavBar />
          <br />
          <tally-tool></tally-tool>
        </div>
    })
  },
  {
    path: '(.*)',
    action: () => ({
      title: '404 Not Found',
      assets: [
        'http://embengineering.com/micro-front-ends-standard-nav-bar',
        'http://embengineering.com/micro-front-ends-error-pages'
      ],
      component:
        <div>
          <NavBar />
          <error-page title="404 Not Found"></error-page>
        </div>
    })
  }
];

export default routes;
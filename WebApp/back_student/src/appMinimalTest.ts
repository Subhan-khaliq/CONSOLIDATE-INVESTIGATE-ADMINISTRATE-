const express = require('express');
const bodyParser = require('body-parser');
const { requestLogger, errorLogger } = require('./middlewares/logging');

module.exports = async function createMinimalApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use(requestLogger);
  app.get('/health', (req, res) => res.status(200).json({ ok: true }));
  // route to trigger an error
  app.get('/err', (req, res) => { throw new Error('test-error'); });
  app.use(errorLogger);
  return app;
};

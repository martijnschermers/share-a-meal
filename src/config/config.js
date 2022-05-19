require('dotenv').config();

const logger = require('tracer').console({
  format: ['{{timestamp}} [{{title}}] {{file}}:{{line}} : {{message}}'],
  preprocess: function (data) {
    data.title = data.title.toUpperCase()
  },
  dateformat: 'isoUtcDateTime',
  level: process.env.LOGLEVEL,
});

module.exports = logger;
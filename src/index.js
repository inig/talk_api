/**
 * Created by liangshan on 2017/11/5.
 */
const path = require('path');
const enkel = require('../../../ls/enkel/enkel');
const config = require('./config/config');

const instance = new enkel({
  root_path: path.resolve(__dirname, '../'),
  app_path: __dirname,
  config: config
});

instance.run();

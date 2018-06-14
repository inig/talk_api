/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    appId: {
      type: Sequelize.STRING
    },
    ticket: {
      // access_token
      type: Sequelize.STRING
    },
    expired: {
      // session_key
      type: Sequelize.STRING
    }
  }
};

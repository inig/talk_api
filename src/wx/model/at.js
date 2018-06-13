/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    token: {
      // access_token
      type: Sequelize.STRING
    },
    expired: {
      // session_key
      type: Sequelize.STRING
    }
  }
};

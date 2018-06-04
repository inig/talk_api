/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    at: {
      // access_token
      type: Sequelize.STRING
    },
    sk: {
      // session_key
      type: Sequelize.STRING
    },
    ss: {
      // session_secret
      type: Sequelize.STRING
    },
    ci: {
      // client_id
      type: Sequelize.STRING
    },
    cs: {
      // client_secret
      type: Sequelize.STRING
    },
    ei: {
      // expires_in
      type: Sequelize.STRING,
      defaultValue: (+new Date() + 30 * 60 * 60 * 1000)
    }
  },
  relations: {

  }
};

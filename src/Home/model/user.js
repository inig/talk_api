/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^[a-z_0-9]+$/i,
        notEmpty: true,
      }
    },
    phonenum: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING
    },
    nickname: {
      type: Sequelize.STRING
    },
    headIcon: {
      type: Sequelize.STRING
    },
    lastLoginTime: {
      type: Sequelize.DATE
    },
    lastLoginIp: {
      type: Sequelize.STRING
    },
    birthday: {
      type: Sequelize.DATE
    },
    gender: {
      type: Sequelize.INTEGER
    },
    website: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    }
  }
};

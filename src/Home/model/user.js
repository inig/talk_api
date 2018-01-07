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
      type: Sequelize.STRING,
        defaultValue: ''
    },
    nickname: {
      type: Sequelize.STRING,
        defaultValue: ''
    },
    headIcon: {
      type: Sequelize.STRING,
        defaultValue: ''
    },
    lastLoginTime: {
      type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    lastLoginIp: {
      type: Sequelize.STRING,
        defaultValue: ''
    },
    birthday: {
      type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    gender: {
      type: Sequelize.INTEGER,
        defaultValue: 1
    },
    website: {
      type: Sequelize.STRING,
        defaultValue: ''
    },
    status: {
      type: Sequelize.INTEGER,
        defaultValue: 1
    }
  },
  relations: {

  }
};

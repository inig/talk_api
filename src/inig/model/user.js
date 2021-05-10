/**
 * Created by liangshan on 2017/11/27.
 * Chrome扩展用户管理
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get () {
        return ~this.getDataValue('id') << 2 & 0x7FFFFFFF
      }
    },
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
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    lastLoginIp: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    birthday: {
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    gender: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    homepage: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    token: {
      type: Sequelize.TEXT,
      defaultValue: ''
    },
    plugins: {
      type: Sequelize.TEXT,
      defaultValue: ''
    },
    role: {
      type: Sequelize.STRING
    }
  }
};

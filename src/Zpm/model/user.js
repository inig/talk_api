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
    website: {
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
    }
  },
  relations: {
    plugin: {
      type: 'hasMany',
      foreignKey: 'author',
      sourceKey: 'id'
    }
  }
};

/**
 * Created by liangshan on 2017/11/27.
 * Chrome扩展用户管理
 */
const Sequelize = enkel.Sequelize
function S4 () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
function getUUID () {
  return S4() + S4() + '-' + S4() + S4() + '-' + S4() + S4()
}
module.exports = {
  safe: true,
  fields: {
    userid: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: getUUID()
    },
    faceid: {
      type: Sequelize.STRING,
      defaultValue: ''
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
    },
    role: {
      type: Sequelize.INTEGER
    },
    settings: {
      type: Sequelize.TEXT,
      defaultValue: '{}',
      get () {
        let out = {}
        try {
          out = JSON.parse(this.getDataValue('settings'))
        } catch (err) {
          out = {}
        }
        return out
      },
      set (val) {
        let insert = '{}'
        if (typeof val !== 'string') {
          insert = JSON.stringify(val)
        } else {
          insert = val
        }
        this.setDataValue('settings', insert)
      }
    }
  }
};

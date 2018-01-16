/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    title: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    desc: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    fromRole: {
      type: Sequelize.INTEGER
    },
    fromUsername: {
      type: Sequelize.STRING
    },
    fromPhonenum: {
      type: Sequelize.STRING
    },
    toRole: {
      type: Sequelize.INTEGER
    },
    toUsername: {
      type: Sequelize.STRING
    },
    toPhonenum: {
      type: Sequelize.STRING
    },
    sendTime: {
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    readTime: {
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.INTEGER,
        defaultValue: 1
    }
  }
};

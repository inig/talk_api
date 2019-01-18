/**
 * Created by liangshan on 2017/11/27.
 * 组件管理
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    remarks: {
      type: Sequelize.TEXT,
      defaultValue: ''
    },
    category: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    cid: {
      type: Sequelize.INTEGER
    },
    desc: {
      type: Sequelize.TEXT,
      defaultValue: '该组件暂无描述'
    },
    createTime: {
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    updateTime: {
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    reviewTime: {
      type: Sequelize.STRING,
      defaultValue: ''
    }
  },
  relations: {

  }
};

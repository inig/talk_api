/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    id: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    size: {
      type: Sequelize.STRING,
      default: '0'
    },
    version: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '1.0.0'
    },
    logo: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'logo.png'
    },
    author: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    homepage: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    url: { // 插件的下载地址
      type: Sequelize.STRING,
      allowNull: false
    },
    status: { // -1: 审核不通过，0: 审核中, 1: 审核通过
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    errmsg: { // 审核不通过的理由
      type: Sequelize.STRING,
      defaultValue: ''
    }
  }
};

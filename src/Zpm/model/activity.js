/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    author: {
      type: Sequelize.STRING
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    desc: {
      type: Sequelize.STRING,
      allowNull: false
    },
    uuid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    data: {
      type: Sequelize.TEXT,
      defaultValue: {}
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  }
};

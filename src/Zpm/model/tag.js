/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    text: {
      type: Sequelize.STRING,
      allowNull: false
    },
    message: {
      type: Sequelize.STRING
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false
    },
    parent: {
      type: Sequelize.STRING,
      defaultValue: '0'
    },
    status: {
      type: Sequelize.INTEGER,
        defaultValue: 1
    }
  }
};

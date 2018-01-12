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
    desc: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.INTEGER,
        defaultValue: 1
    }
  }
};

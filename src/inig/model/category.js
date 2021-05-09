/**
 * Created by liangshan on 2017/11/27.
 * 组件分类
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    label: {
      type: Sequelize.STRING,
      allowNull: false
    },
    desc: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    icon: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }
};

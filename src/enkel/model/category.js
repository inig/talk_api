/**
 * Created by liangshan on 2017/11/27.
 * 组件分类
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    title: {
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
    postTime: {
      // 文章的发布时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    uuid: {
      // 文章的唯一id
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    updateTime: {
      // 文章的更新时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    }
  }
};

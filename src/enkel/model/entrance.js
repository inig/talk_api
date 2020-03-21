/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    cover: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      defaultValue: 'url'
    },
    search: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    url: {
      type: Sequelize.STRING,
      defaultValue: ''
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
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }
};

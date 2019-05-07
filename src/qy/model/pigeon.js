/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    author: {
      // 作者
      type: Sequelize.STRING
    },
    uuid: {
      // 唯一id
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    startTime: {
      // 起始时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    endTime: {
      // 结束时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    blurred: { // 混淆后的图片
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      // 文章的状态，1为可用状态，0为不可用状态。默认为0（不可用状态）
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    score: { // 用于排名，被正确打开过 +1
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    origin: { // 原始图片
      type: Sequelize.STRING,
      allowNull: false
    },
    qid: { // 问题id，-1表示自定义问题
      type: Sequelize.INTEGER,
      default: -1
    },
    question: { // 问题
      type: Sequelize.STRING,
      defaultValue: ''
    },
    answer: { // 答案
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  }
};

/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    uid: {
      // 作者
      type: Sequelize.STRING
    },
    pid: {
      // pigeon id
      type: Sequelize.UUID
    },
    decodeTime: {
      // 解密时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    }
  }
};

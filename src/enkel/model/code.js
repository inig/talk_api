/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    expiredAt: {
      type: Sequelize.STRING,
      // get () {
      //   return Number(this.getDataValue('expiredAt'))
      // },
      // set (val) {
      //   this.setDataValue('expiredAt', String(val))
      // }
    },
    createdAt: {
      type: Sequelize.STRING,
      defaultValue: (new Date()).getTime()
    },
    code: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    deviceId: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    type: {
      type: Sequelize.STRING,
      defaultValue: '1' // 1: 短期有效；2：中期有效；3：长期有效
    }
  }
};

const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.UserModel = this.models('enkel/user');

    this.CodeModel = this.models('enkel/code');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async getRadioAction () {
    let params = this.get();
    let now = new Date()
    let date = now.getFullYear() + '-' + (now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1) + '-' + (now.getDate() < 10 ? '0' + now.getDate() : now.getDate())
    let ts = now.getTime()
    await axios.get(`http://tacc.radio.cn/pcpages/radiopages?callback=jQuery11220497578513847472_${ts}&place_id=${params.place || 3225}&date=${date}&_=${ts}`).catch(err => {
      return this.json({ status: 1002, message: '转换失败，请稍后再试', data: {} })
    }).then((res) => {
      res.data = res.data.replace(new RegExp('^jQuery11220497578513847472_' + ts + '\\\('), '').replace(/\)$/, '')
      try {
        res.data = JSON.parse(res.data)
      } catch (err) {
        res.data = {}
      }
      console.log('成功：', res.data)
      return this.json({
        status: 200, message: '成功', data: res.data
      })
    })
  }
}

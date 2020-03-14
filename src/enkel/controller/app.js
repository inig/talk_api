const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.Op = this.Sequelize.Op;

    this.XINLI_KEY = '046b6a2a43dc6ff6e770255f57328f89'

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async getRadioAction () {
    let params = this.get()

    let now = new Date()
    let date = now.getFullYear() + '-' + (now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1) + '-' + (now.getDate() < 10 ? '0' + now.getDate() : now.getDate())
    let ts = now.getTime()
    await axios.get(`http://tacc.radio.cn/pcpages/radiopages?callback=jQuery11220497578513847472_${ts}&place_id=${params.city || 3225}&date=${date}&_=${ts}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(response => {
      let data = {}
      data = response.data.replace(new RegExp('^jQuery11220497578513847472_' + ts + '\\\('), '').replace(/\)$/, '')
      try {
        data = JSON.parse(data)
      } catch (err) {
        data = {}
      }
      return this.json({
        status: 200,
        message: '成功',
        data: data.data
      })
    })
  }

  async getFmHomeListAction () {
    await axios.get(`http://yiapi.xinli001.com/fm/home-list.json?key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || []
      })
    })
  }

  async getFmNewListAction () {
    let params = this.get()
    let offset = ((params.pageIndex - 1) || 0) * (params.pageSize || 20)
    let limit = params.pageSize || 20
    await axios.get(`http://yiapi.xinli001.com/fm/newfm-list.json?offset=${offset}&limit=${limit}&key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || [],
        isEndPage: data.data.data.length < limit
      })
    })
  }

  async getFmAnchroCategoryListDetailAction () {
    let params = this.get()
    let offset = ((params.pageIndex - 1) || 0) * (params.pageSize || 20)
    let limit = params.pageSize || 20
    await axios.get(`http://yiapi.xinli001.com/fm/category-jiemu-list.json?category_id=${params.id}&offset=${offset}&limit=${limit}&key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || [],
        isEndPage: data.data.data.length < limit
      })
    })
  }

  /**
   * 电台列表
   */
  async getFmAnchroDianTaiListDetailAction () {
    let params = this.get()
    let offset = ((params.pageIndex - 1) || 0) * (params.pageSize || 20)
    let limit = params.pageSize || 20
    await axios.get(`http://yiapi.xinli001.com/fm/diantai-jiemu-list.json?offset=${offset}&limit=${limit}&diantai_id=${params.id}&key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || [],
        isEndPage: data.data.data.length < limit
      })
    })
  }

  /**
   * Banner，按tag搜索
   */
  async getFmAnchroListByTagAction () {
    let params = this.get()
    let offset = ((params.pageIndex - 1) || 0) * (params.pageSize || 20)
    let limit = params.pageSize || 20
    await axios.get(`http://bapi.xinli001.com/fm2/broadcast_list.json/?offset=${offset}&speaker_id=0&tag=${encodeURIComponent(params.tag)}&rows=${limit}&key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || [],
        isEndPage: data.data.data.length < limit
      })
    })
  }

  /**
   * 搜索
   */
  async getFmAnchroListByKwAction () {
    let params = this.get()
    let offset = ((params.pageIndex - 1) || 0) * (params.pageSize || 20)
    let limit = params.pageSize || 20
    await axios.get(`http://bapi.xinli001.com/fm2/broadcast_list.json/?q=${encodeURIComponent(params.key)}&is_teacher=&offset=${offset}&speaker_id=0&rows=${limit}&key=${this.XINLI_KEY}`).catch(err => {
      return this.json({ status: 1002, message: err.message || '获取失败，请稍后再试', data: {} })
    }).then(data => {
      return this.json({
        status: 200,
        message: '成功',
        data: data.data.data || [],
        isEndPage: data.data.data.length < limit
      })
    })
  }

}

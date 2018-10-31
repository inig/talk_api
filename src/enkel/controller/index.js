/***
 **                                                          _ooOoo_
 **                                                         o8888888o
 **                                                         88" . "88
 **                                                         (| -_- |)
 **                                                          O\ = /O
 **                                                      ____/`---'\____
 **                                                    .   ' \\| |// `.
 **                                                     / \\||| : |||// \
 **                                                   / _||||| -:- |||||- \
 **                                                     | | \\\ - /// | |
 **                                                   | \_| ''\---/'' | |
 **                                                    \ .-\__ `-` ___/-. /
 **                                                 ___`. .' /--.--\ `. . __
 **                                              ."" '< `.___\_<|>_/___.' >'"".
 **                                             | | : `- \`.;`\ _ /`;.`/ - ` : | |
 **                                               \ \ `-. \_ __\ /__ _/ .-` / /
 **                                       ======`-.____`-.___\_____/___.-`____.-'======
 **                                                          `=---='
 **
 **                                       .............................................
 **                                              佛祖保佑             永无BUG
 **                                      佛曰:
 **                                              写字楼里写字间，写字间里程序员；
 **                                              程序人员写程序，又拿程序换酒钱。
 **                                              酒醒只在网上坐，酒醉还来网下眠；
 **                                              酒醉酒醒日复日，网上网下年复年。
 **                                              但愿老死电脑间，不愿鞠躬老板前；
 **                                              奔驰宝马贵者趣，公交自行程序员。
 **                                              别人笑我忒疯癫，我笑自己命太贱；
 **                                              不见满街漂亮妹，哪个归得程序员？
 */
/**
 * Created by liangshan on 2017/11/13.
 */
const cheerio = require('cheerio');
const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init(http) {
    super.init(http);

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  getCookie(name) {
    if (!this.request.headers || !this.request.headers.cookies) {
      return (!name ? {} : '')
    }
    let _cookies = this.request.headers.cookies.replace(/; /g, ';')
    let outObj = {}
    if (_cookies.trim() === '') {
      if (!name) {
        return {}
      } else {
        return ''
      }
    }
    let _cookiesArr = _cookies.split(';')
    for (let i = 0; i < _cookiesArr.length; i++) {
      if (!outObj.hasOwnProperty(_cookiesArr[i].split('=')[0])) {
        outObj[_cookiesArr[i].split('=')[0]] = _cookiesArr[i].split('=')[1]
      }
    }
    if (!name) {
      return outObj
    } else {
      return outObj[name] || ''
    }
  }

  checkAuth() {
    let enkelCookie = this.getCookie('enkel')
    if (!enkelCookie || enkelCookie.trim() !== '9d935f95a1630e1282ae9861f16fcf0b') {
      return false
    } else {
      return true
    }
  }

  async indexAction() {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    if (!this.checkAuth()) {
      return this.json({ status: 1001, message: '请求不合法', data: {} })
    }
    let params = await this.post();
    let requestUrl = 'https://ip.cn/index.php'
    if (params.ip) {
      requestUrl += '?ip=' + params.ip
    }
    return axios.get(requestUrl).catch(err => {
      return this.json({ status: 1002, message: '查询失败，请稍后再试', data: {} })
    }).then(({ data }) => {
      const $ = cheerio.load(data)
      return this.json({
        status: 200, message: '成功', data: {
          ip: $('#result').find('code').eq(0).text(),
          address: $('#result').find('code').eq(1).text(),
          geoIp: $('#result').html().replace(/(.*geoip:)([^<]*)(<\/p>.*)/i, '$2').trim()
        }
      })
    })
  }

  async delegateAction() {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    let _requestParams = {
      baseURL: params.baseURL,
      url: params.url,
      method: params.method || 'get'
    }
    if (params.method && (params.method.toLowerCase() === 'post')) {
      _requestParams.data = params.data
    } else {
      if (params.data) {
        _requestParams.url = _requestParams.url + qs.stringify(params.data)
      } else { }
    }
    return axios(_requestParams).catch(err => {
      return this.json({ status: 1002, message: '转换失败，请稍后再试', data: {} })
    }).then(({ data }) => {
      return this.json({
        status: 200, message: '成功', data: data
      })
    })
  }

  getPinyinToken() {
    return new Promise(resolve => {
      let requestUrl = 'https://www.qqxiuzi.cn/zh/pinyin/'
      axios.get(requestUrl).catch(err => {
        resolve('')
      }).then(({ data }) => {
        const $ = cheerio.load(data)
        let _token = $('head').html().replace(/\r/ig, '').replace(/\n|\s/ig, '')
        _token = _token.replace(/(.*&token=)([a-z0-9_]*)('.*)/i, '$2').trim()
        resolve(_token)
      })
    })
  }

  async pinyinAction() {
    // if (!this.isPost()) {
    //   return this.json({status: 405, message: '请求方法不正确', data: {}});
    // }
    // if (!this.checkAuth()) {
    //   return this.json({status: 1001, message: '请求不合法', data: {}})
    // }
    let _token = await this.getPinyinToken()
    if (!_token) {
      return this.json({ status: 1002, message: '转换失败，请稍后再试', data: {} });
    }
    // let params = await this.post();
    let params = this.get();
    let requestUrl = 'https://www.qqxiuzi.cn/zh/pinyin/show.php'
    if (!params.t) {
      return this.json({ status: 200, message: '成功', data: { result: '' } })
    }
    let requestParams = {
      t: params.t,
      d: 1,
      s: null,
      k: 1,
      b: null,
      h: null,
      u: null,
      v: null,
      y: null,
      z: null,
      f: null,
      token: _token
    }
    console.log('>@@@@@@@@@@', requestParams)
    return axios({
      method: 'post',
      url: requestUrl + '?' + qs.stringify(requestParams),
      header: {
        'Content-type': 'application/x-www-form-urlencoded'
      }
    }).catch(err => {
      return this.json({ status: 1002, message: '转换失败，请稍后再试', data: {} })
    }).then(({ data }) => {
      console.log('>>>>,,,,,,,,,', data)
      return this.json({
        status: 200, message: '成功', data: {
          result: data
        }
      })
    })
  }
}

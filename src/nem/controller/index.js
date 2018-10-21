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
const Encrypt = require('../../../Static/js/crypto.js')
const crypto = require('crypto');
const dir = "/v1";

module.exports = class extends enkel.controller.base {
  init(http) {
    super.init(http);

    this.response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
    this.response.setHeader("Access-Control-Allow-Credentials", "true");
  }

  getCookie(name) {
    if (!this.request.headers || !this.request.headers.cookie) {
      return (!name ? {} : '')
    }
    let _cookies = this.request.headers.cookie.replace(/; /g, ';')
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

  async v1Action() {
    // if (!this.isPost()) {
    //   return this.json({
    //     status: 405,
    //     message: '请求方法不正确',
    //     data: {}
    //   });
    // }
    // if (!this.checkAuth()) {
    //   return this.json({status: 1001, message: '请求不合法', data: {}})
    // }
    let params = await this.post();
    console.log('params; ', params)
    if (!params.url) {
      return this.json({
        status: 1001,
        message: 'url不能为空',
        data: {}
      })
    }
    let requestParams = {
      method: params.method || 'GET',
      url: params.url,
      baseURL: params.baseURL,
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'http://music.163.com',
        'Host': 'music.163.com',
        'Cookie': this.request.headers.cookies,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
      }
    }
    let cryptoreq
    let _data
    if (params.method.toLowerCase() === 'get') {
      if (params.data) {
        cryptoreq = Encrypt(qs.parse(params.data))
        _data = {
          params: cryptoreq.params,
          encSecKey: cryptoreq.encSecKey
        }
        requestParams.url = params.url + '?' + qs.stringify(_data)
      } else {
        requestParams.url = params.url
      }
    } else {
      requestParams.url = params.url
      if (params.data) {
        cryptoreq = Encrypt(qs.parse(params.data))
        _data = {
          params: cryptoreq.params,
          encSecKey: cryptoreq.encSecKey
        }
        requestParams.url += '?' + qs.stringify(_data)
      }
    }
    if (params.headers) {
      requestParams.headers = qs.parse(params.headers)
    }
    console.log('requestParams: ', requestParams)
    axios(requestParams).then(({
      data,
      headers
    }) => {
      return this.json({
        status: 200,
        message: '成功',
        headers: headers,
        data: data
      })
    }).catch(err => {
      return this.json({
        status: 1002,
        message: err.message,
        data: {}
      })
    })
  }
}
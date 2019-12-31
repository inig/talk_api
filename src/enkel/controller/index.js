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
const jwt = require('jsonwebtoken');
const secret = 'com.dei2';
const tokenExpiresIn = '7d';

const GitHubOptions = {
  clientId: 'a054a4c2a2fa61650e47',
  secret: '371dab46666ca7ae6867e6dc553fe4d49902a8e1'
}

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

  getCookie (name) {
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

  async checkLogin (args) {
    if (!args.token || args.token === '') {
      return false;
    }
    let _status = jwt.verify(args.token, secret, (err, decoded) => {
      return err || {};
    });
    if (_status.name === 'TokenExpiredError') {
      return false;
    } else {
      let loginUser = await this.UserModel.findOne({ where: { username: args.username } });
      if (!loginUser) {
        loginUser = await this.UserModel.findOne({ where: { phonenum: args.username } });
        if (!loginUser) {
          return false;
        } else { }
      } else { }
      if (loginUser.token === '') {
        return false;
      } else {
        let _storeTokenStatus = jwt.verify(args.token, secret, (err, decoded) => {
          return err || {};
        });
        if (_storeTokenStatus.name === 'TokenExpiredError') {
          return false;
        } else {
        }
        return true;
      }
    }
  }

  checkAuth () {
    let enkelCookie = this.getCookie('enkel')
    if (!enkelCookie || enkelCookie.trim() !== '9d935f95a1630e1282ae9861f16fcf0b') {
      return false
    } else {
      return true
    }
  }

  async indexAction () {
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

  async delegateAction () {
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

  getPinyinToken () {
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

  async pinyinAction () {
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

  getImagesAction () {
    return this.json({
      status: 200,
      message: '成功',
      list: [
        {
          label: '风景',
          sublist: [
            {
              label: '风景1',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery01.jpg'
            },
            {
              label: '风景2',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery02.jpeg'
            },
            {
              label: '风景3',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery03.jpeg'
            },
            {
              label: '风景4',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery04.jpeg'
            },
            {
              label: '风景5',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery05.jpeg'
            },
            {
              label: '风景6',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery06.jpeg'
            },
            {
              label: '风景7',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery07.jpeg'
            },
            {
              label: '风景8',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery08.jpeg'
            },
            {
              label: '风景9',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery09.jpeg'
            },
            {
              label: '风景10',
              img: 'https://static.dei2.com/extensions/img/scenery/scenery10.jpeg'
            }
          ]
        },
        {
          label: '卡通',
          sublist: [
            {
              label: '人物1',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon01.jpg'
            },
            {
              label: '人物2',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon02.jpeg'
            },
            {
              label: '人物3',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon03.jpeg'
            },
            {
              label: '人物4',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon04.jpeg'
            },
            {
              label: '人物5',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon05.jpg'
            },
            {
              label: '人物7',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon07.jpg'
            },
            {
              label: '人物9',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon09.jpg'
            },
            {
              label: '人物10',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon10.jpg'
            },
            {
              label: '人物13',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon13.jpg'
            },
            {
              label: '人物15',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon15.jpg'
            },
            {
              label: '人物16',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon16.jpg'
            },
            {
              label: '人物17',
              img: 'https://static.dei2.com/extensions/img/cartoon/cartoon17.jpg'
            }
          ]
        }
      ]
    })
  }

  async getGankDataAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    if (!this.checkAuth()) {
      return this.json({ status: 1001, message: '请求不合法', data: {} })
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({ status: 401, message: '保存失败', data: { needLogin: true } });
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      if (!_isLegalLogin) {
        return this.json({ status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true } });
      } else {
        let baseUrl = 'http://gank.io/api/data'
        let category = params.category || 'all'
        let pageSize = params.pageSize || 30
        let pageIndex = params.pageIndex || 1
        let requestUrl = baseUrl + '/' + encodeURIComponent(category) + '/' + pageSize + '/' + pageIndex
        return axios.get(requestUrl).catch(err => {
          return this.json({ status: 1002, message: '查询失败，请稍后再试', data: {} })
        }).then(({ data }) => {
          let _data = data.results ? data.results : [] // .filter(item => item.src = item.url)
          return this.json({
            status: 200,
            message: '成功',
            data: {
              list: _data || [],
              count: _data.length,
              pageIndex: pageIndex,
              pageSize: pageSize
            }
          })
        })
      }
    }
  }

  /**
   * 生成证件照
   */
  async getIdImageAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    if (!this.checkAuth()) {
      return this.json({ status: 1001, message: '请求不合法', data: {} })
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({ status: 401, message: '保存失败', data: { needLogin: true } });
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      let _requestParams = JSON.parse(JSON.stringify(params))
      if (_requestParams.hasOwnProperty('phonenum')) {
        _requestParams.phonenum = null
        delete _requestParams.phonenum
      }
      if (_requestParams.hasOwnProperty('token')) {
        _requestParams.token = null
        delete _requestParams.token
      }
      if (_requestParams.hasOwnProperty('image_base64')) {
        _requestParams.image_base64 = _requestParams.image_base64.replace('data:image/octet-stream;base64,', '')
      }
      if (!_isLegalLogin) {
        return this.json({ status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true } });
      } else {
        return axios({
          method: 'post',
          url: 'https://api-cn.faceplusplus.com/humanbodypp/v2/segment',
          timeout: 3 * 60 * 1000,
          data: qs.stringify(Object.assign(_requestParams, {
            api_key: 'BDwv4OaugITE8HVAbe12HqOy46VOceMt',
            api_secret: 'JBkSDM5LKyl7jTsuZBC2aLXBffdDdZrJ'
          }))
        }).catch(err => {
          return this.json({ status: 1002, message: '查询失败，请稍后再试', data: {} })
        }).then(({ data }) => {
          return this.json({
            status: 200,
            message: '成功',
            data: data
          })
        })
      }
    }
  }

  getGitHubUserInfo (data) {
    return new Promise(async (resolve) => {
      await axios({
        method: 'get',
        url: 'https://api.github.com/user?access_token=' + data.accessToken,
        timeout: 3 * 60 * 1000
      }).catch(err => {
        resolve({})
      }).then(({ data }) => {
        resolve(data.data)
      })
    })
  }

  formatArgs (argStr) {
    let args = argStr.split('&')
    let i = 0
    let outArgs = {}
    for (i; i < args.length; i++) {
      let tempArg = args[i].split('=')
      outArgs[tempArg[0]] = tempArg[1]
    }
    return outArgs
  }

  rdAction () {
    let params = this.get()
    console.log('....', 'https://github.com/login/oauth/authorize?client_id=' + GitHubOptions.clientId + '&scope=user,email&state=' + (new Date().getTime()))

    this.response.setHeader('location', 'https://github.com/login/oauth/authorize?client_id=' + GitHubOptions.clientId + '&scope=user,email&state=' + (new Date().getTime() + '&redirect_uri=' + encodeURIComponent(params.redirectUrl)));
    this.response.statusCode = '302'
    return this.json({ status: 200, message: '成功' })
  }

  /**
   * github oAuth 登录callback
   */
  async githubAction () {
    let params = this.get()
    console.log('github params: ', params)
    let code = params.code || '57593fac5c707825f28b'
    let path = 'https://github.com/login/oauth/access_token'
    let requestParams = {
      client_id: GitHubOptions.clientId,
      client_secret: GitHubOptions.secret,
      code: code
    }
    await axios({
      method: 'post',
      url: path,
      timeout: 3 * 60 * 1000,
      data: qs.stringify(requestParams)
    }).catch(err => {
      console.log('error 01: ', err.message)
      return this.json({ status: 1002, message: err.message || '查询失败，请稍后再试', data: {} })
    }).then(async ({ data }) => {
      let args = this.formatArgs(data)
      console.log('access_token: ', args)
      if (args.hasOwnProperty('error')) {
        // 错误
        return this.json({
          status: 1003,
          message: args.error_description ? args.error_description.replace(/\+/g, ' ') : '登录失败，请重试',
          data: {}
        })
      } else {
        return args.access_token
      }
    }).then(async accessToken => {
      await axios({
        method: 'get',
        url: 'https://api.github.com/user?access_token=' + accessToken,
        timeout: 3 * 60 * 1000
      }).catch(e => {
        console.log('error 02: ', e.message)
        return this.json({
          status: 1003,
          message: e.message || '登录失败',
          data: {}
        })
      }).then((res) => {
        console.log('user info: ', res.data)
        if (Object.keys(res.data).length > 0) {
          this.response.setHeader('location', decodeURIComponent(params.redirect_uri));
          this.response.statusCode = '302'
          return this.json({ status: 200, message: '成功' })
          return this.json({
            status: 200,
            message: '成功',
            data: res.data
          })
        } else {
          return this.json({
            status: 1003,
            message: '登录失败',
            data: {}
          })
        }
      })
    })
  }

  S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  getUUID () {
    return this.S4() + this.S4() + '-' + this.S4() + this.S4() + '-' + this.S4() + this.S4()
  }

  /**
   * 生成 视频播放的code
   */
  async createCodeAction () {
    let code = this.getUUID()
    await this.CodeModel.create({
      expiredAt: (new Date()).getTime() + 24 * 60 * 60 * 1000,
      type: '1',
      code: code,
      deviceId: ''
    });
    let res = await this.CodeModel.findOne({
      where: { code: code },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: {
          code: code
        }
      })
    }
  }

  async createVipCodeAction () {
    let code = this.getUUID()
    await this.CodeModel.create({
      expiredAt: (new Date()).getTime() + 30 * 24 * 60 * 60 * 1000,
      type: '2',
      code: code,
      deviceId: ''
    });
    let res = await this.CodeModel.findOne({
      where: { code: code },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }

  async createSuperCodeAction () {
    let code = this.getUUID()
    await this.CodeModel.create({
      expiredAt: (new Date()).getTime() + 99 * 12 * 30 * 24 * 60 * 60 * 1000,
      type: '3',
      code: code,
      deviceId: ''
    });
    let res = await this.CodeModel.findOne({
      where: { code: code },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }

  /**
   * 获取 视频播放的code
   */
  async getCodeAction () {
    let res = await this.CodeModel.findOne({
      where: {
        expiredAt: {
          [this.Op.gt]: (new Date()).getTime()
        },
        type: '1'
      },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }

  async getVipCodeAction () {
    let res = await this.CodeModel.findOne({
      where: {
        expiredAt: {
          [this.Op.gt]: (new Date()).getTime()
        },
        type: '2'
      },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }

  async getSuperCodeAction () {
    let res = await this.CodeModel.findOne({
      where: {
        expiredAt: {
          [this.Op.gt]: (new Date()).getTime()
        },
        type: '3'
      },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }

  async validCodeAction () {
    let params = this.get();
    if (!params.code) {
      return this.json({ status: 1003, message: 'Code不能为空', data: null })
    }
    let res = await this.CodeModel.findOne({
      where: {
        expiredAt: {
          [this.Op.gt]: (new Date()).getTime()
        },
        code: params.code
      },
      attributes: { exclude: ['id', 'expiredAt', 'createdAt', 'updatedAt', 'deviceId', 'type'] }
    });
    if (!res) {
      return this.json({
        status: 1001,
        data: null
      })
    } else {
      return this.json({
        status: 200,
        data: res
      })
    }
  }
}

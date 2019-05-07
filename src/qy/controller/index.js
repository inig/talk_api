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

/**
 * 去年柳絮飞时节，记得金笼放雪衣
 */

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.PigeonModel = this.models('qy/pigeon');
    this.UserModel = this.models('enkel/user');

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

  async createAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    if (!this.checkAuth()) {
      return this.json({ status: 1001, message: '请求不合法', data: {} })
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({ status: 401, message: '发送失败', data: { needLogin: true } });
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      if (!_isLegalLogin) {
        return this.json({ status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true } });
      } else {
        // let avatarPath = '/mnt/srv/web_static/plugins_admin/img';
        let avatarPath = '/Users/liangshan/workspace/workspace_chrome_extensions/img';
        try {
          let uploadedFile = await this.upload({
            accept: params.accept,
            size: Number(params.ms) * 1024,
            uploadDir: avatarPath,
            rename: params.rn || false,
            multiples: false
          });

          let searchCondition = {};
          searchCondition['phonenum'] = params.phonenum;
          let fileUrl = `https://static.dei2.com/plugins_admin/img/${uploadedFile.filename}`;
          let avatarStatus = await this.UserModel.update({
            headIcon: fileUrl
          }, {
              where: searchCondition
            });
          if (avatarStatus[0] > 0) {
            return this.json({
              status: 200, message: '头像修改成功', data: {
                path: fileUrl
              }
            });
          } else {
            return this.json({ status: 401, message: '头像修改失败', data: {} });
          }
        } catch (err) {
          return this.json({ status: 401, message: JSON.stringify(err) || '', data: {} });
        }
      }
    }
  }
}

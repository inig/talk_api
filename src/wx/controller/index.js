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
const axios = require('axios');
const appId = 'wx06a726555d597a4b';
const appSecret = '84bd132e01e2beec3c9d6b922ef5a7b4';
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    const that = this;

    this.AtModel = this.models('wx/at');
    this.TicketModel = this.models('wx/ticket');

    this.getAsync = function (arg) {
      return new Promise((resolve, reject) => {
        that.redis.get(arg, (err, p) => {
          if (err) {
            reject(new Error('error'))
          }
          resolve(p)
        })
      }).catch(err => {
        return err.message
      })
    }
  }

  async getAccessTokenAction () {
    // let appId = 'wxb98c89add806fba8';
    const WX_ACCESS_TOKEN = 'wx_access_token_' + appId;
    // let appSecret = '57726b87b2b7ac2e8144bf76887597f4';
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
    const EXPIRED_IN = 7200 * 1000;

    const that = this;
    const _getAccessTokenFromApi = async function () {
      let atDataFromApi = await axios({
        url: requestUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (atDataFromApi.data.access_token && atDataFromApi.data.access_token !== '') {
        // 获取 access_token成功，缓存access_token，有效期7200s。
        // 写redis
        that.redis.set(WX_ACCESS_TOKEN, atDataFromApi.data.access_token);
        that.redis.pexpireat(WX_ACCESS_TOKEN, (+new Date()) + Number(EXPIRED_IN));
        // 写数据库
        await that.AtModel.create({
          appId: appId,
          token: atDataFromApi.data.access_token,
          expired: (+new Date()) + Number(EXPIRED_IN)
        });
        return that.json({status: 200, message: '成功', data: { access_token: atDataFromApi.data.access_token }});
      } else {
        return that.json({status: atDataFromApi.errcode || 1001, message: atDataFromApi.data.errmsg || '失败', data: {}});
      }
    }

    // 从redis中取access_token
    let k = await this.getAsync(WX_ACCESS_TOKEN);
    if (!k) {
      // redis中不存在，则从数据库中找
      let atData = await this.AtModel.findOne({
        where: {
          appId: appId
        }
      });
      if (!atData) {
        // 数据库中不存在，则调接口获取access_token
        await _getAccessTokenFromApi();
      } else {
        // 数据库中存在，redis中不存在access_token
        // 写redis
        if ((+new Date()) >= Number(atData.expired)) {
          // 数据库中的access_token已经过期
          await this.AtModel.destroy({
            where: {
              token: atData.token
            }
          });
          await _getAccessTokenFromApi();
        } else {
          this.redis.set(WX_ACCESS_TOKEN, atData.token);
          this.redis.pexpireat(WX_ACCESS_TOKEN, (+new Date()) + Number(EXPIRED_IN));
          return this.json({status: 200, message: '成功', data: { access_token: atData.token }});
        }
      }
    } else {
      // redis中存在
      return this.json({status: 200, message: '成功', data: { access_token: k }});
    }
  }

  async _getAccessToken () {
    // let appId = 'wxb98c89add806fba8';
    const WX_ACCESS_TOKEN = 'wx_access_token_' + appId;
    // let appSecret = '57726b87b2b7ac2e8144bf76887597f4';
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
    const EXPIRED_IN = 7200 * 1000;

    const that = this;
    const _getAccessTokenFromApi = async function () {
      let atDataFromApi = await axios({
        url: requestUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (atDataFromApi.data.access_token && atDataFromApi.data.access_token !== '') {
        // 获取 access_token成功，缓存access_token，有效期7200s。
        // 写redis
        that.redis.set(WX_ACCESS_TOKEN, atDataFromApi.data.access_token);
        that.redis.pexpireat(WX_ACCESS_TOKEN, (+new Date()) + Number(EXPIRED_IN));
        // 写数据库
        await that.AtModel.create({
          appId: appId,
          token: atDataFromApi.data.access_token,
          expired: (+new Date()) + Number(EXPIRED_IN)
        });
        return atDataFromApi.data.access_token;
      }
    }

    // 从redis中取access_token
    let k = await this.getAsync(WX_ACCESS_TOKEN);
    if (!k) {
      // redis中不存在，则从数据库中找
      let atData = await this.AtModel.findOne({
        where: {
          appId: appId
        }
      });
      if (!atData) {
        // 数据库中不存在，则调接口获取access_token
        await _getAccessTokenFromApi();
      } else {
        // 数据库中存在，redis中不存在access_token
        // 写redis
        if ((+new Date()) >= Number(atData.expired)) {
          // 数据库中的access_token已经过期
          await this.AtModel.destroy({
            where: {
              token: atData.token
            }
          });
          await _getAccessTokenFromApi();
        } else {
          this.redis.set(WX_ACCESS_TOKEN, atData.token);
          this.redis.pexpireat(WX_ACCESS_TOKEN, (+new Date()) + Number(EXPIRED_IN));
          return atData.token;
        }
      }
    } else {
      // redis中存在
      return k;
    }
  }

  //从客户提供的api获取accesstoken，防止重复生成，超过2000次
  async _getAccessTokenDicFromCustomer() {
    let customerUrl = 'http://xiaohuashijie.medsagacityidea.com/get-appDevInfo';
    //结构如下：
    //{"jsApiTicket":"kgt8ON7yVITDhtdwci0qeXkLh1zDw3lNuXxrVjTaHTUbt9n4PVM1VRcxbKwMocvxFom7ppIzqntswwGWBf0yfw",
    //"accessToken":"11_cVaoZE76YugaHecHkKbnIvtSrRbd62wDPoXVDT9SxooO9pON_jCpC1dkjDypZUSbYvogYKXWX4RkM8GM9vwvWAKaSZ79ptD0lzTYlNudse8DemANOpq5hcp--fUP9_5jFOWjQFKCeY_KjiPFTHRfAJAKYI",
    //"secret":"84bd132e01e2beec3c9d6b922ef5a7b4","appid":"wx06a726555d597a4b"}
    let accessTokenDic = await axios({
      url: customerUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (typeof(accessTokenDic.data) == 'string') {
      accessTokenDic = JSON.parse(accessTokenDic.data);
    }
    return accessTokenDic.data || {};
  }

  async getJsApiTicketAction () {
    let accessToken = this.get('at')
    // let appId = 'wxb98c89add806fba8';
    const WX_JS_API_TICKET = 'wx_js_api_ticket_' + appId;
    // let appSecret = '57726b87b2b7ac2e8144bf76887597f4';
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';
    const EXPIRED_IN = 7200 * 1000;

    const that = this;
    const _getJsApiTicketFromApi = async function () {
      let atDataFromApi = await axios({
        url: requestUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if ((atDataFromApi.data.errmsg === 'ok') && atDataFromApi.data.ticket && atDataFromApi.data.ticket !== '') {
        // 获取 access_token成功，缓存access_token，有效期7200s。
        // 写redis
        that.redis.set(WX_JS_API_TICKET, atDataFromApi.data.ticket);
        that.redis.pexpireat(WX_JS_API_TICKET, (+new Date()) + Number(EXPIRED_IN));
        // 写数据库
        await that.TicketModel.create({
          appId: appId,
          ticket: atDataFromApi.data.ticket,
          expired: (+new Date()) + Number(EXPIRED_IN)
        });
        return that.json({status: 200, message: '成功', data: { ticket: atDataFromApi.data.ticket }});
      }
    }

    // 从redis中取access_token
    let k = await this.getAsync(WX_JS_API_TICKET);
    if (!k) {
      // redis中不存在，则从数据库中找
      let atData = await this.TicketModel.findOne({
        where: {
          appId: appId
        }
      });
      if (!atData) {
        // 数据库中不存在，则调接口获取access_token
        await _getJsApiTicketFromApi();
      } else {
        // 数据库中存在，redis中不存在access_token
        // 写redis
        if ((+new Date()) >= Number(atData.expired)) {
          // 数据库中的access_token已经过期
          await this.TicketModel.destroy({
            where: {
              ticket: atData.ticket
            }
          });
          await _getJsApiTicketFromApi();
        } else {
          this.redis.set(WX_JS_API_TICKET, atData.ticket);
          this.redis.pexpireat(WX_JS_API_TICKET, (+new Date()) + Number(EXPIRED_IN));
          return this.json({status: 200, message: '成功', data: { ticket: atData.ticket }});
        }
      }
    } else {
      // redis中存在
      return this.json({status: 200, message: '成功', data: { ticket: k }});
    }
  }

  async _getJsApiTicket (at) {
    let accessToken = at
    // let appId = 'wxb98c89add806fba8';
    const WX_JS_API_TICKET = 'wx_js_api_ticket_' + appId;
    // let appSecret = '57726b87b2b7ac2e8144bf76887597f4';
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';
    const EXPIRED_IN = 7200 * 1000;

    const that = this;
    const _getJsApiTicketFromApi = async function () {
      let atDataFromApi = await axios({
        url: requestUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if ((atDataFromApi.data.errmsg === 'ok') && atDataFromApi.data.ticket && atDataFromApi.data.ticket !== '') {
        // 获取 access_token成功，缓存access_token，有效期7200s。
        // 写redis
        that.redis.set(WX_JS_API_TICKET, atDataFromApi.data.ticket);
        that.redis.pexpireat(WX_JS_API_TICKET, (+new Date()) + Number(EXPIRED_IN));
        // 写数据库
        await that.TicketModel.create({
          appId: appId,
          ticket: atDataFromApi.data.ticket,
          expired: (+new Date()) + Number(EXPIRED_IN)
        });
        return atDataFromApi.data.ticket;
      }
    }

    // 从redis中取access_token
    let k = await this.getAsync(WX_JS_API_TICKET);
    if (!k) {
      // redis中不存在，则从数据库中找
      let atData = await this.TicketModel.findOne({
        where: {
          appId: appId
        }
      });
      if (!atData) {
        // 数据库中不存在，则调接口获取access_token
        await _getJsApiTicketFromApi();
      } else {
        // 数据库中存在，redis中不存在access_token
        // 写redis
        if ((+new Date()) >= Number(atData.expired)) {
          // 数据库中的access_token已经过期
          await this.TicketModel.destroy({
            where: {
              ticket: atData.ticket
            }
          });
          await _getJsApiTicketFromApi();
        } else {
          this.redis.set(WX_JS_API_TICKET, atData.ticket);
          this.redis.pexpireat(WX_JS_API_TICKET, (+new Date()) + Number(EXPIRED_IN));
          return atData.ticket;
        }
      }
    } else {
      // redis中存在
      return k;
    }
  }

  //实时获取ticket
  async _getJsApiTicket2 (at) {
    let accessToken = at;
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';
    let atDataFromApi = await axios({
      url: requestUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if ((atDataFromApi.data.errmsg === 'ok') && atDataFromApi.data.ticket && atDataFromApi.data.ticket !== '') {
      return atDataFromApi.data.ticket;
    } else {
      return '';
    }
  }

  async getWxConfigAction () {
    let url = await this.post('url');
    let noncestr = Math.random().toString(36).substr(2, 15);
    let timestamp = (parseInt((new Date().getTime() / 1000) + '') + '');
    let _tokenDic = await this._getAccessTokenDicFromCustomer();
    let _token = _tokenDic.accessToken;
    let _ticket = _tokenDic.jsApiTicket;

    const raw = function (args) {
      let keys = Object.keys(args);
      keys = keys.sort()
      let newArgs = {};
      keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
      });

      let string = '';
      for (let k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
      }
      string = string.substr(1);
      return string;
    };
    let ret = {
      jsapi_ticket: _ticket,
      nonceStr: noncestr,
      timestamp: timestamp,
      url: url
    };
    let string = raw(ret);
    const jsSHA = require('jssha');
    let shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');
    if (ret.jsapi_ticket) {
      delete ret.jsapi_ticket
    }
    ret.appId = _tokenDic.appid;
    // ret.token = _tokenDic.accessToken;
    // ret.ticket = _tokenDic.jsApiTicket;
    return this.json({status: 200, message: '成功', data: ret});
  }
}

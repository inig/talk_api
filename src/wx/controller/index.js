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
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    const that = this;

    this.AtModel = this.models('wx/at');

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
    const WX_ACCESS_TOKEN = 'wx_access_token';
    let appId = 'wxb98c89add806fba8';
    let appSecret = '57726b87b2b7ac2e8144bf76887597f4';
    let requestUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
    const EXPIRED_IN = 5 * 1000;

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
          token: atDataFromApi.data.access_token,
          expired: (+new Date()) + Number(EXPIRED_IN)
        });
        return that.json({status: 200, message: '成功', data: { access_token: atDataFromApi.data.access_token }});
      }
    }

    // 从redis中取access_token
    let k = await this.getAsync(WX_ACCESS_TOKEN);
    if (!k) {
      // redis中不存在，则从数据库中找
      let atData = await this.AtModel.findOne();
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
    // return axios({
    //   url: requestUrl,
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // }).then(({data}) => {
    //   if (data.access_token && data.access_token !== '') {
    //     // 获取 access_token成功，缓存access_token，有效期7200s。
    //   }
    //   return this.json({status: 200, message: '成功', data: data});
    // }).catch(err => {
    //   return this.json({status: 401, message: err.message, data: {}});
    // })
  }
}

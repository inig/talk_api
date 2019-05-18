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
const fs = require('fs')
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const secret = 'com.dei2';
const tokenExpiresIn = '7d';

function S4 () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
function getUUID (prefix) {
  return (prefix || '') + (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

/**
 * 去年柳絮飞时节，记得金笼放雪衣
 */

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.PigeonModel = this.models('qy/pigeon');
    this.UserModel = this.models('enkel/user');
    this.AnswerModel = this.models('qy/answer');

    this.PigeonModel.belongsTo(this.UserModel, {
      // as: 'user',
      foreignKey: 'author',
      targetKey: 'phonenum'
    })

    this.PigeonModel.hasMany(this.AnswerModel, {
      foreignKey: 'pid',
      sourceKey: 'uuid'
    })

    this.Op = this.Sequelize.Op

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
      return this.json({ status: 405, message: '请求姿势不正确', data: {} });
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
    const that = this
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求姿势不正确', data: {} });
    }
    // if (!this.checkAuth()) {
    //   return this.json({ status: 1001, message: '请求不合法', data: {} })
    // }
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
        let avatarPath = '/mnt/srv/web_static/qy/uploads/img';
        // let avatarPath = '/Users/liangshan/workspace/workspace_chrome_extensions/img';
        try {
          let originData = params.origin.replace(/^data:image\/\w+;base64,/, "");
          var dataBuffer = Buffer.from(originData, 'base64');
          let imageName = getUUID()
          let blurredImageName = getUUID('blurred_')
          fs.writeFile(avatarPath + "/" + imageName + ".png", dataBuffer, function (err) {
            if (err) {
              return that.json({
                status: 1004,
                message: err.message || '发送失败，请稍后再试',
                data: {}
              })
            }
          });

          let blurredData = params.blurred.replace(/^data:image\/\w+;base64,/, "");
          var blurredBuffer = Buffer.from(blurredData, 'base64');
          fs.writeFile(avatarPath + "/" + blurredImageName + ".png", blurredBuffer, function (err) {
            if (err) {
              return that.json({
                status: 1004,
                message: err.message || '发送失败，请稍后再试',
                data: {}
              })
            }
          });

          let createdData = await this.PigeonModel.create({
            author: params.phonenum,
            blurred: `https://static.dei2.com/qy/uploads/img/${blurredImageName}.png`,
            origin: `https://static.dei2.com/qy/uploads/img/${imageName}.png`,
            status: 1,
            score: 0,
            qid: -1,
            question: params.question,
            caption: params.question,
            answer: params.answer,
            startTime: params.startTime || (new Date()).getTime(),
            endTime: params.endTime || ((new Date()).getTime() + 30 * 24 * 60 * 60 * 1000)
          })
          if (createdData) {
            return this.json({
              status: 200, message: '发送成功', data: {
                author: params.phonenum,
                path: `https://static.dei2.com/qy/uploads/img/${blurredImageName}.png`,
                caption: params.question
              }
            });
          } else {
            return this.json({ status: 401, message: '发送失败', data: {} });
          }
        } catch (err) {
          return this.json({ status: 401, message: JSON.stringify(err) || '', data: {} });
        }
      }
    }
  }

  async qAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求姿势不正确', data: {} });
    }
    // if (!this.checkAuth()) {
    //   return this.json({ status: 1001, message: '请求不合法', data: {} })
    // }
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
        let _searchCondition = JSON.parse(JSON.stringify(params));
        if (_searchCondition.token) {
          delete _searchCondition.token
        }
        if (_searchCondition.phonenum) {
          delete _searchCondition.phonenum
        }
        if (_searchCondition.pageIndex) {
          delete _searchCondition.pageIndex
        }
        if (_searchCondition.pageSize) {
          delete _searchCondition.pageSize
        }
        if (_searchCondition.offsetCount) {
          delete _searchCondition.offsetCount
        }
        let pageIndex = Number(params.pageIndex) || 1;
        let pageSize = Number(params.pageSize) || 30;
        let offsetCount = Number(params.offsetCount) || 0

        let pigeonList
        if (params.startTime) {
          // 请求某一时间之后的数据
          pigeonList = await this.PigeonModel.findAll({
            where: {
              startTime: {
                [this.Op.gt]: params.startTime
              },
              status: 1
            },
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize + offsetCount,
            attributes: { exclude: ['id', 'answer', 'qid'] },
            include: [
              {
                model: this.UserModel,
                // as: 'user2',
                attributes: {
                  exclude: ['id', 'password', 'token', 'settings']
                }
              },
              {
                model: this.AnswerModel,
                attributes: {
                  exclude: ['id']
                }
              }
            ]
          })
        } else {
          pigeonList = await this.PigeonModel.findAll({
            where: _searchCondition,
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize + offsetCount,
            attributes: {
              exclude: ['id', 'answer', 'qid']
            },
            include: [
              {
                model: this.UserModel,
                attributes: {
                  exclude: ['id', 'password', 'token', 'settings']
                }
              },
              {
                model: this.AnswerModel,
                attributes: {
                  exclude: ['id']
                }
              }
            ]
          });
        }
        pigeonList.forEach(item => {
          item.score = item.qy_answers.length
          let hasTheUser = item.qy_answers.some(itm => String(itm.uid) === String(params.phonenum))
          if (hasTheUser) {
            item.blurred = ''
            delete item.blurred
          } else {
            item.origin = ''
            delete item.origin
          }
          Object.assign(item, {
            caption: item.question
          })
          item.qy_answers.length = 0
          delete item.qy_answers
        })
        return this.json({
          status: 200, message: '查询成功', data: {
            list: pigeonList || [],
            count: (pigeonList || []).length,
            pageIndex: pageIndex,
            pageSize: pageSize
          }
        });
      }
    }
  }

  async decodeAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求姿势不正确', data: {} });
    }
    // if (!this.checkAuth()) {
    //   return this.json({ status: 1001, message: '请求不合法', data: {} })
    // }
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
        await this.AnswerModel.findOrCreate({
          where: {
            uid: params.phonenum,
            pid: params.uuid
          }
        })
        let decodedData = await this.PigeonModel.findOne({
          where: {
            uuid: params.uuid,
            answer: params.answer
          },
          attributes: { exclude: ['id', 'answer', 'qid'] }
        });
        if (decodedData) {
          if (decodedData.dataValues.hasOwnProperty('score')) {
            decodedData.dataValues.score += 1
          }
          return this.json({
            status: 200,
            message: '成功',
            data: decodedData
          })
        } else {
          return this.json({
            status: 1001,
            message: '解密失败',
            data: {}
          })
        }
      }
    }
  }
}

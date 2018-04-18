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
 * Created by liangshan on 2018/4/4.
 */
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken');
const AdmZip = require('adm-zip');
const secret = 'com.dei2';
const REDIS_KEYS = {
  TOTAL_VIEW: 'article_total_views_{{ARTICLE_ID}}',
  TODAY_VIEW: 'article_today_views_{{ARTICLE_ID}}',
  TODAY_VIEW_BAK: 'article_today_views_bak_{{ARTICLE_ID}}'
}

const getEndOfToday = function () {
  let d = new Date()
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d.getTime()
}

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    const that = this

    this.ArticleModel = this.models('Zpm/article');
    this.UserModel = this.models('Zpm/user');

    this.ArticleModel.belongsTo(this.UserModel, {
      // as: 'user',
      foreignKey: 'author',
      targetKey: 'phonenum'
    })

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');

    this.Op = this.Sequelize.Op
    // this.client.on('ready', function () {
    //   console.log('....222222..ready')
    //   that.client.psubscribe('__keyevent@0__:expired')
    // })

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

  indexAction () {
    return this.json({status: 200, message: '成功'})
  }

  async addArticleAction () {
    await this.ArticleModel.create({
      title: '郭树清领衔银保监会9人领导班子：7名副主席排序有讲究',
      author: '18000000000'
    });
    let count = await this.ArticleModel.count();
    return this.json({status: 200, message: count > 0 ? '添加成功' : '添加失败'});
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
      let loginUser = await this.UserModel.findOne({where: {username: args.username}});
      if (!loginUser) {
        loginUser = await this.UserModel.findOne({where: {phonenum: args.username}});
        if (!loginUser) {
          return false;
        } else {
        }
      } else {
      }
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

  async listAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({status: 401, message: '缺少参数', data: {needLogin: true}});
    }
    if (!this.checkLogin({username: params.phonenum, token: params.token})) {
      return this.json({status: 401, message: '登录状态失效，请重新登录', data: {needLogin: true}});
    } else {
      try {
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

        // 关联查询
        let articleList = await this.ArticleModel.findAll({
          where: _searchCondition,
          limit: pageSize,
          offset: (pageIndex - 1) * pageSize + offsetCount,
          attributes: {exclude: ['id', 'content']},
          include: [{
            model: this.UserModel,
            // as: 'user2',
            attributes: {
              exclude: ['id', 'password', 'token']
            }
          }],
          order: [
            ['updateTime', 'DESC']
          ]
        });
        if (articleList) {
          let _countAll = await this.ArticleModel.count({
            where: _searchCondition
          });
          return this.json({
            status: 200, message: '查询成功', data: {
              list: articleList || [],
              count: articleList.length,
              pageIndex: pageIndex,
              pageSize: pageSize,
              totalCounts: _countAll,
              total: Math.ceil((_countAll - offsetCount) / pageSize)
            }
          });
        } else {
          return this.json({
            status: 200, message: '查询成功', data: {
              list: [],
              count: 0,
              pageIndex: pageIndex,
              pageSize: pageSize
            }
          });
        }
      } catch (error) {
        return this.json({status: 403, message: error.message, data: {}});
      }
    }
  }

  /**
   * 查询文章列表，不需要登录状态
   * @returns {Promise.<*|{line, column}|number>}
   */
  async getAllAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    let _searchConditions = JSON.parse(JSON.stringify(params));
    if (_searchConditions.pageIndex) {
      delete _searchConditions.pageIndex
    }
    if (_searchConditions.pageSize) {
      delete _searchConditions.pageSize
    }
    if (_searchConditions.offsetCount) {
      delete _searchConditions.offsetCount
    }
    let pageIndex = Number(params.pageIndex) || 1;
    let pageSize = Number(params.pageSize) || 30;
    let offsetCount = Number(params.offsetCount) || 0;
    try {
      let articleList = await this.ArticleModel.findAll({
        where: _searchConditions,
        limit: pageSize,
        offset: (pageIndex - 1) * pageSize + offsetCount,
        attributes: {
          exclude: ['id']
        },
        include: [
          {
            model: this.UserModel,
            attributes: {
              exclude: ['id', 'password', 'token']
            }
          }
        ],
        order: [
          ['updateTime', 'DESC']
        ]
      });
      if (articleList) {
        let _countAll = await this.ArticleModel.count({
          where: _searchConditions
        });
        return this.json({
          status: 200, message: '查询成功', data: {
            list: articleList || [],
            count: articleList.length,
            pageIndex: pageIndex,
            pageSize: pageSize,
            totalCounts: _countAll,
            total: Math.ceil((_countAll - offsetCount) / pageSize)
          }
        });
      } else {
        return this.json({
          status: 200, message: '查询成功', data: {
            list: [],
            count: 0,
            pageIndex: pageIndex,
            pageSize: pageSize
          }
        });
      }
    } catch (error) {
      return this.json({status: 403, message: error.message, data: {}});
    }
  }

  async saveAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.uuid || params.uuid === '') {
      return this.json({status: 1001, message: '缺少文章id', data: {}});
    }
    // if ((!params.content || params.content === '') && (!params.contentUrl || params.contentUrl === '')) {
    //     return this.json({status: 1001, message: '文章内容不能为空', data: {uuid: params.uuid}});
    // }
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({status: 401, message: '缺少参数', data: {needLogin: true}});
    }
    if (!this.checkLogin({username: params.phonenum, token: params.token})) {
      return this.json({status: 401, message: '登录状态失效，请重新登录', data: {needLogin: true}});
    } else {
      let articleData = await this.ArticleModel.find({
        where: {
          uuid: {
            [this.Op.like]: params.uuid + '%'
          }
        },
        attributes: {exclude: ['id', 'content']}
      })
      if (!articleData) {
        return this.json({status: 1001, message: '文章不存在', data: {uuid: params.uuid}})
      } else {
        if (String(params.phonenum) !== String(articleData.author)) {
          return this.json({status: 1001, message: '无修改权限', data: {uuid: params.uuid}});
        }
      }
      try {
        let _searchCondition = JSON.parse(JSON.stringify(params));
        if (_searchCondition.token) {
          delete _searchCondition.token
        }
        if (_searchCondition.phonenum) {
          delete _searchCondition.phonenum
        }
        let _updateKey = {};
        if (params.title) {
          _updateKey.title = params.title
        }
        if (params.content) {
          _updateKey.content = params.content
        } else if (params.contentUrl) {
          _updateKey.contentUrl = params.contentUrl
        } else {
        }
        _updateKey.updateTime = (+new Date());
        let updateData = await this.ArticleModel.update(_updateKey, {
          where: {
            uuid: {
              [this.Op.like]: params.uuid + '%'
            }
          }
        });
        if (updateData[0] > 0) {
          return this.json({status: 200, message: '成功', data: {uuid: params.uuid}});
        } else {
          return this.json({status: 1001, message: '失败', data: {uuid: params.uuid}});
        }
      } catch (error) {
        return this.json({status: 403, message: error.message, data: {}});
      }
    }
  }

  async contentAction () {
    const that = this
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.uuid || params.uuid === '') {
      return this.json({status: 1001, message: '缺少文章id', data: {}});
    }

    let _totalViews = REDIS_KEYS.TOTAL_VIEW.replace('{{ARTICLE_ID}}', params.uuid)
    let _todayViews = REDIS_KEYS.TODAY_VIEW.replace('{{ARTICLE_ID}}', params.uuid)
    this.redis.incrby(_totalViews, 1)
    this.redis.incrby(_todayViews, 1)
    // this.redis.on("pmessage", (pattern, channel, eventKey) => {
    // });

    // this.redis.pexpireat(_todayViews, getEndOfToday() + 18 * 60 * 60 * 1000 + 2 * 60 * 1000)
    this.redis.pexpireat(_todayViews, getEndOfToday() + 24 * 60 * 60 * 1000)

    let articleDetail = await this.ArticleModel.find({
      where: {
        uuid: {
          [this.Op.like]: params.uuid + '%'
        }
      },
      include: [
        {
          model: this.UserModel,
          attributes: {
            exclude: ['id', 'password', 'token']
          }
        }
      ],
      attributes: {exclude: ['id']}
    });
    if (articleDetail) {
      let _totalViewsCount = await this.getAsync(_totalViews)
      let _todayViewsCount = await this.getAsync(_todayViews) || 0
      return this.json({status: 200, message: '成功', data: Object.assign({}, articleDetail.dataValues, {
        totalViews: _totalViewsCount,
        todayViews: _todayViewsCount
      })});
    } else {
      return this.json({status: 1001, message: '查找失败', data: {uuid: params.uuid}})
    }
  }

  async createAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({status: 401, message: '缺少参数', data: {needLogin: true}});
    }
    if (!this.checkLogin({username: params.phonenum, token: params.token})) {
      return this.json({status: 401, message: '登录状态失效，请重新登录', data: {needLogin: true}});
    } else {
      try {
        let _searchCondition = JSON.parse(JSON.stringify(params));
        if (_searchCondition.token) {
          delete _searchCondition.token
        }
        if (_searchCondition.phonenum) {
          delete _searchCondition.phonenum
        }
        let createdData = await this.ArticleModel.create({
          title: params.title,
          author: params.phonenum,
          postTime: +new Date(),
          updateTime: +new Date()
        });
        let userData = await this.UserModel.find({
          where: {
            phonenum: params.phonenum
          },
          attributes: {exclude: ['id', 'password']}
        })
        if (createdData) {
          let _createdData = JSON.parse(JSON.stringify(createdData))
          if (_createdData.hasOwnProperty('id')) {
            delete _createdData.id
          }
          _createdData['zpm_user'] = userData
          return this.json({status: 200, message: '成功', data: _createdData});
        } else {
          return this.json({status: 1001, message: '失败', data: {}})
        }
      } catch (error) {
        return this.json({status: 403, message: error.message, data: {}});
      }
    }
  }
}

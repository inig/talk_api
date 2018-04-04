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
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.ArticleModel = this.models('Zpm/article');
    this.UserModel = this.models('Zpm/user');

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');

    this.Op = this.Sequelize.Op
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
        } else {}
      } else {}
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
      return this.json({status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true }});
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
        let pageIndex = Number(params.pageIndex) || 1;
        let pageSize = Number(params.pageSize) || 30;

        let articleList = await this.ArticleModel.findAll({
          where: _searchCondition,
          limit: pageSize,
          offset: (pageIndex - 1) * pageSize,
          attributes: {exclude: ['id', 'content']},
          order: [
            ['postTime', 'DESC']
          ]
        });
        if (articleList) {
          let _countAll = await this.ArticleModel.count({
            where: _searchCondition
          });
          return this.json({status: 200, message: '查询成功', data: {
            list: articleList || [],
            count: articleList.length,
            pageIndex: pageIndex,
            pageSize: pageSize,
            totalCounts: _countAll,
            total: Math.ceil(_countAll / pageSize)
          }});
        } else {
          return this.json({status: 200, message: '查询成功', data: {
            list: [],
            count: 0,
            pageIndex: pageIndex,
            pageSize: pageSize
          }});
        }
      } catch (error) {
        return this.json({status: 403, message: error.message, data: {}});
      }
    }
  }

  async contentAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.uuid || params.uuid === '') {
      return this.json({status: 1001, message: '缺少文章id', data: {}});
    }
    let articleDetail = await this.ArticleModel.find({
      where: {
        uuid: params.uuid
      },
      attributes: {exclude: ['id']}
    });
    if (articleDetail) {
      return this.json({status: 200, message: '成功', data: articleDetail});
    } else {
      return this.json({status: 1001, message: '查找失败', data: { uuid: params.uuid }})
    }
  }
}

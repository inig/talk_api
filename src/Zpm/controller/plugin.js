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
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken');
const secret = 'com.dei2';
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.PluginModel = this.models('Zpm/plugin');
    this.UserModel = this.models('Zpm/user');

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');

    this.Op = this.Sequelize.Op
  }

  indexAction () {
      return this.json({status: 200, message: '成功'})
  }

  async addPluginAction () {
      await this.PluginModel.create({
          name: 'ZpmConsole',
          author: '18000000000'
      });
      await this.PluginModel.create({
          name: 'ZpmMovable',
          author: '18000000000'
      });
      await this.PluginModel.create({
          name: 'ZpmToast',
          author: '18000000000'
      });
      await this.PluginModel.create({
          name: 'ZpmMsgBox',
          author: '18000000001'
      });
      await this.PluginModel.create({
          name: 'ZpmTopBar',
          author: '18000000002'
      });
    let count = await this.PluginModel.count({where: {name: 'ZpmConsole'}});
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

    /***
     * 查找插件列表
     * phonenum，只能传手机号
     * token，用户缓存的登录凭证
     * search, 查找指定人（手机号）的所有插件，当设置search参数后，下面的type参数则会失效
     * type，查找指定类型的插件，可选：'self'、'other'、'all'。分别为自己的、非自己的、所有人的插件列表
     * @returns {Promise<*|{line, column}|number>}
     */
  async listAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
          return this.json({status: 401, message: '缺少参数', data: {}});
      }
      if (!this.checkLogin({username: params.phonenum, token: params.token})) {
          return this.json({status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true }});
      } else {
          let resultPlugins = [];
          if (!params.search || params.search === '') {
              let queryType = params.type || 'self';
              switch (queryType) {
                  case 'self':
                      // 查询自己的
                      resultPlugins = await this.PluginModel.findAll({
                          where: {
                              author: params.phonenum
                          }
                      });
                      break;
                  case 'other':
                      resultPlugins = await this.PluginModel.findAll({
                          where: {
                              author: {
                                  [this.Op.ne]: params.phonenum
                              }
                          }
                      });
                      // 查询非自己的
                      break;
                  case 'all':
                      // 查询所有人的
                      resultPlugins = await this.PluginModel.findAll()
                      break;
                  default:
                      break;
              }
          } else {
              // 查找指定人的
              resultPlugins = await this.PluginModel.findAll({
                  where: {
                      author: params.search
                  }
              })
          }
          return this.json({status: 200, message: '成功', data: resultPlugins});
      }
  }

  async contentAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      if (!params.plugin || params.plugin === '' || !params.filename || params.filename === '') {
          return this.json({status: 200, message: '成功', data: { content: '', plugin: params.plugin, filename: params.filename }});
      }
      let fileContent = await fs.readFileSync(`/srv/web_static/plugins/${params.plugin || ''}/${params.filename || ''}`, {encoding: 'utf-8'});
      let txt = fileContent || '';
      return this.json({status: 200, message: '成功', data: { content: txt, plugin: params.plugin, filename: params.filename }});
  }

  async uploadAction () {
    let params = this.get();
    try {
      let uploadedFile = await this.upload({
        accept: params.accept,
        size: Number(params.ms) * 1024,
        uploadDir: `/srv/web_static/plugins/${params.p}`,
        rename: params.rn || false,
        multiples: false
      });
      return this.json({status: 200, message: '成功', data: {
        path: `https://static.dei2.com/plugins/${params.p}/${uploadedFile.filename}`
      }});
    } catch (err) {
      return this.json({status: 1002, message: JSON.stringify(err) || '', data: {}});
    }

  }

}

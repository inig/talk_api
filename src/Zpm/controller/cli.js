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
const axios = require('axios')
const AdmZip = require('adm-zip');
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

    /***
     * 获取插件的根目录
     * @returns {*|{line, column}|number}
     */
  getPluginRootPathAction () {
      return this.json({status: 200, message: '成功', data: {path: 'https://static.dei2.com/plugins/'}});
  }

    /***
     * 检查插件状态，是否为"已通过"状态
     * @returns {Promise<*|{line, column}|number>}
     */
  async checkPluginsAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      if (!params.plugins || params.plugins.trim() === '') {
          return this.json({status: 200, message: '成功', data: {exclude: []}});
      }
      let plugins = params.plugins.split(';');
      try {
          let checkData = await this.PluginModel.findAll({
              where: {
                  name: {
                      [this.Op.in]: plugins
                  },
                  status: {
                      [this.Op.ne]: 3
                  }
              }
          });
          let outArr = [];
          if (checkData.length > 0) {
              for (let i = 0; i < checkData.length; i++) {
                  outArr.push(checkData[i].name)
              }
          }
          return this.json({status: 200, message: '成功', data: {exclude: outArr}});
      } catch (err) {
          return this.json({status: 1001, message: '失败', data: {exclude: plugins}});
      }
  }

    /***
     * 查询用户列表，默认查询权限为"开发者"的用户
     * @returns {Promise<*|{line, column}|number>}
     */
  async listUsersAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      let _searchConditions = {};
      // 默认查找开发者
      let role = params.role || 3;
      if (String(role) !== '-1') {
          _searchConditions.role = role;
      }
      let status = params.status || 1;
      if (String(status) !== '-1') {
          _searchConditions.status = status;
      }
      try {
          let usersData = await this.UserModel.findAll({
              where: _searchConditions,
              attributes: {
                  exclude: ['id', 'password', 'token']
              }
          });
          let outUsers = [];
          if (usersData.length > 0) {
              for (let i = 0; i < usersData.length; i++) {
                  outUsers.push(usersData[i].username)
              }
          }
          return this.json({status: 200, message: '成功', data: {users: outUsers}});
      } catch (err) {
          return this.json({status: 1001, message: '失败', data: {users: []}});
      }
  }

    /***
     * 通过用户名查找手机号
     * @param args
     * @returns {Promise<Array>}
     */
  async getPhonenumByUsername (args) {
      if (!args.username || args.username.trim() === '') {
          return [];
      }
      let usernames = args.username.split(';');
      try {
          let usersData = await this.UserModel.findAll({
              where: {
                  username: {
                      [this.Op.in]: usernames
                  }
              },
              attributes: {
                  exclude: ['id', 'password', 'token']
              }
          });
          let outPhonenum = [];
          if (usersData.length > 0) {
              for (let i = 0; i < usernames.length; i++) {
                  for (let j = 0; j < usersData.length; j++) {
                      if (usersData[j].username === usernames[i]) {
                          outPhonenum.push(usersData[j].phonenum);
                          j = usersData.len;
                      }
                  }
                  if (outPhonenum.length < i + 1) {
                      outPhonenum.push('');
                  }
              }
          } else {
              for (let i = 0; i < usernames.length; i++) {
                  outPhonenum.push('');
              }
          }
          return outPhonenum;
      } catch (err) {
          return [];
      }
  }

    /***
     * 获取用户名下可用的插件
     * @returns {Promise<*|{line, column}|number>}
     */
  async getPluginsByUserAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      if (!params.username || params.username.trim() === '') {
          return this.json({status: 200, message: '成功', data: {plugins: []}});
      }
      let queryPhonenums = await this.getPhonenumByUsername({
          username: params.username
      });
      let _searchConditions = {
        author: {
          [this.Op.in]: queryPhonenums
        }
      };
      let status = params.status || 3;
      if (String(status) !== '-1') {
          _searchConditions.status = status;
      }
      try {
          let pluginsData = await this.PluginModel.findAll({
              where: _searchConditions
          });
          let outPlugins = [];
          if (pluginsData.length > 0) {
              for (let i = 0; i < pluginsData.length; i++) {
                  outPlugins.push(pluginsData[i].name);
              }
          }
          return this.json({status: 200, message: '成功', data: {plugins: outPlugins}});
      } catch (err) {
          return this.json({status: 1001, message: '失败', data: {plugins: []}});
      }
  }

  async getAllUsers () {
      try {
          let usersData = await this.UserModel.findAll({
              attributes: {
                  exclude: ['id', 'password', 'token']
              }
          });
          return usersData;
      } catch (err) {
          return [];
      }
  }

  findUserByPhonenum (args) {
      let user = {};
      let i = 0;
      for (i; i < args.users.length; i++) {
          if (args.users[i].phonenum === args.phonenum) {
              user = args.users[i];
              i = args.users.length;
          }
      }
      return user;
  }
  findPhonenumByUser (args) {
      let phonenums = [];
      if (!args.usernames || args.usernames.trim() === '') {
          return phonenums;
      }
      let usernames = args.usernames.split(';');
      let i = 0;
      for (i; i < usernames.length; i++) {
          for (let j = 0; j < args.users.length; j++) {
              if (args.users[j].username === usernames[i]) {
                  phonenums.push(args.users[j].phonenum);
                  j = args.users.length;
              }
          }
          if (phonenums.length < i + 1) {
              phonenums.push('');
          }
      }
      return phonenums;
  }

    /***
     * 根据插件审核状态，查询插件列表
     * 默认审核状态 "已通过"
     * @returns {Promise<void>}
     */
  async listPluginsAction () {
      if (!this.isPost()) {
          return this.json({status: 405, message: '请求方法不正确', data: {}});
      }
      let params = await this.post();
      // 根据插件审核状态，查询插件列表
      let status = params.status ? Number(params.status) : 3;
      let _searchConditions = {};
      if (status !== -1) {
          _searchConditions.status = status;
      }
      let allUsers = await this.getAllUsers();
      if (params.username && params.username.trim() !== '') {
          let _searchPhonenum = this.findPhonenumByUser({
              usernames: params.username,
              users: allUsers
          });
          _searchConditions.author = {
              [this.Op.in]: _searchPhonenum
          };
      }
      try {
          let pluginsData = await this.PluginModel.findAll({
              where: _searchConditions,
              attributes: {
                  exclude: ['id']
              }
          });
          if (pluginsData.length > 0) {
              for (let i = 0; i < pluginsData.length; i++) {
                  pluginsData[i].author = this.findUserByPhonenum({
                      users: allUsers,
                      phonenum: pluginsData[i].author
                  });
              }
          }
          return this.json({status: 200, message: '成功', data: {plugins: pluginsData}});
      } catch (err) {
          return this.json({status: 1001, message: '失败', data: {plugins: []}});
      }
  }

  async ajaxAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    let _url = ''
    let _method = 'POST'
    if (params.url) {
      _url = params.url
      delete params.url
    }
    if (params.method) {
      _method = params.method
      delete params.method
    }
    return axios({
      url: _url,
      method: _method,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(params)
    }).then(res => {
      return this.json({status: 200, message: '成功', data: res.data})
    }).catch(err => {
      return this.json({status: 401, message: err.message, data: {}})
    })
  }
}

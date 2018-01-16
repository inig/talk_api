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
      let _pluginPath = `/srv/web_static/plugins/${params.plugin || ''}`;
      if (!fs.existsSync(_pluginPath)) {
        // 文件目录不存在
        return this.json({status: 1002, message: '插件目录不存在', data: { plugin: params.plugin, filename: params.filename }});
      } else {
        let _pluginFile = _pluginPath + '/' + params.filename;
        if (!fs.existsSync(_pluginFile)) {
          // 文件不存在
          return this.json({status: 1002, message: '文件不存在', data: { content: '', plugin: params.plugin, filename: params.filename }});
        } else {
          // 文件存在
          let _fileStat = fs.statSync(_pluginFile);
          if (_fileStat.isFile()) {
            // 是文件
            let fileContent = await fs.readFileSync(`/srv/web_static/plugins/${params.plugin || ''}/${params.filename}`, {encoding: 'utf-8'});
            let txt = fileContent || '';
            return this.json({status: 200, message: '成功', data: { content: txt, plugin: params.plugin, filename: params.filename }});
          } else {
            // 不是文件
            return this.json({status: 1002, message: '不能识别的文件类型', data: { content: '', plugin: params.plugin, filename: params.filename }});
          }
        }
      }
  }

  /**
   * 上传插件的单个文件
   * @returns {Promise.<*>}
   */
  async uploadAction () {
    let params = this.get();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({status: 401, message: '保存失败', data: { needLogin: true }});
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      if (!_isLegalLogin) {
        return this.json({status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true }});
      } else {
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
  }

  /**
   * 更新插件的单个文件
   * @returns {Promise.<*>}
   */
  async updateAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({status: 401, message: '保存失败', data: { needLogin: true }});
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      if (!_isLegalLogin) {
        return this.json({status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true }});
      }
    }
    if (!params.plugin || params.plugin === '' || !params.filename || params.filename === '') {
      return this.json({status: 1001, message: '保存失败，缺少参数', data: {}});
    }
    let _fileContent = params.content;
    let _pluginPath = `/srv/web_static/plugins/${params.plugin}`;
    let _pluginFilePath = `${_pluginPath}/${params.filename}`;
    if (!fs.existsSync(_pluginPath)) {
      fs.mkdirSync(_pluginPath);
    }
    fs.writeFileSync(_pluginFilePath, _fileContent);
    return this.json({status: 200, message: '保存成功', data: { plugin: params.plugin, filename: params.filename }});
  }

  rmDir (path) {
    let files = [];
    if(fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        let curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
          deleteall(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  async uploadPluginAction () {
    let params = this.get();
    if (!params.token || params.token === '' || !params.phonenum || String(params.phonenum) === '') {
      return this.json({status: 401, message: '保存失败', data: { needLogin: true }});
    } else {
      let _isLegalLogin = this.checkLogin({
        username: params.phonenum,
        token: params.token
      });
      if (!_isLegalLogin) {
        return this.json({status: 401, message: '登录状态失效,请重新登录', data: { needLogin: true }});
      } else {
        let pluginRootPath = '/srv/web_static/plugins';
        try {
          let uploadedFile = await this.upload({
            accept: params.accept,
            size: Number(params.ms) * 1024,
            uploadDir: pluginRootPath,
            rename: params.rn || false,
            multiples: false
          });
          let _uploadFileName = uploadedFile.filename.replace(/\.[a-z0-9]+$/i, '');
          if (fs.existsSync(`${pluginRootPath}/${_uploadFileName}`)) {
            this.rmDir(`${pluginRootPath}/${_uploadFileName}`);
          }
          let zip = new AdmZip(`${pluginRootPath}/${uploadedFile.filename}`);
          zip.extractAllTo(pluginRootPath, true);
          let pluginCount = await this.PluginModel.count({
            where: {
              name: _uploadFileName
            }
          });
          if (pluginCount < 1) {
            // 不存在
            try {
              await this.PluginModel.create({
                name: _uploadFileName,
                author: params.phonenum
              });
              return this.json({status: 200, message: '添加成功', data: {
                plugin: _uploadFileName
              }});
            } catch (err) {
              return this.json({status: 1002, message: '添加失败', data: {
                plugin: _uploadFileName
              }});
            }
          } else {
            return this.json({status: 200, message: '添加成功', data: {
              plugin: _uploadFileName
            }});
          }
        } catch (err) {
          return this.json({status: 1002, message: JSON.stringify(err) || '', data: {}});
        }
      }
    }
  }

    /**
     * 获取插件列表, 用于root、admin插件管理
     * @returns {Promise<*|{line, column}|number>}
     */
    async listAllAction () {
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
                let currentUser = await this.UserModel.findOne({
                    where: {phonenum: params.phonenum},
                    attributes: {exclude: ['id', 'password']}
                });
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

                if (currentUser && (Number(currentUser.role) === 1 || Number(currentUser.role) === 2)) {
                    // 超级管理员或管理员
                    let pageIndex = Number(params.pageIndex) || 1;
                    let pageSize = Number(params.pageSize) || 30;

                    if (_searchCondition.author) {
                        _searchCondition.author = {
                            [this.Op.regexp]: `${_searchCondition.author}`
                        }
                    }
                    if (_searchCondition.name) {
                        _searchCondition.name = {
                            [this.Op.regexp]: `${_searchCondition.name}`
                        }
                    }
                    let pluginList = await this.PluginModel.findAll({
                        where: _searchCondition,
                        limit: pageSize,
                        offset: (pageIndex - 1) * pageSize,
                        attributes: {exclude: ['id']},
                        order: [
                            ['updatedAt', 'DESC']
                        ]
                    });
                    if (pluginList) {
                        if (_searchCondition.pageIndex) {
                            delete _searchCondition.pageIndex
                        }
                        if (_searchCondition.pageSize) {
                            delete _searchCondition.pageSize
                        }
                        let _countAll = await this.PluginModel.count({
                            where: _searchCondition
                        });
                        return this.json({status: 200, message: '查询成功', data: {
                                list: pluginList || [],
                                count: pluginList.length,
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
                } else {
                    return this.json({status: 403, message: '查询失败', data: {}});
                }
            } catch (err) {
                return this.json({status: 403, message: err, data: {}});
            }
        }
    }

    /**
     * 审核插件
     * @returns {Promise<*|{line, column}|number>}
     */
    async updatePluginSettingsAction () {
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
                let currentUser = await this.UserModel.findOne({
                    where: {phonenum: params.phonenum},
                    attributes: {exclude: ['id', 'password']}
                });
                if (currentUser && (Number(currentUser.role) === 1 || Number(currentUser.role) === 2)) {
                    // 超级管理员或管理员
                    let updateCondition = {};
                    if (params.status) {
                        updateCondition.status = Number(params.status)
                    }
                    updateCondition.remarks = params.remarks
                    let updatePlugin = await this.PluginModel.update(updateCondition, {
                        where: {
                            name: params.name
                        }
                    });
                    if (updatePlugin) {
                        return this.json({status: 200, message: '修改成功', data: { name: params.name }});
                    } else {
                        return this.json({status: 1001, message: '修改失败', data: {}});
                    }
                } else {
                    return this.json({status: 403, message: '权限不够', data: {}});
                }
            } catch (err) {
                return this.json({status: 403, message: '权限不够', data: {}});
            }
        }
    }

    /**
     * 删除插件
     * @returns {Promise<*|{line, column}|number>}
     */
    async deletePluginAction () {
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
                let currentUser = await this.UserModel.findOne({
                    where: {phonenum: params.phonenum},
                    attributes: {exclude: ['id', 'password']}
                });
                if (currentUser && (Number(currentUser.role) === 1 || Number(currentUser.role) === 2)) {
                    // 超级管理员或管理员
                    let deleteUser = await this.PluginModel.destroy({
                        where: {
                            name: params.name
                        }
                    });
                    if (deleteUser) {
                        return this.json({status: 200, message: '删除成功', data: { name: params.name }});
                    } else {
                        return this.json({status: 1001, message: '删除失败', data: {}});
                    }
                } else {
                    return this.json({status: 403, message: '权限不够', data: {}});
                }
            } catch (err) {
                return this.json({status: 403, message: '权限不够', data: {}});
            }
        }
    }
}

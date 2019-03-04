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
const formidable = require('formidable');
const multiparty = require('multiparty');
const bodyParser = require('body-parser')
const qs = require('querystring')
const secret = 'com.dei2';

const pluginRootPath = '/mnt/srv/web_static/plugins_zips';
const pluginFileRootPath = '/mnt/srv/web_static/plugins';
// const pluginRootPath = '/Keith/workspace/workspace_zpm_cli/plugins_zips';
// const pluginFileRootPath = '/Keith/workspace/workspace_zpm_cli/plugins';
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.ComponentModel = this.models('Zpm/component');
    this.UserModel = this.models('Zpm/user');

    this.ComponentModel.belongsTo(this.UserModel, {
      foreignKey: 'author',
      targetKey: 'phonenum'
    })

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');

    this.Op = this.Sequelize.Op
  }

  indexAction () {
    return this.json({ status: 200, message: '成功' })
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

  _upload (file, opts) {
    return new Promise((resolve, reject) => {
      let errorPath = '';
      let fileName = '';
      let filePath = '';
      let suffix = file.name.split('.').pop();
      fileName = file.name;
      filePath = file.path;
      if (opts.accept.split(';').indexOf(suffix) < 0) {
        // 文件格式不正确
        errorPath = file.path;
        reject(`文件格式不正确，只支持${opts.accept.split(';')}格式的文件`);
      } else if (Number(opts.size) < Number(file.size)) {
        errorPath = file.path;
        reject(`文件太大，请不要上传超过${opts.size / 1024 / 1024}M的文件`);
      }
      if (errorPath !== '') {
        let _stat = fs.statSync(errorPath);
        if (_stat.isDirectory()) {
          // 删除目录
          fs.rmdir(errorPath, function () { });
        } else if (_stat.isFile()) {
          // 删除文件
          fs.unlink(errorPath, function () { });
        }
      } else {
        if (!opts.rename) {
          let newPath = `${opts.uploadDir.replace(/\/*$/, '')}/${fileName}`;
          if (fs.existsSync(newPath)) {
            let _stat2 = fs.statSync(newPath);
            if (_stat2.isDirectory()) {
              // 删除目录
              fs.rmdirSync(newPath);
            } else if (_stat2.isFile()) {
              // 删除文件
              fs.unlinkSync(newPath);
            }
          }
          fs.renameSync(filePath, newPath);
        }
        resolve({ filename: opts.rename ? filePath.split('/').pop() : fileName });
      }
    })
  };

  /**
   * 新增组件
   * 上传整个组件zip包
   */
  async addAction () {
    let form = await this.form();
    let params = form.fields;
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

        if (!fs.existsSync(pluginRootPath)) {
          fs.mkdirSync(pluginRootPath);
        }
        if (!fs.existsSync(pluginFileRootPath)) {
          fs.mkdirSync(pluginFileRootPath);
        }
        try {
          let uploadedFile = await this._upload(form.file.file, {
            accept: params.accept,
            size: Number(params.ms) * 1024,
            uploadDir: pluginRootPath,
            rename: params.rn || false,
            multiples: false
          }).catch(err => {
            return this.json({ status: 1001, message: err.message || '失败' })
          })
          let _uploadFileName = uploadedFile.filename.replace(/\.[a-z0-9]+$/i, '');
          if (fs.existsSync(`${pluginFileRootPath}/${_uploadFileName}`)) {
            this.rmdirSync(`${pluginFileRootPath}/${_uploadFileName}`);
          }
          let zip = new AdmZip(`${pluginRootPath}/${uploadedFile.filename}`);
          zip.extractAllTo(pluginFileRootPath, true);
          // fs.renameSync(filePath, newPath);
          let pluginCount = await this.ComponentModel.count({
            where: {
              name: _uploadFileName
            }
          });
          if (pluginCount < 1) {
            // 不存在
            try {
              let createdData = await this.ComponentModel.create({
                name: _uploadFileName,
                author: params.phonenum,
                desc: decodeURIComponent(params.desc),
                category: decodeURIComponent(params.category),
                cid: params.cid
              }).catch(err => {
                return this.json({ status: 1001, message: err.message || '创建失败' })
              });
              let p = await this.ComponentModel.findOne({
                where: { id: createdData.id },
                include: [
                  {
                    model: this.UserModel,
                    attributes: {
                      exclude: ['id', 'password', 'token']
                    }
                  }
                ],
                attributes: { exclude: ['id'] }
              })
              return this.json({
                status: 200, message: '添加成功', data: p
              });
            } catch (err) {
              return this.json({
                status: 1002, message: '添加失败', data: {
                  name: _uploadFileName
                }
              });
            }
          } else {
            return this.json({
              status: 201, message: '重复添加', data: {
                name: _uploadFileName
              }
            });
          }
        } catch (err) {
          return this.json({ status: 1002, message: err.message || '', data: {} });
        }
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
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({ status: 401, message: '缺少参数', data: {} });
    }
    if (!this.checkLogin({ username: params.phonenum, token: params.token })) {
      return this.json({ status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true } });
    } else {
      let resultPlugins = [];
      if (!params.search || params.search === '') {
        let queryType = params.type || 'all';
        switch (queryType) {
          case 'self':
            // 查询自己的
            resultPlugins = await this.ComponentModel.findAll({
              where: {
                author: params.phonenum
              },
              include: [
                {
                  model: this.UserModel,
                  attributes: {
                    exclude: ['id', 'password', 'token']
                  }
                }
              ],
              attributes: { exclude: ['id'] }
            });
            break;
          case 'other':
            resultPlugins = await this.ComponentModel.findAll({
              where: {
                author: {
                  [this.Op.ne]: params.phonenum
                },
                include: [
                  {
                    model: this.UserModel,
                    attributes: {
                      exclude: ['id', 'password', 'token']
                    }
                  }
                ],
                attributes: { exclude: ['id'] }
              }
            });
            // 查询非自己的
            break;
          case 'all':
            // 查询所有人的
            resultPlugins = await this.ComponentModel.findAll({
              include: [
                {
                  model: this.UserModel,
                  attributes: {
                    exclude: ['id', 'password', 'token']
                  }
                }
              ],
              attributes: { exclude: ['id'] }
            })
            break;
          default:
            break;
        }
      } else {
        // 查找指定人的
        resultPlugins = await this.ComponentModel.findAll({
          where: {
            author: params.search
          },
          include: [
            {
              model: this.UserModel,
              attributes: {
                exclude: ['id', 'password', 'token']
              }
            }
          ],
          attributes: { exclude: ['id'] }
        })
      }
      return this.json({ status: 200, message: '成功', data: resultPlugins });
    }
  }

  _walk (dir) {
    let outTree = []
    if (fs.existsSync(dir)) {
      let filenames = fs.readdirSync(dir)
      let temp
      filenames.forEach(fname => {
        let _path = path.join(dir, fname)
        let _stat = fs.statSync(_path)
        temp = {
          name: fname
        }
        if (_stat.isDirectory()) {
          temp.type = 'directory'
          let _tree = this._walk(_path)
          temp.children = _tree
        } else {
          temp.type = 'file'
        }
        outTree.push(temp)
      })
    }
    return outTree
  }

  /**
   * 遍历目录结构
   */
  async lsAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
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
        let componentData = await this.ComponentModel.find({
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
          attributes: { exclude: ['id'] }
        })
        let pluginDir = `${pluginFileRootPath}/${componentData.name}`
        if (!fs.existsSync(pluginDir)) {
          return this.json({ status: 1001, message: '组件目录不存在' })
        }
        let fileTree = this._walk(pluginDir)
        return this.json({
          status: 200, message: '成功', data: {
            author: componentData.zpm_user,
            files: {
              name: componentData.name,
              type: 'directory',
              children: fileTree
            }
          }
        })
      }
    }
  }

  /**
   * 读取文件内容
   */
  async contentAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (!params.path || params.path === '') {
      return this.json({ status: 200, message: '成功', data: { content: '', content: '', filename: params.path } });
    }
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
        let _pluginPath = `${pluginFileRootPath}/${params.path}`;
        if (!fs.existsSync(_pluginPath)) {
          // 文件目录不存在
          return this.json({ status: 1002, message: '组件目录不存在', data: { content: '', filename: params.path } });
        } else {
          // 文件存在
          let _fileStat = fs.statSync(_pluginPath);
          if (_fileStat.isFile()) {
            // 是文件
            let fileContent = await fs.readFileSync(`${pluginFileRootPath}/${params.path}`, { encoding: 'utf-8' });
            let txt = fileContent || '';
            let componentData = await this.ComponentModel.find({
              where: {
                uuid: {
                  [this.Op.like]: params.uuid + '%'
                }
              },
              attributes: { exclude: ['id'] }
            })
            if (componentData.uuid) {
              return this.json({ status: 200, message: '成功', data: { content: txt, filename: params.path, componentInfo: componentData } });
            } else {
              return this.json({ status: 200, message: '成功', data: { content: txt, filename: params.path, componentInfo: {} } });
            }
          } else {
            // 不是文件
            return this.json({ status: 1002, message: '不能识别的文件类型', data: { content: '', filename: params.path } });
          }
        }
      }
    }
  }

  /**
   * 更新组件的某个文件的内容
   * @returns {Promise.<*>}
   */
  async updateAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
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
      }
    }
    if (!params.path || params.path === '') {
      return this.json({ status: 1001, message: '文件不存在', data: {} });
    }
    let componentData = await this.ComponentModel.find({
      where: {
        uuid: {
          [this.Op.like]: params.uuid + '%'
        }
      },
      attributes: { exclude: ['id'] }
    })
    if (params.phonenum !== componentData.author) {
      return this.json({ status: 402, message: '无修改权限' })
    }
    let _fileContent = params.content;
    let _pluginFilePath = `${pluginFileRootPath}/${params.path}`;
    if (!fs.existsSync(_pluginFilePath)) {
      fs.mkdirSync(_pluginFilePath);
    }
    fs.writeFileSync(_pluginFilePath, _fileContent);
    return this.json({ status: 200, message: '保存成功', data: { filename: params.path } });
  }

  rmDir (path) {
    let files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function (file, index) {
        let curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) { // recurse
          this.rmDir(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  rmdirSync () {
    function iterator (url, dirs) {
      let stat = fs.statSync(url);
      if (stat.isDirectory()) {
        dirs.unshift(url);//收集目录
        inner(url, dirs);
      } else if (stat.isFile()) {
        fs.unlinkSync(url);//直接删除文件
      }
    }
    function inner (path, dirs) {
      let arr = fs.readdirSync(path);
      for (let i = 0, el; el = arr[i++];) {
        iterator(path + "/" + el, dirs);
      }
    }
    return function (dir, cb) {
      cb = cb || function () { };
      let dirs = [];

      try {
        iterator(dir, dirs);
        for (let i = 0, el; el = dirs[i++];) {
          fs.rmdirSync(el);//一次性删除所有收集到的目录
        }
        cb()
      } catch (e) {//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
        e.code === "ENOENT" ? cb() : cb(e);
      }
    }
  };

  /**
   * 审核插件
   * @returns {Promise<*|{line, column}|number>}
   */
  async updatePluginSettingsAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({ status: 401, message: '缺少参数', data: { needLogin: true } });
    }
    if (!this.checkLogin({ username: params.phonenum, token: params.token })) {
      return this.json({ status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true } });
    } else {
      try {
        let currentUser = await this.UserModel.findOne({
          where: { phonenum: params.phonenum },
          attributes: { exclude: ['id', 'password'] }
        });
        if (currentUser && (Number(currentUser.role) === 1 || Number(currentUser.role) === 2)) {
          // 超级管理员或管理员
          let updateCondition = {};
          if (params.status) {
            updateCondition.status = Number(params.status)
          }
          updateCondition.remarks = params.remarks
          let updatePlugin = await this.ComponentModel.update(updateCondition, {
            where: {
              name: params.name
            }
          });
          if (updatePlugin) {
            return this.json({ status: 200, message: '修改成功', data: { name: params.name } });
          } else {
            return this.json({ status: 1001, message: '修改失败', data: {} });
          }
        } else {
          return this.json({ status: 403, message: '权限不够', data: {} });
        }
      } catch (err) {
        return this.json({ status: 403, message: '权限不够', data: {} });
      }
    }
  }

  /**
   * 删除插件
   * @returns {Promise<*|{line, column}|number>}
   */
  async deletePluginAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({ status: 401, message: '缺少参数', data: { needLogin: true } });
    }
    if (!this.checkLogin({ username: params.phonenum, token: params.token })) {
      return this.json({ status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true } });
    } else {
      try {
        let currentUser = await this.UserModel.findOne({
          where: { phonenum: params.phonenum },
          attributes: { exclude: ['id', 'password'] }
        });
        if (currentUser && (Number(currentUser.role) === 1 || Number(currentUser.role) === 2)) {
          // 超级管理员或管理员
          let deleteUser = await this.ComponentModel.destroy({
            where: {
              uuid: {
                [this.Op.like]: params.uuid + '%'
              }
            }
          });
          if (deleteUser) {
            return this.json({ status: 200, message: '删除成功', data: { name: params.name } });
          } else {
            return this.json({ status: 1001, message: '删除失败', data: {} });
          }
        } else {
          return this.json({ status: 403, message: '权限不够', data: {} });
        }
      } catch (err) {
        return this.json({ status: 403, message: '权限不够', data: {} });
      }
    }
  }

  /**
     * 获取插件列表, 用于root、admin插件管理
     * @returns {Promise<*|{line, column}|number>}
     */
  async listAllAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({ status: 401, message: '缺少参数', data: { needLogin: true } });
    }
    if (!this.checkLogin({ username: params.phonenum, token: params.token })) {
      return this.json({ status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true } });
    } else {
      try {
        let currentUser = await this.UserModel.findOne({
          where: { phonenum: params.phonenum },
          attributes: { exclude: ['id', 'password'] }
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
          let pluginList = await this.ComponentModel.findAll({
            where: _searchCondition,
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize,
            include: [
              {
                model: this.UserModel,
                attributes: {
                  exclude: ['id', 'password', 'token']
                }
              }
            ],
            attributes: { exclude: ['id'] },
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
            let _countAll = await this.ComponentModel.count({
              where: _searchCondition
            });
            return this.json({
              status: 200, message: '查询成功', data: {
                list: pluginList || [],
                count: pluginList.length,
                pageIndex: pageIndex,
                pageSize: pageSize,
                totalCounts: _countAll,
                total: Math.ceil(_countAll / pageSize)
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
        } else {
          return this.json({ status: 403, message: '查询失败', data: {} });
        }
      } catch (err) {
        return this.json({ status: 403, message: err, data: {} });
      }
    }
  }
}

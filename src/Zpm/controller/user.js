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
const jwt = require('jsonwebtoken');
const secret = 'com.dei2';
const tokenExpiresIn = '7d';
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.UserModel = this.models('Zpm/user');
    this.RoleModel = this.models('Zpm/role');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  indexAction () {
    return this.UserModel.findOne({where: {'username': 'ls'}}).then((user) => {
      return this.json({status: 200, message: '成功2', data: user})
    })
  }

  async addUserAction () {
      await this.UserModel.create({
          username: 'root',
          password: '123123',
          phonenum: '13888888888',
          nickname: '王二狗',
          gender: 1,
          role: 1
      });
      await this.UserModel.create({
          username: 'admin',
          password: '123123',
          phonenum: '13899999999',
          nickname: '王大锤',
          gender: 1,
          role: 2
      });
    await this.UserModel.create({
      username: 'ls',
      password: '123123',
      phonenum: '18000000000',
      nickname: 'ls',
      gender: 1,
      role: 3
    });
      await this.UserModel.create({
          username: 'wq',
          password: '123123',
          phonenum: '18000000001',
          nickname: 'wq',
          gender: 1,
          role: 3
      });
      await this.UserModel.create({
          username: 'wjx',
          password: '123123',
          phonenum: '18000000002',
          nickname: 'wjx',
          gender: 2,
          role: 3
      });
      await this.UserModel.create({
          username: 'user',
          password: '123123',
          phonenum: '13877777777',
          nickname: '张三',
          gender: 1,
          role: 4
      })
    let count = await this.UserModel.count({where: {username: 'wq'}});
    return this.json({status: 200, message: count > 0 ? '添加成功' : '添加失败'});
  }

  async addRoleAction () {
      await this.RoleModel.create({
          name: 'superadmin',
          desc: '超级管理员'
      });
      await this.RoleModel.create({
          name: 'admin',
          desc: '管理员'
      });
      await this.RoleModel.create({
          name: 'developer',
          desc: '开发者'
      });
      await this.RoleModel.create({
          name: 'user',
          desc: '普通用户'
      });
      let count = await this.RoleModel.count();
      return this.json({status: 200, message: count > 0 ? `共添加了${count}个会员等级` : '添加失败'});
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

  async loginAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (params.username === '') {
      return this.json({status: 401, message: '用户名不能为空', data: {}});
    }
    if (params.password === '') {
      return this.json({status: 401, message: '密码不能为空', data: {}});
    }
    let loginWith = '';
    let loginUser = await this.UserModel.findOne({
        where: {username: params.username, password: params.password},
        attributes: {exclude: ['id', 'password']}
    });
    if (!loginUser) {
      loginUser = await this.UserModel.findOne({
          where: {phonenum: params.username, password: params.password},
          attributes: {exclude: ['id', 'password']}
      });
      if (!loginUser) {
        return this.json({status: 401, message: '账号或密码不正确', data: {}});
      } else {
        // 登录成功
        loginWith = 'phonenum';
      }
    } else {
      // 登录成功
      loginWith = 'username';
    }
    let loginToken = jwt.sign({
      data: {
        username: params.username
      }
    }, secret, { expiresIn: tokenExpiresIn });
    let searchCondition = {};
    searchCondition[loginWith] = params.username;
    searchCondition['password'] = params.password;
    let updateLoginStatus = await this.UserModel.update({
        token: loginToken,
        lastLoginTime: (+new Date())
    }, {
      where: searchCondition
    });
    if (updateLoginStatus[0] > 0) {
      // 更新用户登录token成功
      loginUser.dataValues.token = loginToken;
    }
    return this.json({status: 200, message: '登录成功', data: loginUser.dataValues || {}})
  }

  async registerAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();

    if (params.phonenum === '') {
      return this.json({status: 401, message: '手机号不能为空', data: {}});
    } else {
      if (!params.phonenum.match(/^1[345789]\d{9}$/)) {
        return this.json({status: 401, message: '手机号格式不正确', data: {}});
      }
    }
    if (params.password === '') {
      return this.json({status: 401, message: '密码不能为空', data: {}});
    }
    let loginWith = '';
    let loginUserCount = await this.UserModel.count({
        where: {phonenum: params.phonenum},
        attributes: {exclude: ['id', 'password']}
    });
    if (loginUserCount < 1) {
      // 注册新用户
      await this.UserModel.create({
        username: params.phonenum,
        password: params.password,
        phonenum: params.phonenum,
        nickname: '',
        gender: 1,
        plugins: ''
      });
      let count = await this.UserModel.count({where: {phonenum: params.phonenum}});
      return this.json({status: 200, message: count > 0 ? '注册成功' : '注册失败', data: {}});
    } else {
      // 用户名已存在
      return this.json({status: 401, message: '手机号已存在', data: {}});
    }
  }

  async getUserInfoAction () {
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
      let userInfo = await this.UserModel.findOne({
        where: {phonenum: params.phonenum},
        attributes: {exclude: ['id', 'password']}
      });
      if (userInfo) {
        return this.json({status: 200, message: '获取个人信息成功', data: userInfo || {}});
      } else {
        return this.json({status: 401, message: '获取个人信息失败', data: {}});
      }
    }
  }

  async updateUserInfoAction () {
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
      let searchCondition = {};
      searchCondition['phonenum'] = params.phonenum;
  
      let updateUserInfoStatus = await this.UserModel.update({
        username: params.username,
        nickname: params.nickname,
        email: params.email,
        gender: params.gender,
        birthday: params.birthday,
        website: params.website
      }, {
        where: searchCondition
      });
      
      if (updateUserInfoStatus[0] > 0) {
        let userInfo = await this.UserModel.findOne({
          where: {phonenum: params.phonenum},
          attributes: {exclude: ['id', 'password']}
        });
        if (userInfo) {
          return this.json({status: 200, message: '更新成功', data: userInfo || {}});
        } else {
          return this.json({status: 401, message: '获取更新信息失败', data: {}});
        }
      } else {
        return this.json({status: 401, message: '更新失败', data: {}});
      }
    }
  }

  async modifyPasswordAction () {
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

      if (!/\S{6,}/.test(params.newPass)) {
        return this.json({status: 401, message: '密码格式不正确', data: {}});
      }
      if (params.newPass !== params.rePass) {
        return this.json({status: 401, message: '两次密码不一致', data: {}});
      }

      let searchCondition = {};
      searchCondition['phonenum'] = params.phonenum;
  
      let ModifyStatus = await this.UserModel.update({
        password: params.newPass,
      }, {
        where: searchCondition
      });
      
      if (ModifyStatus[0] > 0) {
        let userInfo = await this.UserModel.findOne({
          where: {phonenum: params.phonenum, password: params.newPass},
          attributes: {exclude: ['id', 'password']}
        });
        if (userInfo) {
          return this.json({status: 200, message: '密码更新成功', data: {needLogin: true}});
        } else {
          return this.json({status: 401, message: '密码更新失败', data: {}});
        }
      } else {
        return this.json({status: 401, message: '密码更新失败', data: {}});
      }
    }
  }

  async uploadAvatarAction () {
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
        let avatarPath = '/mnt/srv/web_static/plugins_admin/img';
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
          let avatarStatus =  await this.UserModel.update({
            headIcon: fileUrl
          }, {
            where: searchCondition
          });
          if (avatarStatus[0] > 0) {
            return this.json({status: 200, message: '头像修改成功', data: {
              path: fileUrl
            }});
          } else {
            return this.json({status: 401, message: '头像修改失败', data: {}});
          }
        } catch (err) {
          return this.json({status: 401, message: JSON.stringify(err) || '', data: {}});
        }
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

              if (currentUser && Number(currentUser.role) === 1) {
                  // 超级管理员
                  let pageIndex = Number(params.pageIndex) || 1;
                  let pageSize = Number(params.pageSize) || 30;
                  let _searchPhonenum = '';
                  if (_searchCondition.targetPhonenum) {
                      _searchPhonenum = _searchCondition.targetPhonenum;
                      delete _searchCondition.targetPhonenum;
                  }
                  let _finalConditions = Object.assign({}, _searchCondition, {
                      phonenum: {
                          [this.Op.ne]: params.phonenum
                      }
                  });
                  if (_searchPhonenum.trim() !== '') {
                      _finalConditions = Object.assign({}, _finalConditions, {
                          phonenum: {
                              [this.Op.regexp]: `${_searchPhonenum}`,
                              [this.Op.ne]: params.phonenum
                          }
                      });
                  }
                  if (_finalConditions.username) {
                      _finalConditions.username = {
                          [this.Op.regexp]: `${_finalConditions.username}`
                      }
                  }
                  let userList = await this.UserModel.findAll({
                      where: _finalConditions,
                      limit: pageSize,
                      offset: (pageIndex - 1) * pageSize,
                      attributes: {exclude: ['id', 'password']}
                  });
                  if (userList) {
                      if (_searchCondition.pageIndex) {
                          delete _searchCondition.pageIndex
                      }
                      if (_searchCondition.pageSize) {
                          delete _searchCondition.pageSize
                      }
                      let _countAll = await this.UserModel.count({
                          where: _finalConditions
                      });
                      return this.json({status: 200, message: '查询成功', data: {
                          list: userList || [],
                          count: userList.length,
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

  async queryUsersAction () {
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
        let queryUserList = await this.UserModel.findAll({
          where: {
            username: {
              [this.Op.regexp]: `${params.queryUsername}`
            }
          },
          attributes: {exclude: ['id', 'password']}
        });
        if (queryUserList) {
          return this.json({status: 200, message: '查询成功', data: {
            list: queryUserList || [],
            count: queryUserList.length
          }});
        } else {
          return this.json({status: 200, message: '查询成功', data: {
            list: [],
            count: 0
          }});
        }
      } catch (err) {
        return this.json({status: 403, message: err, data: {}});
      }
    }
  }

    /**
     * 修改用户的状态、权限
     * @returns {Promise<*|{line, column}|number>}
     */
    async updateUserSettingsAction () {
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
                if (currentUser && Number(currentUser.role) === 1) {
                    // 超级管理员
                    let updateCondition = {};
                    if (params.status) {
                        updateCondition.status = Number(params.status)
                    }
                    if (params.role) {
                        updateCondition.role = Number(params.role)
                    }
                    let updateUser = await this.UserModel.update(updateCondition, {
                        where: {
                            phonenum: params.targetPhonenum
                        }
                    });
                    if (updateUser) {
                        return this.json({status: 200, message: '修改成功', data: { phonenum: params.targetPhonenum }});
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

    async deleteUserAction () {
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
                if (currentUser && Number(currentUser.role) === 1) {
                    // 超级管理员
                    let deleteUser = await this.UserModel.destroy({
                        where: {
                            phonenum: params.targetPhonenum
                        }
                    });
                    if (deleteUser) {
                        return this.json({status: 200, message: '删除成功', data: { phonenum: params.phonenum }});
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

const jwt = require('jsonwebtoken');
const secret = 'dei2.com';
const tokenExpiresIn = '7d';

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.UserModel = this.models('inig/user');
    this.RoleModel = this.models('inig/role');

    this.UserModel.belongsTo(this.RoleModel, {
      // as: 'user',
      foreignKey: 'role',
      targetKey: 'id'
    })

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
  }

  _encodeId (id) {
    return ~Number(id) << 2 & 0x7FFFFFFF
  }

  _decodeId (id) {
    return ~((Number(id) | 0xFFFFFFFF80000000) >> 2)
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

  checkAuth () {
    let enkelCookie = this.getCookie('enkel')
    if (!enkelCookie || enkelCookie.trim() !== '9d935f95a1630e1282ae9861f16fcf0b') {
      return false
    } else {
      return true
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

  async loginAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (params.username === '') {
      return this.json({ status: 401, message: '用户名不能为空', data: {} });
    }
    if (params.password === '') {
      return this.json({ status: 401, message: '密码不能为空', data: {} });
    }
    let loginWith = '';
    let loginUser = await this.UserModel.findOne({
      where: { username: params.username, password: params.password },
      attributes: { exclude: ['createAt', 'updateAt', 'password'] },
      include: [{
        model: this.RoleModel,
        attributes: {
          exclude: ['createAt', 'updateAt']
        }
      }]
    });
    if (!loginUser) {
      loginUser = await this.UserModel.findOne({
        where: { phonenum: params.username, password: params.password },
        attributes: { exclude: ['createAt', 'updateAt', 'password'] },
        include: [{
          model: this.RoleModel,
          attributes: {
            exclude: ['createAt', 'updateAt']
          }
        }]
      });
      if (!loginUser) {
        return this.json({ status: 401, message: '账号或密码不正确', data: {} });
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
    return this.json({
      status: 200, message: '登录成功', data: Object.assign({}, loginUser.dataValues, {
        id: this._encodeId(loginUser.dataValues.id)
      }) || {}
    })
  }

  async registerAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    if (params.phonenum === '') {
      return this.json({ status: 401, message: '手机号不能为空', data: {} });
    } else {
      if (!params.phonenum.match(/^1[345789]\d{9}$/)) {
        return this.json({ status: 401, message: '手机号格式不正确', data: {} });
      }
    }
    if (params.password === '') {
      return this.json({ status: 401, message: '密码不能为空', data: {} });
    }
    let loginWith = '';
    let loginUserCount = await this.UserModel.count({
      where: { phonenum: params.phonenum },
      attributes: { exclude: ['id', 'password'] },
      group: 'id'
    }).catch(err => {
    });
    if (loginUserCount < 1) {
      // 注册新用户
      await this.UserModel.create({
        username: params.username || params.phonenum,
        password: params.password,
        phonenum: params.phonenum,
        nickname: params.nickname || params.phonenum,
        gender: params.gender || 2,
        role: '8739aec9-9732-4a21-a9d3-da8e5a51ed2c'
      });
      let count = await this.UserModel.count({ where: { phonenum: params.phonenum } });
      return this.json({
        status: 200, message: count > 0 ? '注册成功' : '注册失败', data: {
          username: params.username || params.phonenum,
          phonenum: params.phonenum
        }
      });
    } else {
      // 用户名已存在
      return this.json({ status: 401, message: '手机号已存在', data: {} });
    }
  }

  async getUserInfoAction () {
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
      let userInfo = await this.UserModel.findOne({
        where: { phonenum: params.phonenum },
        attributes: { exclude: ['id', 'password'] }
      });
      if (userInfo) {
        return this.json({ status: 200, message: '获取个人信息成功', data: userInfo || {} });
      } else {
        return this.json({ status: 401, message: '获取个人信息失败', data: {} });
      }
    }
  }

  async updateUserInfoAction () {
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
      let searchCondition = {};
      searchCondition['phonenum'] = params.phonenum;

      let needUpdateInfo = {}
      if (params.username) {
        needUpdateInfo.username = params.username
      }
      if (params.nickname) {
        needUpdateInfo.nickname = params.nickname
      }
      if (params.email) {
        needUpdateInfo.email = params.email
      }
      if (params.gender) {
        needUpdateInfo.gender = params.gender
      }
      if (params.birthday) {
        needUpdateInfo.birthday = params.birthday
      }
      if (params.homepage) {
        needUpdateInfo.homepage = params.homepage
      }
      let updateUserInfoStatus = await this.UserModel.update(needUpdateInfo, {
        where: searchCondition
      });

      if (updateUserInfoStatus[0] > 0) {
        let userInfo = await this.UserModel.findOne({
          where: { phonenum: params.phonenum },
          attributes: { exclude: ['id', 'password', 'createAt', 'updateAt'] },
          include: [{
            model: this.RoleModel,
            attributes: {
              exclude: ['id', 'createAt', 'updateAt']
            }
          }]
        });
        if (userInfo) {
          return this.json({ status: 200, message: '更新成功', data: userInfo || {} });
        } else {
          return this.json({ status: 401, message: '获取更新信息失败', data: {} });
        }
      } else {
        return this.json({ status: 401, message: '更新失败', data: {} });
      }
    }
  }

  async modifyPasswordAction () {
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
      let userInfo = await this.UserModel.findOne({
        where: {
          phonenum: params.phonenum,
          password: params.old
        },
        attributes: { exclude: ['id', 'password'] }
      });
      if (userInfo) {
        if (!/\S{6,}/.test(params.newPass)) {
          return this.json({ status: 401, message: '请输入6位密码', data: {} });
        }
        if (params.newPass !== params.rePass) {
          return this.json({ status: 401, message: '两次密码不一致', data: {} });
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
            where: { phonenum: params.phonenum, password: params.newPass },
            attributes: { exclude: ['id', 'password'] }
          });
          if (userInfo) {
            return this.json({ status: 200, message: '密码更新成功', data: { needLogin: true } });
          } else {
            return this.json({ status: 401, message: '密码更新失败', data: {} });
          }
        } else {
          return this.json({ status: 401, message: '密码更新失败', data: {} });
        }
      } else {
        return this.json({ status: 401, message: '旧密码不正确', data: {} });
      }
    }
  }

  async uploadAvatarAction () {
    let params = this.get();
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
        let avatarPath = '/mnt/srv/web_static/extensions/avatar';
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
          let fileUrl = `https://static.dei2.com/extensions/avatar/${uploadedFile.filename}`;
          let avatarStatus = await this.UserModel.update({
            headIcon: fileUrl
          }, {
            where: searchCondition
          });
          if (avatarStatus[0] > 0) {
            return this.json({
              status: 200, message: '头像修改成功', data: {
                path: fileUrl
              }
            });
          } else {
            return this.json({ status: 401, message: '头像修改失败', data: {} });
          }
        } catch (err) {
          return this.json({ status: 401, message: JSON.stringify(err) || '', data: {} });
        }
      }
    }
  }

  async uploadScreenshotAction () {
    let params = this.get();
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
        let screenshotPath = '/mnt/srv/web_static/plugins_admin/img';
        try {
          let uploadedFile = await this.upload({
            accept: params.accept,
            size: Number(params.ms) * 1024,
            uploadDir: screenshotPath,
            rename: params.rn || false,
            multiples: false
          });
          let fileUrl = `https://static.dei2.com/plugins_admin/img/${uploadedFile.filename}`;
          return this.json({
            status: 200, message: '上传成功', data: {
              path: fileUrl
            }
          });
        } catch (err) {
          return this.json({ status: 401, message: JSON.stringify(err) || '', data: {} });
        }
      }
    }
  }

  async listAction () {
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
            attributes: { exclude: ['id', 'password'] }
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
            return this.json({
              status: 200, message: '查询成功', data: {
                list: userList || [],
                count: userList.length,
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

  async queryUsersAction () {
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
        let _queryCondition = {}
        if (params.queryUsername && params.queryUsername.trim() !== '') {
          _queryCondition.username = {
            [this.Op.regexp]: `${params.queryUsername}`
          }
        }
        let queryUserList = await this.UserModel.findAll({
          where: _queryCondition,
          attributes: { exclude: ['id', 'password', 'token', 'updatedAt', 'lastLoginIp', 'createdAt'] }
        });
        if (queryUserList) {
          return this.json({
            status: 200, message: '查询成功', data: {
              list: queryUserList || [],
              count: queryUserList.length
            }
          });
        } else {
          return this.json({
            status: 200, message: '查询成功', data: {
              list: [],
              count: 0
            }
          });
        }
      } catch (err) {
        return this.json({ status: 403, message: err, data: {} });
      }
    }
  }

  async deleteUserAction () {
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
        if (currentUser && Number(currentUser.role) === 1) {
          // 超级管理员
          let deleteUser = await this.UserModel.destroy({
            where: {
              phonenum: params.targetPhonenum
            }
          });
          if (deleteUser) {
            return this.json({ status: 200, message: '删除成功', data: { phonenum: params.phonenum } });
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

}

const jwt = require('jsonwebtoken');
const secret = 'dei2.com';
const tokenExpiresIn = '7d';

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.RfcModel = this.models('inig/rfc');
    this.UserModel = this.models('inig/user');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
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

  /**
   * 组件发布
   * @returns 
   */
  async publishAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    let queryResponse = await this.RfcModel.findOne({
      where: { pid: params.id },
      attributes: { exclude: ['createAt', 'updateAt'] }
    });
    if (!queryResponse) {
      // 当前插件无审核中
      await this.RfcModel.create({
        pid: params.id,
        name: params.name,
        version: params.version,
        description: params.description,
        logo: params.logo,
        author: params.author,
        phonenum: params.phonenum,
        homepage: params.homepage,
        url: params.url || '',
        size: params.size || '0'
      })
    } else {
      // 当前插件 存在审核中的版本
      if (!params.override || (params.override == 'false')) {
        return this.json({
          status: 409,
          message: '已经存在审核中的版本',
          data: {}
        })
      } else {
        // 更新 审核中版本的信息
        await this.RfcModel.update({
          name: params.name,
          version: params.version,
          description: params.description,
          logo: params.logo,
          author: params.author,
          phonenum: params.phonenum,
          homepage: params.homepage,
          url: params.url || '',
          size: params.size || '0'
        }, {
          where: {
            pid: params.id
          }
        });
      }
    }
    let res = await this.RfcModel.findOne({
      where: { pid: params.id }
    });
    return this.json({
      status: 200,
      data: res.dataValues || {}
    })
  }

  async listAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    console.log('>>>>>>. params: ', params)
    if (!params.token || params.token === '' || !params.phonenum || params.phonenum === '') {
      return this.json({ status: 401, message: '缺少参数', data: { needLogin: true } });
    }
    if (!this.checkLogin({ username: params.phonenum, token: params.token })) {
      return this.json({ status: 401, message: '登录状态失效，请重新登录', data: { needLogin: true } });
    } else {
      let userInfo = await this.UserModel.findOne({
        where: {
          phonenum: params.phonenum
        },
        attributes: { exclude: ['id', 'password', 'createAt', 'updateAt'] }
      })
      if (!userInfo) {
        return this.json({
          status: 402,
          message: '账号不存在',
          data: {
            needRegister: true
          }
        })
      } else if (userInfo.role != '0d883eff-d6ae-4992-9f11-848f8aa9c61c') {
        return this.json({
          status: 1001,
          message: '权限不足',
          data: {
          }
        })
      } else {
        let queryResponse = await this.RfcModel.findAll({
          where: {
            status: Number(params.status) || 0
          }
        })
        return this.json({
          status: 200,
          message: '成功',
          data: {
            list: queryResponse || []
          }
        })
      }
    }
  }
}

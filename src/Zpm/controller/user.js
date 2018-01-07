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

    this.UserModel = this.models('Zpm/user')
  }

  indexAction () {
    return this.UserModel.findOne({where: {'username': 'ls'}}).then((user) => {
      return this.json({status: 200, message: '成功2', data: user})
    })
  }

  async addUserAction () {
    await this.UserModel.create({
      username: 'ls',
      password: '123123',
      phonenum: '18000000000',
      nickname: '王二小'
    });
    let count = await this.UserModel.count({where: {username: 'ls'}});
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
      let loginUser = await this.UserModel.findOne({where: {username: args.username, password: args.password}});
      if (!loginUser) {
        loginUser = await this.UserModel.findOne({where: {phonenum: args.username, password: args.password}});
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
      return this.json({status: 403, message: '请求方法不正确'});
    }
    let params = await this.post();
    if (params.username === '') {
      return this.json({status: 401, message: '用户名不能为空'});
    }
    if (params.password === '') {
      return this.json({status: 401, message: '密码不能为空'});
    }
    let loginWith = '';
    let loginUser = await this.UserModel.findOne({where: {username: params.username, password: params.password}});
    if (!loginUser) {
      loginUser = await this.UserModel.findOne({where: {phonenum: params.username, password: params.password}});
      if (!loginUser) {
        return this.json({status: 401, message: '账号或密码不正确'});
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
    let updateLoginStatus = await this.UserModel.update({token: loginToken}, {
      where: searchCondition
    });
    if (updateLoginStatus[0] > 0) {
      // 更新用户登录token成功
      if (loginUser.dataValues.id) {
        delete loginUser.dataValues.id
      }
      if (loginUser.dataValues.password) {
        delete loginUser.dataValues.password;
      }
      loginUser.dataValues.token = loginToken;
    }
    return this.json({status: 200, message: '登录成功', data: loginUser.dataValues})
  }

}

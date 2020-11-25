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

    this.UserModel = this.models('enkel/user');
    this.ComponentModel = this.models('enkel/component');
    this.CategoryModel = this.models('enkel/category');

    this.ComponentModel.belongsTo(this.UserModel, {
      foreignKey: 'auth',
      targetKey: 'phonenum'
    })

    this.ComponentModel.belongsTo(this.CategoryModel, {
      foreignKey: 'category',
      targetKey: 'uuid'
    })

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async indexAction () {
    return this.json({
      status: 200, message: '成功', data: []
    })
  }

  async uploadAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // console.log('>>>>', params)
    if (params.uuid) {
      // 修改组件
      let updateResponse = await this.ComponentModel.update({
        title: params.title,
        desc: params.desc,
        icon: params.icon,
        url: params.url,
        version: params.version,
        category: params.category
      }, {
        where: {
          uuid: params.uuid
        }
      });
      if (updateResponse[0] > 0) {
        // 更新用户登录token成功
        let _component = await this.ComponentModel.findOne({
          where: { uuid: params.uuid },
          attributes: { exclude: ['id'] },
          include: [
            {
              model: this.UserModel,
              attributes: {
                exclude: ['id', 'createAt', 'updateAt', 'token', 'password']
              }
            },
            {
              model: this.CategoryModel,
              attributes: {
                exclude: ['id', 'createAt', 'updateAt']
              }
            }
          ]
        });

        if (_component) {
          return this.json({ status: 200, message: '发布成功', data: _component });
        } else {
          return this.json({ status: 1001, message: '发布失败，请稍后再试' });
        }
      } else {
        return this.json({ status: 1001, message: '发布失败，请稍后再试' });
      }
    } else {
      // 新增组件
      await this.ComponentModel.create(params);
      let count = await this.ComponentModel.count({ where: { path: params.path } });
      return this.json({ status: 200, message: count > 0 ? '添加成功' : '添加失败' });
    }
    return this.json({
      status: 200,
      data: {}
    })
  }

  async listAction () {
    // if (!this.isPost()) {
    //   return this.json({ status: 405, message: '请求方法不正确', data: {} });
    // }
    // let params = await this.post();
    let params = this.get()
    let _searchCondition = {}
    if (params.auth) {
      _searchCondition.auth = params.auth
    }
    if (Object.keys(params).indexOf('status') > -1) {
      _searchCondition.status = Number(params.status)
    }
    let pageIndex = Number(params.pageIndex) || 1;
    let pageSize = Number(params.pageSize) || 100;
    let componentList = await this.ComponentModel.findAll({
      where: _searchCondition,
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
      attributes: { exclude: ['id'] },
      include: [
        {
          model: this.UserModel,
          attributes: {
            exclude: ['id', 'createAt', 'updateAt', 'token', 'password']
          }
        },
        {
          model: this.CategoryModel,
          attributes: {
            exclude: ['id', 'createAt', 'updateAt']
          }
        }
      ]
    });
    if (componentList) {
      let _countAll = await this.ComponentModel.count({
        where: _searchCondition
      });
      return this.json({
        status: 200, message: '查询成功', data: {
          list: componentList || [],
          count: componentList.length,
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
  }
}

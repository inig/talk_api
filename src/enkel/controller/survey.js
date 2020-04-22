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
module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.SurveyModel = this.models('enkel/survey');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', 'content-type');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  // indexAction () {
  //   if (!this.checkAuth()) {
  //     return this.json({ status: 1001, message: '请求不合法', data: {} })
  //   }
  //   return this.UserModel.findOne({ where: { 'username': 'ls' } }).then((user) => {
  //     return this.json({ status: 200, message: '成功2', data: user })
  //   })
  // }

  async createAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    if (params.uuid === '') {
      return this.json({ status: 401, message: 'Survey Id不能为空', data: {} });
    }
    if (params.auth_id === '') {
      return this.json({ status: 401, message: 'Auth Id不能为空', data: {} });
    }
    if (params.auth_name === '') {
      return this.json({ status: 401, message: 'Auth Name不能为空', data: {} });
    }
    let response = await this.SurveyModel.create({
      uuid: params.uuid,
      auth_id: params.auth_id,
      auth_name: params.auth_name,
      auth_avatar: params.auth_avatar,
      name: params.name || '未命名调查',
      desc: params.desc || '',
      target_type: params.target_type || 'group',
      target_name: params.target_name || '',
      target_id: params.target_id || '',
      question: params.question || [
        {
          type: 'RANDOM'
        }
      ],
      answer: params.answer || []
    })
    if (response.dataValues.id) {
      return this.json({
        status: 200,
        data: Object.assign({}, response.dataValues, {
          id: null
        })
      })
    } else {
      return this.json({
        status: 1002,
        message: '创建失败'
      })
    }
  }

  async detailAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    if (params.uuid === '') {
      return this.json({ status: 401, message: 'Survey Id不能为空', data: {} });
    }
    let response = await this.SurveyModel.findOne({
      where: { uuid: params.uuid },
      attributes: { exclude: ['id'] }
    });
    if (response) {
      return this.json({ status: 200, message: '获取调查详情成功', data: response || {} });
    } else {
      return this.json({ status: 1002, message: '获取调查详情失败', data: {} });
    }
  }

  async answerAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    if (params.uuid === '') {
      return this.json({ status: 401, message: 'Survey Id不能为空', data: {} });
    }
    if (params.answer === '') {
      return this.json({ status: 401, message: 'Answer不能为空', data: {} });
    }
    let response = await this.SurveyModel.findOne({
      where: { uuid: params.uuid },
      attributes: { exclude: ['id'] }
    });
    if (response) {
      let answer = JSON.parse(response.dataValues.answer)
      answer.unshift(JSON.parse(params.answer))
      let updateParams = {
        answer: answer
      }
      let res = await this.SurveyModel.update(updateParams, {
        where: { uuid: params.uuid },
        attributes: { exclude: ['id'] }
      });
      if (res[0] > 0) {
        return this.json({
          status: 200, message: '调查更新成功', data: {
            uuid: params.uuid
          }
        });
      } else {
        return this.json({ status: 1002, message: '调查更新失败', data: {} });
      }
    } else {
      return this.json({ status: 1002, message: '调查更新失败,请稍后再试', data: {} });
    }

  }

}

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
const CLIENT_ID = 'E0vrkHoQTODsnltW9GNSv8r9';
const CLIENT_SECRET = 'kMp3RsnSu385dIrGHoY06GbwGh7r5QPC';

const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.BdConfigModel = this.models('Bd/config');
  }

  indexAction () {
    return this.json({status: 200, message: 'bd成功', data: {}})
  }

  async tokenAction () {
    // http://ai.baidu.com/docs#/OCR-API/6c337940
    let params = {}
    // if (!this.isPost()) {
    //   return this.json({status: 405, message: '请求方法不正确', data: {}});
    // }
    // let params = await this.post();

    let bdConfigData = await this.BdConfigModel.findAll({
      where: {
        ci: params.ci || CLIENT_ID,
        cs: params.cs || CLIENT_SECRET
      }
    });
    let flag = 0
    if (bdConfigData.length > 0) {
      if (Number(bdConfigData[0].ei) > (+new Date() + 20 * 60 * 1000)) {
        // access_token有效
        return this.json({status: 200, message: '成功', data: {
          access_token: bdConfigData[0].at
        }})
      } else {
        // access_token即将失效
        flag = 1
      }
    } else {
      flag = 2
    }
    const _data = qs.stringify({
      'grant_type': 'client_credentials',
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    });
    return axios({
      url: 'https://aip.baidubce.com/oauth/2.0/token?' + _data,
      method: 'get'
    }).then(async ({data}) => {
      if (data.error) {
        return this.json({status: 401, message: data.error_description, data: {}});
      } else {
        if (flag === 1) {
          let updateData = await this.BdConfigModel.update({
            at: data.access_token,
            sk: data.session_key,
            ss: data.session_secret,
            ei: (Number(data.expires_in) * 1000 + (+new Date()))
          }, {
            where: {
              ci: CLIENT_ID,
              cs: CLIENT_SECRET
            }
          })
          if (updateData[0] > 0) {
            return this.json({status: 200, message: '成功', data: {
              access_token: data.access_token
            }})
          } else {
            return this.json({status: 401, message: '失败', data: {
              access_token: ''
            }})
          }
        } else if (flag === 2) {
          await this.BdConfigModel.create({
            at: data.access_token,
            sk: data.session_key,
            ss: data.session_secret,
            ci: CLIENT_ID,
            cs: CLIENT_SECRET,
            ei: (data.expires_in + (+new Date()) * 1000)
          });
        } else {}
        return this.json({status: 200, message: '成功', data: {
          access_token: data.access_token
        }});
      }
    }).catch(err => {
      return this.json({status: 401, message: err.message, data: {}});
    })
  }
}

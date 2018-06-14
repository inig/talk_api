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
const FEMALES = [
  {
    name: '西施',
    desc: '春秋战国时期出生于浙江诸暨苎萝村',
    poetry: {
      title: '饮湖上初晴后雨',
      author: '苏轼',
      content: ['水光潋滟晴方好', '山色空蒙雨亦奇', '欲把西湖比西子', '淡妆浓抹总相宜']
    }
  },
  {
    name: '貂蝉',
    desc: '',
    poetry: {
      title: '忆江南 貂蝉',
      author: '贵谷子',
      content: ['媚娇娘', '枭雄逐彷徨', '红罗纤算干戈止', '豆蔻闭月乱世生', '貂蝉何处寻']
    }
  },
  {
    name: '王昭君',
    desc: '',
    poetry: {
      title: '五美吟 明妃',
      author: '曹雪芹',
      content: ['绝艳惊人出汉宫', '红颜命薄古今同', '君王纵使轻颜色', '予夺权何畀画工']
    }
  },
  {
    name: '杨贵妃',
    desc: '',
    poetry: {
      title: '清平调词',
      author: '李白',
      content: ['云想衣裳花想容', '春风拂槛露华浓', '若非群玉山头见', '会向瑶台月下逢']
    }
  },
  {
    name: '冯小怜',
    desc: '',
    poetry: {
      title: '冯小怜',
      author: '李贺',
      content: ['湾头见小怜,请上琵琶弦', '破得春风恨,今朝值几钱', '裙垂竹叶带,鬓湿杏花烟', '玉冷红丝重,齐宫妾驾鞭']
    }
  },
  {
    name: '苏妲己',
    desc: '',
    poetry: {
      title: '妲己图',
      author: '杨维桢',
      content: ['小白竿头血', '新图入汉廷', '宫中双燕子', '齐作牝鸡鸣']
    }
  },
  {
    name: '赵飞燕',
    desc: '汉成帝刘骜的皇后，江都（今扬州）人',
    poetry: {
      title: '汉宫曲',
      author: '徐凝',
      content: ['水色帘前流玉霜', '赵家飞燕侍昭阳', '掌中舞罢箫声绝', '三十六宫秋夜长']
    }
  },
  {
    name: '郑旦',
    desc: '',
    poetry: {
      title: '拾遗记',
      author: '王嘉',
      content: ['越又有美女二人', '一名夷光', '二名修明郑旦', '以贡于吴', '吴处以椒华之房']
    }
  },
  {
    name: '褒姒',
    desc: '',
    poetry: {
      title: '十五夜观灯',
      author: '卢照邻',
      content: ['锦里开芳宴,兰缸艳早年', '缛彩遥分地,繁光远缀天', '接汉疑星落,依楼似月悬', '别有千金笑,来映九枝前']
    }
  },
  {
    name: '甄宓',
    desc: '',
    poetry: {
      title: '和梨花',
      author: '文同',
      content: ['素质静相依,清香暖更飞', '笑从风外歇,啼向雨中归', '江令歌琼树,甄妃梦玉衣', '画堂明月地,常此惜芳菲']
    }
  }
];

const MALES = [
  {
    name: '潘安',
    desc: '',
    poetry: {
      title: '花底',
      author: '杜甫',
      content: ['紫萼扶千蕊,黄须照万花', '忽疑行暮雨,何事入朝霞', '恐是潘安县,堪留卫玠车', '深知好颜色,莫作委泥沙']
    }
  },
  {
    name: '卫玠',
    desc: '',
    poetry: {
      title: '晋 卫玠',
      author: '孙元晏',
      content: ['叔宝羊车海内稀', '山家女婿好风姿', '江东士女无端甚', '看杀玉人浑不知']
    }
  },
  {
    name: '子都',
    desc: '',
    poetry: {
      title: '告子上',
      author: '孟子',
      content: ['至于子都', '天下莫不知其姣也', '不知子都之姣者', '无目者也']
    }
  },
  {
    name: '宋文公',
    desc: '',
    poetry: {
      title: '左传',
      author: '左丘明',
      content: ['宋公子鲍礼于国人', '公子鲍美而艳']
    }
  },
  {
    name: '宋玉',
    desc: '',
    poetry: {
      title: '赠邻女',
      author: '鱼玄机',
      content: ['羞日遮罗袖,愁春懒起妆', '易求无价宝,难得有心郎', '枕上潜垂泪,花间暗断肠', '自能窥宋玉,何必恨王昌']
    }
  },
  {
    name: '兰陵王',
    desc: '',
    poetry: {
      title: '念裕堂',
      author: '王国维',
      content: ['江南天子皆词客', '河北诸王尽将材', '乍歌乐府兰陵曲', '又见湘东玉轴灰']
    }
  },
  {
    name: '嵇康',
    desc: '',
    poetry: {
      title: '艺苑卮言',
      author: '王世贞',
      content: ['每叹嵇生琴夏侯色', '今千古他人览之', '犹为不堪', '况其身乎']
    }
  },
  {
    name: '韩子高',
    desc: '',
    poetry: {
      title: '',
      author: '陈蒨',
      content: ['昔闻周小史', '今歌月下人', '玉尘手不别', '羊车市若空', '谁愁两雄并', '金貂应让侬']
    }
  },
  {
    name: '慕容冲',
    desc: '',
    poetry: {
      title: '资治通鉴',
      author: '司马光',
      content: ['冲有自得之志', '赏罚任情']
    }
  },
  {
    name: '独孤信',
    desc: '',
    poetry: {
      title: '',
      author: '元修',
      content: ['世乱识贞良', '岂虚言哉']
    }
  }
];

const RESULTS = {
  '1': MALES,
  '2': FEMALES
};

const CLIENT_ID = 'E0vrkHoQTODsnltW9GNSv8r9';
const CLIENT_SECRET = 'kMp3RsnSu385dIrGHoY06GbwGh7r5QPC';
const APP_ID = '11348934';

const CLIENT_ID2 = 'G3OXT72HTkCXrrkIj1LZuwqu';
const CLIENT_SECRET2 = 'ZXF5eSbatPXXkoiodteqHFBVArQ7GjVT';
const APP_ID2 = '11350031';

const axios = require('axios');
const qs = require('querystring');
const AipOcrClient = require('baidu-aip-sdk').ocr;
const client = new AipOcrClient(APP_ID, CLIENT_ID, CLIENT_SECRET);

const AipFaceClient = require('baidu-aip-sdk').face;
const faceClient = new AipFaceClient(APP_ID2, CLIENT_ID2, CLIENT_SECRET2);

const AipSpeechClient = require('baidu-aip-sdk').speech;
const speechClient = new AipSpeechClient(APP_ID2, CLIENT_ID2, CLIENT_SECRET2);

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

  async detectFaceAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    if (!params.at || (params.at.trim() === '')) {
      return this.json({status: 1001, message: '缺少access_token', data: {}});
    }
    if (!params.image || (params.image.trim() === '')) {
      return this.json({status: 1001, message: '缺少待识别的图片', data: {}});
    }
    let queryParams = {};
    if (/^https?:\/\//.test(params.image + '')) {
      // 图片url
      queryParams.url = encodeURI(params.image)
    } else if (/^data:image\//.test(params.image + '')) {
      // 图片数据 base64
      queryParams.image = params.image
    } else {
      queryParams.image = params.image
      // return this.json({status: 1001, message: '图片数据不正确', data: {}});
    }
    var options = {};
    options["face_field"] = "age,beauty,expression,faceshape,gender,glasses,race,quality,facetype";
    options["max_face_num"] = "1";
    options["face_type"] = "LIVE";
    // return speechClient.text2audio('老师：如果追求一个中国女孩，你请她吃什么? 小李：麻辣烫。 老师：韩国女孩呢? 小王：韩国泡菜。 老师：日本女孩呢? 小明：马赛克。 老师：滚出去!', {
    //   per: 3
    // }).then(res => {
    //   if (res.data) {
    //     const fs = require('fs');
    //     fs.writeFileSync('tts.mpVoice.mp3', res.data);
    //   }
    //   return this.json({status: 200, message: '成功', data: {}})
    // })
    return faceClient.detect(params.image, 'BASE64', options).then(res => {
      return this.json({status: 200, message: '成功', data: res})
    })
    return axios({
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + params.at,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: queryParams
    }).then(({data}) => {
      return this.json({status: 200, message: '成功', data: data});
    }).catch(err => {
      return this.json({status: 401, message: err.message, data: {}});
    })
  }

  async imgAction () {
    let params = this.get();
    return axios({
      url: params.image,
      method: 'get'
    }).then(res => {
      return this.json({status: 200, message: '成功', data: (new Buffer(res.data)).toString('base64')});
    }).catch(err => {
      return this.json({status: 401, message: err.message, data: {}});
    })
  }

  async img2Action () {
    const http = require('https');
    let params = this.get();
    return new Promise((resolve, reject) => {
      http.get(params.image, res => {
        let chunks = [];
        let size = 0;
        res.on('data', chunk => {
          chunks.push(chunk);
          size += chunk.length;
        });

        res.on('end', err => {
          if (err) {
            reject(err.message);
          }
          let data = Buffer.concat(chunks, size);
          resolve(data.toString('base64'));
          return this.json({status: 200, message: '成功', data: data.toString('base64')})
        })
      })
    })
  }

  async fileAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    return this.json({status: 200, message: '成功', data: {}})
  }

  async uploadAction () {
    const that = this
    const formidable = require('formidable');
    const fs = require('fs');
    let form = new formidable.IncomingForm();
    let files = [];
    form
      .on('file', function (field, file) {
        files.push(file);
      });

    form.parse(enkel.request, function (err) {
      if (err) {
        return that.json({status: 201, message: err.message, data: {}});
      }
      let imageData = fs.readFileSync(files[0].path);
      return that.json({status: 200, message: '成功', data: new Buffer(imageData).toString('base64')});
    })
  }

  async resultAction () {
    if (!this.isPost()) {
      return this.json({status: 405, message: '请求方法不正确', data: {}});
    }
    let params = await this.post();
    return this.json({status: 200, message: '成功', data: RESULTS[String(params.gender)][9 - Math.floor(Number(params.score) / 10)]});
  }
}

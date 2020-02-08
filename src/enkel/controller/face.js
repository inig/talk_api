const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.APP_KEY = 'BDwv4OaugITE8HVAbe12HqOy46VOceMt'
    this.APP_SECRET = 'JBkSDM5LKyl7jTsuZBC2aLXBffdDdZrJ'

    this.FACESET_TOKEN = 'c7ba7df761a2ef77bf8779c71a788a48'

    /**
     * gray config
     */
    this.BDP_FACESET_TOKEN = '0a2215543ce45bd31ab7732378e2a9fb'

    this.MemberModel = this.models('enkel/member');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async createFacesetAction () {
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/faceset/create'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).catch(err => {
      return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
    }).then(res => {
      return this.json({
        status: 200,
        message: '成功',
        data: {}
      })
    })
  }

  async getFacesetDetailAction () {
    let params = this.get()
    let token = '71bbf3fb7c98b9eef70cfc87dca802e2' || this.FACESET_TOKEN || ''
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/faceset/getdetail'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET,
      faceset_token: token
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).catch(err => {
      return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
    }).then(res => {
      return this.json({
        status: 200,
        message: '成功',
        data: res.data.face_tokens || []
      })
    })
  }

  async getFacesetsAction () {
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/faceset/getfacesets'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).catch(err => {
      return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
    }).then(res => {
      return this.json({
        status: 200,
        message: '成功',
        data: res.data || []
      })
    })
  }

  async searchAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();

    let token = params.faceset || this.FACESET_TOKEN || ''
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/search'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET,
      faceset_token: token,
      // image_url: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=300159331,3707858678&fm=26&gp=0.jpg'
      // image_url: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1410678517,341232905&fm=26&gp=0.jpg'
      image_base64: params.img
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).then((res) => {
      if (res.data.faces.length === 0) {
        return this.json({
          status: 1001,
          message: '失败',
          data: null
        })
      } else {
        let thresholds = res.data.thresholds['1e-3']
        let confidence = res.data.results ? res.data.results[0].confidence : 0
        if (confidence >= thresholds) {
          // 可信
          return this.json({
            status: 200,
            message: '成功',
            // data: res.data || {}
            data: {
              userId: res.data.results[0].user_id
            }
          })
        } else {
          return this.json({
            status: 1001,
            message: '失败',
            data: null
          })
        }
      }
    }).catch(err => {
      return this.json({ status: 1002, message: '人脸识别失败，请稍后再试', data: {} })
    })
  }

  async addFaceAction () {
    let params = this.get()
    let token = this.FACESET_TOKEN || ''
    let face_tokens = params.faces || ''
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET,
      faceset_token: token
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).catch(err => {
      return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
    }).then(res => {
      return this.json({
        status: 200,
        message: '成功',
        data: {}
      })
    })
  }

  addFace (args) {
    return new Promise(async (resolve, reject) => {
      let token = args.faceset || this.FACESET_TOKEN || ''
      let face_tokens = args.faces || ''
      let url = 'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface'
      let reqeustParams = {
        api_key: this.APP_KEY,
        api_secret: this.APP_SECRET,
        faceset_token: token,
        face_tokens: face_tokens
      }
      await axios({
        url: url,
        method: 'POST',
        data: qs.stringify(reqeustParams)
      }).catch(err => {
        reject(new Error(err.message))
      }).then(res => {
        resolve({
          status: 200,
          message: '成功',
          data: res.data
        })
      })
    })
  }

  /**
   * 人脸添加标识信息
   * @param {*} args 
   */
  setFaceUserId (args) {
    return new Promise(async (resolve, reject) => {
      let url = 'https://api-cn.faceplusplus.com/facepp/v3/face/setuserid'
      let reqeustParams = {
        api_key: this.APP_KEY,
        api_secret: this.APP_SECRET,
        face_token: args.faces,
        user_id: args.userId
      }
      await axios({
        url: url,
        method: 'POST',
        data: qs.stringify(reqeustParams)
      }).catch(err => {
        reject(new Error(err.message))
      }).then(res => {
        resolve({
          status: 200,
          message: '成功',
          data: res.data
        })
      })
    })
  }

  async detectAction () {
    let params = await this.post()
    let token = params.token || ''
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/detect'
    let reqeustParams = {
      api_key: this.APP_KEY,
      api_secret: this.APP_SECRET,
      image_url: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=933865351,281155046&fm=26&gp=0.jpg'
    }
    await axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reqeustParams)
    }).catch(err => {
      return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
    }).then(async ({ data }) => {
      let faces = data.faces.map(item => item.face_token).join(',')
      await this.addFace({
        faces: faces
      }).catch(err => {
        return this.json({ status: 1002, message: err.message || '转换失败，请稍后再试', data: {} })
      }).then(({ data }) => {
        return this.json({
          status: 200,
          message: '成功',
          data: data
        })
      })
    })
  }

  detect (args) {
    return new Promise(async (resolve, reject) => {
      let url = 'https://api-cn.faceplusplus.com/facepp/v3/detect'
      let reqeustParams = {
        api_key: this.APP_KEY,
        api_secret: this.APP_SECRET,
        image_base64: args.img
      }
      await axios({
        url: url,
        method: 'POST',
        data: qs.stringify(reqeustParams)
      }).catch(err => {
        resolve('')
      }).then(async ({ data }) => {
        resolve(data.faces.map(item => item.face_token).join(','))
      })
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
    let loginUserCount = await this.MemberModel.count({
      where: { phonenum: params.phonenum },
      attributes: { exclude: ['id', 'password'] }
    });
    if (loginUserCount < 1) {
      // 注册新用户
      await this.MemberModel.create({
        username: params.phonenum,
        password: params.password,
        phonenum: params.phonenum,
        nickname: '',
        gender: 2,
        plugins: '',
        role: 1
      });
      let count = await this.MemberModel.count({ where: { phonenum: params.phonenum } });
      return this.json({ status: 200, message: count > 0 ? '注册成功' : '注册失败', data: {} });
    } else {
      // 用户名已存在
      return this.json({ status: 401, message: '手机号已存在', data: {} });
    }
  }

  async bindFaceIdAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    let updatedData = {}

    let faces = await this.detect({
      img: params.img
    })

    /**
     * 新增人脸
     */
    let addFacePromise = this.addFace({
      faces: faces
    })
    /**
     * 人脸绑定userId
     */
    let setFaceUserIdPromise = this.setFaceUserId({
      userId: params.userId,
      faces: faces
    })
    Promise.all([addFacePromise, setFaceUserIdPromise]).catch(err => {
      return this.json({
        status: 1002,
        message: '人脸绑定失败',
        data: null
      })
    }).then(async () => {
      let loginUserCount = await this.MemberModel.count({
        where: { phonenum: params.phonenum },
        attributes: { exclude: ['id', 'password'] }
      });
      if (loginUserCount < 1) {
        // 用户不存在 
      } else {
        let updateUserInfoStatus = await this.MemberModel.update({
          faceid: faces
        }, {
          where: {
            phonenum: params.phonenum
          }
        });
        return this.json({
          status: 200,
          message: '成功',
          data: updateUserInfoStatus || {}
        })
      }
    })
  }

  async bindGrayConfigFaceIdAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();

    let faces = await this.detect({
      img: params.img
    })

    /**
     * 新增人脸
     */
    let addFacePromise = this.addFace({
      faces: faces,
      faceset: params.faceset
    })
    /**
     * 人脸绑定userId
     */
    let setFaceUserIdPromise = this.setFaceUserId({
      userId: params.userId,
      faces: faces
    })
    Promise.all([addFacePromise, setFaceUserIdPromise]).catch(err => {
      return this.json({
        status: 1002,
        message: '人脸绑定失败',
        data: null
      })
    }).then(async () => {
      return this.json({
        status: 200,
        message: '人脸绑定成功',
        data: {
          userId: params.userId
        }
      })
    })
  }
}

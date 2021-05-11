module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.RfcModel = this.models('inig/rfc');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
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
    console.log('publish: ', params)
    let queryResponse = await this.RfcModel.findOne({
      where: { pid: params.id },
      attributes: { exclude: ['createAt', 'updateAt'] }
    });
    if (!params.override || (params.override == 'false')) {

    }
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

}

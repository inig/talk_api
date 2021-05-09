module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.RoleModel = this.models('inig/role');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
  }

  async addAction () {
    // await this.RoleModel.create({
    //   label: '普通用户',
    //   name: 'user',
    //   desc: ''
    // });
    // await this.RoleModel.create({
    //   label: '管理员',
    //   name: 'admin',
    //   desc: ''
    // });
    // await this.RoleModel.create({
    //   label: '超级管理员',
    //   name: 'superadmin',
    //   desc: ''
    // });
    return this.json({
      status: 200
    })
  }

}

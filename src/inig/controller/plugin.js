module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.PluginModel = this.models('inig/plugin');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
  }

  async addAction () {
    return this.json({
      status: 200
    })
  }

}

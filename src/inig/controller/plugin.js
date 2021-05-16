module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.PluginModel = this.models('inig/plugin');
    this.CategoryModel = this.models('inig/category');
    // this.PluginModel.belongsTo(this.CategoryModel, {
    //   // as: 'user',
    //   foreignKey: 'category',
    //   // targetKey: 'id',
    // })
    // this.PluginModel.belongsTo(this.CategoryModel, {
    //   foreignKey: 'category',
    //   targetKey: 'id',
    // })
    // this.CategoryModel.hasMany(this.PluginModel, {
    //   // targetKey: 'category',
    //   // foreignKey: 'id',
    //   as: 'list'
    // })

    this.CategoryModel.hasMany(this.PluginModel, {
      // as: 'list',
      targetKey: 'category',
      foreignKey: 'id',
    })
    // this.PluginModel.belongsTo(this.CategoryModel, {
    //   as: 'list',
    //   targetKey: 'id',
    //   foreignKey: 'category',
    // })

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

  async listAction () {
    let allCategories = await this.CategoryModel.findAll()
    let ps = []
    for (let i = 0; i < allCategories.length; i++) {
      ps.push(this.PluginModel.findAll({
        where: {
          category: allCategories[i].id
        },
        limit: 50,
        offset: 0,
        order: [
          ['updatedAt', 'DESC']
        ]
      }))
    }
    await Promise.all(ps).then(res => {
      allCategories.map((item, index) => {
        item['dataValues'].list = res[index] || []
        return item
      })
      return this.json({
        status: 200,
        message: '成功2',
        data: {
          list: allCategories
        }
      })
    }).catch(err => {
      return this.json({
        status: 1001,
        message: err.message || '失败',
        data: {
          list: []
        }
      })
    })
  }

}

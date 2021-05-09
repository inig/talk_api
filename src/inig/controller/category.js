const { exec, execSync } = require('child_process')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

function S4 () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
function getUUID (prefix) {
  return (
    (prefix ? prefix : '') +
    (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  )
}

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http)

    this.CategoryModel = this.models('inig/category');

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
  }

  async addAction () {
    // await this.CategoryModel.create({
    //   label: '推荐',
    //   name: 'recommend',
    //   icon: '',
    //   desc: ''
    // });
    // await this.CategoryModel.create({
    //   label: '通用',
    //   name: 'common',
    //   icon: '',
    //   desc: ''
    // });
    // await this.CategoryModel.create({
    //   label: '开发',
    //   name: 'develop',
    //   icon: '',
    //   desc: ''
    // });
    // await this.CategoryModel.create({
    //   label: '娱乐',
    //   name: 'media',
    //   icon: '',
    //   desc: ''
    // });
    // await this.CategoryModel.create({
    //   label: '其他',
    //   name: 'others',
    //   icon: '',
    //   desc: ''
    // });
    return this.json({
      status: 200
    })
  }

  async createAction () {
    // if (!this.isPost()) {
    //   return this.json({ status: 405, message: '请求方法不正确', data: {} });
    // }
    // let params = await this.post();
    let params = this.get();
    if (!params.label) {
      return this.json({
        status: 1001,
        message: '分类名称不能为空',
        data: null
      })
    }
    if (!params.name) {
      return this.json({
        status: 1001,
        message: '分类name不能为空',
        data: null
      })
    }
    let queryResponse = await this.CategoryModel.find({
      where: {
        [this.Op.or]: [{ name: params.name }, { label: params.label }]
      }
    })
    if (queryResponse) {
      // 已存在
      return this.json({
        status: 1001,
        message: '分类已存在',
        data: null
      })
    } else {
      let createResponse = await this.CategoryModel.create({
        label: params.label,
        name: params.name,
        icon: params.icon || '',
        desc: params.desc || ''
      })
      return this.json({
        status: 200,
        message: '成功',
        data: createResponse
      })
    }
  }

  async listAction () {
    let categoryList = await this.CategoryModel.findAll();
    return this.json({
      status: 200,
      message: '成功',
      data: {
        list: categoryList || []
      }
    })
  }

}

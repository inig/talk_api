const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.EnkelBannerModel = this.models('enkel/banner');
    this.EnkelBannerEditorModel = this.models('enkel/bannerEditor');

    this.EnkelBannerEditorModel.belongsTo(this.EnkelBannerModel, {
      foreignKey: 'materialId',
      targetKey: 'uuid'
    })

    this.Op = this.Sequelize.Op;

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async indexAction () {
    return this.json({
      status: 200, message: '成功', data: []
    })
  }

  async listAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    let _searchConditions = JSON.parse(JSON.stringify(params));
    if (_searchConditions.pageIndex) {
      delete _searchConditions.pageIndex
    }
    if (_searchConditions.pageSize) {
      delete _searchConditions.pageSize
    }
    if (_searchConditions.offsetCount) {
      delete _searchConditions.offsetCount
    }
    let pageIndex = Number(params.pageIndex) || 1;
    let pageSize = Number(params.pageSize) || 30;
    let offsetCount = Number(params.offsetCount) || 0;
    try {
      let res = await this.EnkelBannerEditorModel.findAll({
        where: _searchConditions,
        limit: pageSize,
        offset: (pageIndex - 1) * pageSize + offsetCount,
        attributes: {
          exclude: ['id']
        },
        include: [{
          model: this.EnkelBannerModel,
          // as: 'user2',
          attributes: {
            exclude: ['id']
          }
        }],
        order: [
          ['updateTime', 'DESC']
        ]
      });
      if (res) {
        let _countAll = await this.EnkelBannerEditorModel.count({
          where: _searchConditions
        });
        return this.json({
          status: 200, message: '查询成功', data: {
            // list: res.map(item => {
            //   item.uuid = item.uuid.split('-').pop()
            //   return item
            // }) || [],
            list: res || [],
            count: res.length,
            pageIndex: pageIndex,
            pageSize: pageSize,
            totalCounts: _countAll,
            total: Math.ceil((_countAll - offsetCount) / pageSize)
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
    } catch (error) {
      return this.json({ status: 403, message: '查询失败，请稍后再试', data: {} });
    }
  }

  async addAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    console.log('params: ', params)
    // let params = this.get();
    try {
      let _requestData = {
        materialId: params.materialId,
        postTime: +new Date(),
        updateTime: +new Date(),
        status: false
      }
      let createdData = await this.EnkelBannerEditorModel.create(_requestData);
      if (createdData) {
        let _createdData = JSON.parse(JSON.stringify(createdData))
        if (_createdData.hasOwnProperty('id')) {
          delete _createdData.id
        }
        // if (_createdData.hasOwnProperty('uuid')) {
        //   _createdData.uuid = _createdData.uuid.split('-').pop()
        // }
        let bannerData = await this.EnkelBannerModel.find({
          where: {
            uuid: params.materialId
          },
          attributes: { exclude: ['id'] }
        })
        _createdData['enkel_banner'] = bannerData
        return this.json({ status: 200, message: '成功', data: _createdData });
      } else {
        return this.json({ status: 1001, message: '失败', data: {} })
      }
    } catch (error) {
      console.log('error: ', error.message)
      return this.json({ status: 403, message: '新增失败，请稍后再试', data: {} });
    }
  }

  async modifyAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    if (!params.uuid || params.uuid === '') {
      return this.json({ status: 401, message: '缺少参数', data: {} });
    }
    try {
      let _requestData = {
        updateTime: +new Date()
      }
      if (params.status) {
        _requestData.status = params.status
      }
      let response = await this.EnkelBannerEditorModel.update(_requestData, {
        where: {
          uuid: {
            [this.Op.like]: '%' + params.uuid
          }
        },
        attributes: {
          exclude: ['id']
        }
      });
      if (response) {
        if (response.hasOwnProperty('id')) {
          delete response.id
        }
        // if (response.hasOwnProperty('uuid')) {
        //   response.uuid = response.uuid.split('-').pop()
        // }
        return this.json({ status: 200, message: '成功', data: response });
      } else {
        return this.json({ status: 1001, message: '失败', data: {} })
      }
    } catch (error) {
      return this.json({ status: 403, message: '修改失败，请稍后再试', data: {} });
    }
  }

  async delAction () {
    if (!this.isPost()) {
      return this.json({ status: 405, message: '请求方法不正确', data: {} });
    }
    let params = await this.post();
    // let params = this.get();
    if (!params.uuid || params.uuid === '') {
      return this.json({ status: 401, message: '缺少参数', data: {} });
    }
    let bannerData = await this.EnkelBannerEditorModel.findOne({
      uuid: {
        [this.Op.like]: '%' + params.uuid
      },
      attributes: {
        exclude: ['id']
      },
    })
    if (!bannerData) {
      return this.json({
        status: 200, message: '删除成功', data: {
          uuid: params.uuid
        }
      })
    } else {
      // if (bannerData.status) {
      //   return this.json({
      //     status: 1002,
      //     message: '删除失败，该banner正在被使用',
      //     data: {
      //       uuid: params.uuid
      //     }
      //   })
      // } else {

      // }
    }
    try {
      let response = await this.EnkelBannerEditorModel.destroy({
        where: {
          uuid: {
            [this.Op.like]: '%' + params.uuid
          }
        }
      });
      if (response > 0) {
        return this.json({ status: 200, message: '删除成功', data: response });
      } else {
        return this.json({ status: 1001, message: '删除失败', data: {} })
      }
    } catch (error) {
      return this.json({ status: 403, message: '删除失败，请稍后再试', data: {} });
    }
  }

}

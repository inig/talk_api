const axios = require('axios');
const qs = require('querystring');

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.EnkelEntranceModel = this.models('enkel/entrance');
    this.EnkelEntranceEditorModel = this.models('enkel/entranceEditor');
    this.EnkelEntranceEditorModel.belongsTo(this.EnkelEntranceModel, {
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
      let res = await this.EnkelEntranceModel.findAll({
        where: _searchConditions,
        limit: pageSize,
        offset: (pageIndex - 1) * pageSize + offsetCount,
        attributes: {
          exclude: ['id']
        },
        order: [
          ['updateTime', 'DESC']
        ]
      });
      if (res) {
        let _countAll = await this.EnkelEntranceModel.count({
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
    // let params = this.get();
    try {
      let _requestData = {
        title: params.title,
        cover: params.cover,
        type: params.type,
        postTime: +new Date(),
        updateTime: +new Date(),
        status: false
      }
      if (params.url) {
        _requestData.url = params.url;
      }
      if (params.search) {
        _requestData.search = params.search;
      }
      let createdData = await this.EnkelEntranceModel.create(_requestData);
      if (createdData) {
        let _createdData = JSON.parse(JSON.stringify(createdData))
        if (_createdData.hasOwnProperty('id')) {
          delete _createdData.id
        }
        // if (_createdData.hasOwnProperty('uuid')) {
        //   _createdData.uuid = _createdData.uuid.split('-').pop()
        // }
        return this.json({ status: 200, message: '成功', data: _createdData });
      } else {
        return this.json({ status: 1001, message: '失败', data: {} })
      }
    } catch (error) {
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
      if (params.title) {
        _requestData.title = params.title
      }
      if (params.cover) {
        _requestData.cover = params.cover
      }
      if (params.url) {
        _requestData.url = params.url
      }
      if (params.type) {
        _requestData.type = params.type
      }
      if (params.search) {
        _requestData.search = params.search
      }
      if (params.status) {
        _requestData.status = params.status
      }
      let response = await this.EnkelEntranceModel.update(_requestData, {
        where: {
          uuid: params.uuid
        },
        attributes: {
          exclude: ['id']
        }
      });
      if (response[0] > 0) {
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
    let response = await this.EnkelEntranceModel.findOne({
      where: {
        uuid: params.uuid
      },
      attributes: {
        exclude: ['id']
      },
    })
    if (!response) {
      return this.json({
        status: 200, message: '删除成功', data: {
          uuid: params.uuid
        }
      })
    } else {
      if (response.status) {
        return this.json({
          status: 1002,
          message: '删除失败，该Entrance正在被使用',
          data: {
            uuid: params.uuid
          }
        })
      } else {

      }
    }
    try {
      let response = await this.EnkelEntranceModel.destroy({
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

  async getListAction () {
    // if (!this.isPost()) {
    //   return this.json({ status: 405, message: '请求方法不正确', data: {} });
    // }
    try {
      let res = await this.EnkelEntranceEditorModel.findAll({
        where: {
          sort: {
            [this.Op.gt]: -1
          }
        },
        attributes: {
          exclude: ['id']
        },
        include: [{
          model: this.EnkelEntranceModel,
          // as: 'user2',
          attributes: {
            exclude: ['id']
          }
        }],
        order: [
          ['sort', 'ASC']
        ]
      });
      if (res) {
        return this.json({
          status: 200, message: '查询成功', data: {
            list: res.map(item => {
              return {
                cover: item.enkel_entrance.cover,
                type: item.enkel_entrance.type,
                url: item.enkel_entrance.url,
                title: item.enkel_entrance.title,
                search: item.enkel_entrance.search,
                sort: item.sort
              }
            }) || []
          }
        });
      } else {
        return this.json({
          status: 200, message: '查询成功', data: {
            list: []
          }
        });
      }
    } catch (error) {
      return this.json({ status: 403, message: '查询失败，请稍后再试', data: {} });
    }
  }

}

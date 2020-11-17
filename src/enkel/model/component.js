/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    desc: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    icon: {
      type: Sequelize.STRING,
      allowNull: false
    },
    path: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    name: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    url: { // 远程组件的地址，http://xxx/xx.vue
      type: Sequelize.STRING,
      defaultValue: ''
    },
    version: {
      type: Sequelize.STRING,
      defaultValue: '1.0.0'
    },
    auth: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    recommend: {
      type: Sequelize.INTEGER,
      defaultValue: 0 // 0: 普通；1: 推荐
    },
    windowOption: {
      type: Sequelize.TEXT,
      defaultValue: '{"width": 800, "height": 667}',
      get () {
        let out = { "width": 800, "height": 667 }
        try {
          out = JSON.parse(this.getDataValue('windowOption'))
        } catch (err) {
          out = { "width": 800, "height": 667 }
        }
        return out
      },
      set (val) {
        let insert = '{"width": 800, "height": 667}'
        if (typeof val !== 'string') {
          insert = JSON.stringify(val)
        } else {
          insert = val
        }
        this.setDataValue('windowOption', insert)
      }
    },
    postTime: {
      // 文章的发布时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    uuid: {
      // 文章的唯一id
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    updateTime: {
      // 文章的更新时间
      type: Sequelize.STRING,
      defaultValue: (+new Date())
    },
    status: {
      type: Sequelize.INTEGER, // -1：审核不通过，0: 审核中，1：审核通过
      defaultValue: 1
    }
  }
};

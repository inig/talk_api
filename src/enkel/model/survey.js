/**
 * Created by liangshan on 2017/11/27.
 * Chrome扩展用户管理
 */
const Sequelize = enkel.Sequelize
module.exports = {
  safe: true,
  fields: {
    uuid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    auth_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    auth_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    auth_avatar: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    name: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    desc: {
      type: Sequelize.TEXT,
      defaultValue: ''
    },
    target_type: {
      type: Sequelize.STRING,
      defaultValue: 'group'
    },
    target_name: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    target_id: {
      type: Sequelize.STRING,
      defaultValue: ''
    },
    question: {
      type: Sequelize.TEXT,
      // defaultValue: '[{"type":"RANDOM"}]',
      get () {
        let question = this.getDataValue('question')
        let out = {}
        try {
          out = JSON.parse(question)
        } catch (err) {
          out = question
        }
        return out
      },
      set (val) {
        let insert = '[{"type":"RANDOM"}]'
        if (typeof val !== 'string') {
          insert = JSON.stringify(val)
        } else {
          insert = val
        }
        this.setDataValue('question', insert)
      }
    },
    answer: {
      type: Sequelize.TEXT,
      // defaultValue: '[]',
      get () {
        let answer = this.getDataValue('answer')
        let out = {}
        try {
          out = JSON.parse(answer)
        } catch (err) {
          out = answer
        }
        return out
      },
      set (val) {
        let answer = this.getDataValue('answer')
        if (Object.prototype.toString.call(val) === '[object Array]') {
          this.setDataValue('answer', JSON.stringify(val))
        } else {
          let insert = {}
          if (typeof val !== 'string') {
            insert = val
          } else {
            insert = JSON.parse(val)
          }
          try {
            answer = JSON.parse(answer)
          } catch (err) {
            answer = []
          }
          answer.push(insert)
          this.setDataValue('answer', JSON.stringify(answer))
        }
      }
    }
  }
};

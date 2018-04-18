/**
 * Created by liangshan on 2017/11/27.
 */
const Sequelize = enkel.Sequelize
module.exports = {
    safe: true,
    fields: {
        aid: {
            // 文章id
            type: Sequelize.STRING,
            defaultValue: ''
        },
        content: {
            // 评论的内容
            type: Sequelize.TEXT,
            defaultValue: ''
        },
        uuid: {
            // 评论的唯一id
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        pid: {
            // 评论的父id，当前评论是对用户留言的评论
            type: Sequelize.STRING,
            defaultValue: ''
        },
        rid: {
            // 评论的根id
            type: Sequelize.STRING,
            defaultValue: ''
        },
        like: {
            // 评论的 点赞量，数据类型的字符串
            type: Sequelize.STRING,
            defaultValue: ''
        },
        postTime: {
            // 评论的时间
            type: Sequelize.STRING,
            defaultValue: (+new Date())
        },
        phonenum: {
            // 评论人的手机号
            type: Sequelize.STRING,
            defaultValue: ''
        },
        nickname: {
            // 评论人的昵称
            type: Sequelize.STRING,
            defaultValue: ''
        },
        headIcon: {
            // 评论人的头像
            type: Sequelize.STRING,
            defaultValue: ''
        }
    },
    relations: {}
};

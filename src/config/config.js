/***
 **                                                          _ooOoo_
 **                                                         o8888888o
 **                                                         88" . "88
 **                                                         (| -_- |)
 **                                                          O\ = /O
 **                                                      ____/`---'\____
 **                                                    .   ' \\| |// `.
 **                                                     / \\||| : |||// \
 **                                                   / _||||| -:- |||||- \
 **                                                     | | \\\ - /// | |
 **                                                   | \_| ''\---/'' | |
 **                                                    \ .-\__ `-` ___/-. /
 **                                                 ___`. .' /--.--\ `. . __
 **                                              ."" '< `.___\_<|>_/___.' >'"".
 **                                             | | : `- \`.;`\ _ /`;.`/ - ` : | |
 **                                               \ \ `-. \_ __\ /__ _/ .-` / /
 **                                       ======`-.____`-.___\_____/___.-`____.-'======
 **                                                          `=---='
 **
 **                                       .............................................
 **                                              佛祖保佑             永无BUG
 **                                      佛曰:
 **                                              写字楼里写字间，写字间里程序员；
 **                                              程序人员写程序，又拿程序换酒钱。
 **                                              酒醒只在网上坐，酒醉还来网下眠；
 **                                              酒醉酒醒日复日，网上网下年复年。
 **                                              但愿老死电脑间，不愿鞠躬老板前；
 **                                              奔驰宝马贵者趣，公交自行程序员。
 **                                              别人笑我忒疯癫，我笑自己命太贱；
 **                                              不见满街漂亮妹，哪个归得程序员？
 */
/**
 * Created by liangshan on 2017/11/14.
 */
module.exports = {
  app_port: 3000,
  default_group: 'Home',
  groups: ['Home', 'Zpm', 'Bd', 'wx'],
  default_static: ['Static', '.well-known'], // 静态资源目录
  db: {
    ban: false, // 是否使用数据库 Sequelize
    type: 'mysql', // 数据库类型，支持mysql, sqlite, postgres, mssql
    storage: '', // 仅限SQLite
      // host: '127.0.0.1', // 数据库地址
      // port: '3306', // 数据库端口
      // db_name: 'enkel', // 数据库名
      // username: 'root', // 用户名
      // password: 'root' // 密码
    host: '123.57.148.237', // 数据库地址
    port: '3306', // 数据库端口
    db_name: 'talkapi', // 数据库名
    username: 'talkapi', // 用户名
    password: 'ecaf557f-4f0d-491e-9dc1-f478ce2a0d91' // 密码
  },
  redis: {
    ban: false, // 是否使用redis
    host: '123.57.148.237', // redis地址
    port: '6379', // redis端口
    password: '*#redis*#' // redis密码
  },
  socket: {
    ban: false, // 是否开启websocket
    type: 'wss',
    port: '3010',
    userKey: 'phonenum', // 用户名
    namespace: '/sk',
    events: ['enkel-message']
  }
}
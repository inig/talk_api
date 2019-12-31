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
 * Created by liangshan on 2019/03/02.
 */

const cheerio = require('cheerio');
const axios = require('axios');
const qs = require('querystring');

// const puppeteer = require('puppeteer')

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  async indexAction () {
    return this.json({ status: 200, message: '成功' })
  }

  findIndex (zp, count, pages) {
    return new Promise(async (resolve) => {
      let ranking = await page.$eval('#container', el => {
        let results = Array.from($(el).find('.result'))
        // if (pages > 5) {
        //   return -1
        // }
        let outIndex = -1
        let _text = ''
        for (let i = 0; i < results.length; i++) {
          _text = results[i].querySelector('.f13').innerText
          if (zp.some(item => _text.indexOf(item) > -1)) {
            outIndex = i
            i = results.length
          }
        }
        if (outIndex === -1) {
          $(el).find('#page .n').click()
          let _i = findIndex(zp, results.length, pages + 1)
          if (_i === -1) {
            outIndex = -1
          } else {
            outIndex = count + _i
          }
        }
        return outIndex
      }, null, zp, pages)
      resolve(ranking)
    })
  }

  // async sAction () {
  //   const that = this
  //   let params = this.get()

  //   let kw = params.kw ? decodeURIComponent(params.kw) : '找工作'
  //   let maxPage = params.mp ? Number(params.mp) : 5
  //   let target = params.target ? decodeURIComponent(params.target).split(';') : ['智联', '.zhaopin.com']
  //   const browser = await puppeteer.launch()
  //   const page = await browser.newPage()
  //   await page.goto('https://www.baidu.com')

  //   await page.type('#kw', kw, { delay: 50 })

  //   await page.click('#su')
  //   await page.waitForSelector('#container')

  //   function sleep (ms) {
  //     return new Promise(resolve => setTimeout(resolve, ms))
  //   }
  //   async function findIndex (count, maxPages) {
  //     let _maxPages = maxPages + 1
  //     if (_maxPages > maxPage) {
  //       return count
  //     }
  //     let outIndex = count
  //     let _index = await page.$eval('#container', el => {
  //       // let zp = ['前程无忧', '.51job.com']
  //       let zp = ['百姓网', 'baixing.com']
  //       // let zp = ['智联', '.zhaopin.com']
  //       let results = Array.from($(el).find('.result'))
  //       let _text = ''
  //       let _i = -1
  //       for (let i = 0; i < results.length; i++) {
  //         _text = results[i].querySelector('.f13').innerText
  //         if (zp.some(item => _text.indexOf(item) > -1)) {
  //           _i = i
  //           i = results.length
  //         }
  //       }
  //       // return results[0].querySelector('.f13').innerText
  //       return _i + 1
  //     })

  //     // console.log('.....22......', _index)
  //     // console.log('>>>>> count2: ', count, _index)
  //     if (_index === 0) {

  //       let nextPage = 'https://www.baidu.com' + await page.$eval('#page  .n', el => el.getAttribute('href'))
  //       await page.goto(nextPage)
  //       await page.waitForSelector('#container')
  //       count += await page.$eval('#container', el => Array.from($(el).find('.result')).length)
  //       let _newIndex = await findIndex(count, _maxPages)
  //       outIndex = _newIndex
  //     } else {
  //       outIndex += _index
  //     }
  //     console.log('.... index: ', outIndex, 'page: ', _maxPages)
  //     return outIndex
  //   }

  //   let _index = findIndex(0, 0)

  //   // let outIndex = -1
  //   // let _text = ''
  //   // for (let i = 0; i < _results.length; i++) {
  //   //   _text = _results[i].querySelector('.f13').innerText
  //   //   if (zp.some(item => _text.indexOf(item) > -1)) {
  //   //     outIndex = i
  //   //     i = _results.length
  //   //   }
  //   // }
  //   // if (outIndex = -1) {
  //   //   $(el).find('#page .n')
  //   // }
  //   // await browser.close()
  //   return this.json(({
  //     status: 200,
  //     message: '搜索成功',
  //     data: {
  //       ranking: _index
  //     }
  //   }))
  //   let requestUrl = `https://www.baidu.com/s?wd=%E6%89%BE%E5%B7%A5%E4%BD%9C&rsv_spt=1&rsv_iqid=0xc6dbedae00094cb6&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&rqlang=cn&tn=baiduhome_pg&rsv_enter=1&oq=puppeteer&rsv_t=dd4fbijeDkUamxPGdTX1Gt2lGR1r5HbfzorKp0RiXuLkUPorDOMK33Y3l3GvEO4py03s&inputT=3284&rsv_pq=ebeebcab000c88f5&rsv_sug3=35&rsv_sug1=33&rsv_sug7=100&bs=puppeteer`
  //   if (params.ip) {
  //     requestUrl += '?ip=' + params.ip
  //   }
  //   return axios.get(requestUrl).catch(err => {
  //     return this.json({ status: 1002, message: '查询失败，请稍后再试', data: {} })
  //   }).then(({ data }) => {
  //     const $ = cheerio.load(data)
  //     return this.json({
  //       status: 200, message: '成功', data: {
  //         ip: $('#result').find('code').eq(0).text(),
  //         address: $('#result').find('code').eq(1).text(),
  //         geoIp: $('#result').html().replace(/(.*geoip:)([^<]*)(<\/p>.*)/i, '$2').trim()
  //       }
  //     })
  //   })
  // }
}
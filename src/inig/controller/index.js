const { exec, execSync } = require('child_process')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// const DIR = '/Users/liangshan/Downloads/workspace/tmp';
const DIR = '/mnt/srv/web_static/images/tmp';

// const DOMAIN = 'http://10.2.5.98'
const DOMAIN = 'http://static.dei2.com/images/tmp'

function S4 () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
function getUUID (prefix) {
  return (prefix ? prefix : '') + (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

module.exports = class extends enkel.controller.base {
  init (http) {
    super.init(http);

    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Access-Control-Allow-Headers', '*');
    this.response.setHeader('Access-Control-Allow-Methods', '*');
  }

  getFileName (src) {
    let s = src.split('/').pop()
    return s.substring(0, s.lastIndexOf('.'))
  }

  uploadTmpFile (args) {
    return new Promise(async (resolve) => {
      try {
        let uploadedFile = await this.upload({
          accept: args.accept,
          size: Number(args.ms) * 1024,
          uploadDir: args.uploadDir,
          rename: args.rn || false,
          multiples: false
        });
        resolve(`${DOMAIN}/${args.subDir}/${uploadedFile.filename}`);
      } catch (err) {
        resolve('');
      }
    })
  }

  checkImagePath () {
    let d = new Date()
    let p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    fs.readdir(DIR, (err, files) => {
      if (err) {
        return
      }
      files.forEach((filename, index) => {
        if (filename !== p) {
          let pathname = path.join(DIR, filename)
          let fsStat = fs.statSync(pathname)
          if (fsStat.isFile()) {
            fs.unlinkSync(pathname)
          } else if (fsStat.isDirectory()) {
            pathname && (pathname.indexOf(DIR) === 0) && execSync('rm -rf ' + pathname)
          }
        }
      })
    })
    if (!fs.existsSync(DIR + '/' + p)) {
      fs.mkdirSync(DIR + '/' + p)
    }
    return p
  }

  async doConvert2Action () {
    let params = this.get()
    let filename = getUUID('INIG-')
    let p = this.checkImagePath()
    try {
      let uploadedFile = await this.upload({
        accept: params.accept || "png;jpeg;jpg;ico;gif;bmp;pbm;pgm;ppm;tif;tiff;ras;rgb;xwd;xbm",
        size: 200 * 1024 * 1024,
        uploadDir: DIR + '/' + p,
        rename: true,
        multiples: false
      });
      let cmdStr = `ffmpeg -i '${DIR + '/' + p + '/' + uploadedFile.filename}' `
      if (params.width != 0 && params.height != 0) {
        cmdStr += `-s ${params.width}x${params.height} `
      }
      cmdStr += `-pix_fmt bgr24 -y ${DIR}/${p}/${filename}.${params.imageType}`
      try {
        execSync(cmdStr)
        exec(`rm -rf ${DIR + '/' + p + '/' + uploadedFile.filename}`)
        return this.json({
          status: 200,
          message: '成功',
          data: {
            path: `${DOMAIN}/${p}/${filename}.${params.imageType}`
          }
        })
      } catch (err) {
        return this.json({
          status: 1001,
          message: '失败',
          data: null
        })
      }
    } catch (err) {
      return this.json({
        status: 1001,
        message: err.message || '失败',
        data: null
      })
    }
  }

  async doConvertAction () {
    const that = this
    let params = this.get()

    let p = this.checkImagePath()

    const request = params.path.indexOf('https') == 0 ? https : http

    let filename = getUUID('INIG-') // this.getFileName(params.path)

    var req = request.get(params.path, function (res) {
      var imgData = "";
      res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
      res.on("data", function (chunk) {
        imgData += chunk;
      });
      res.on("end", function () {
        fs.writeFile(DIR + '/' + p + '/tmp-' + filename, imgData, "binary", function (err) {
          if (err) {
            return that.json({
              status: 1001,
              message: err.message || '失败',
              data: null
            })
          }
          let cmdStr = `ffmpeg -i '${DIR + '/' + p + '/tmp-' + filename}' `
          if (params.width != 0 && params.height != 0) {
            cmdStr += `-s ${params.width}x${params.height} `
          }
          cmdStr += `-pix_fmt bgr24 -y ${DIR}/${p}/${filename}.${params.imageType}`
          try {
            execSync(cmdStr)
            exec(`rm -rf ${DIR + '/' + p + '/tmp-' + filename}`)
            return that.json({
              status: 200,
              message: '成功',
              data: {
                path: `${DOMAIN}/${p}/${filename}.${params.imageType}`
              }
            })
          } catch (err) {
            return that.json({
              status: 1001,
              message: '失败',
              data: null
            })
          }
        });
      });
      res.on("error", function (err) {
        return that.json({
          status: 1001,
          message: err.message || '失败',
          data: null
        })
      });
    });
    req.on('error', function (err) {
      return that.json({
        status: 1001,
        message: err.message || '失败',
        data: null
      })
    });

    // let cmdStr = `ffmpeg -i '${params.path}' `
    // if (params.width != 0 && params.height != 0) {
    //   cmdStr += `-s ${params.width}x${params.height} `
    // }
    // cmdStr += `-pix_fmt bgr24 -y ${DIR}/${filename}.${params.imageType}`
    // try {
    //   execSync(cmdStr)
    //   return this.json({
    //     status: 200,
    //     message: '成功',
    //     data: {
    //       path: `${DOMAIN}/${filename}.${params.imageType}`
    //     }
    //   })
    // } catch (err) {
    //   return this.json({
    //     status: 1001,
    //     message: '失败',
    //     data: null
    //   })
    // }
  }

  async indexAction () {
    // let tmpDir = '/mnt/srv/web_static/extensions/avatar';
    let params = this.get()
    let uploadFile = this.uploadTmpFile(params)
    return this.json({
      status: 200,
      message: '成功',
      path: uploadFile
    })
    let res = execSync(`ffmpeg`)

    console.log(res)

    return this.json({
      status: 200,
      message: '成功',
      data: {}
    })
  }
}
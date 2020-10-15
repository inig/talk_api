const { exec, execSync } = require('child_process')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const ffmpeg = require('fluent-ffmpeg')

// const DIR = '/Users/liangshan/Downloads/workspace/tmp'
const DIR = '/mnt/srv/web_static/images/tmp';

// const DOMAIN = 'http://127.0.0.1'
// const DOMAIN = 'http://10.2.5.98'
const DOMAIN = 'http://static.dei2.com/images/tmp'

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

    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Access-Control-Allow-Headers', '*')
    this.response.setHeader('Access-Control-Allow-Methods', '*')
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
          multiples: false,
        })
        resolve(`${DOMAIN}/${args.subDir}/${uploadedFile.filename}`)
      } catch (err) {
        resolve('')
      }
    })
  }

  checkImagePath () {
    let d = new Date()
    let p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(d.getDate()).padStart(2, '0')}`
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
            pathname &&
              pathname.indexOf(DIR) === 0 &&
              execSync('rm -rf ' + pathname)
          }
        }
      })
    })
    if (!fs.existsSync(DIR + '/' + p)) {
      fs.mkdirSync(DIR + '/' + p)
    }
    return p
  }

  async getAudioInfoAction () {
    let params = this.get()
    let p = this.checkImagePath()

    let command = ffmpeg(params.path)
    command.ffprobe((err, metadata) => {
      if (err) {
        return this.json({
          message: err.message,
          status: 1001,
        })
      }
      var images = metadata.streams.filter(function (stream) {
        return stream.disposition.attached_pic
      })

      let filename = getUUID('INIG-img-')
      if (images.length > 0) {
        command
          .outputOptions(['-c copy', `-map 0:${images[0].index}`])
          .save(`${DIR}/${p}/${filename}.jpg`, (err, res) => {
            if (err) {
              return this.json({
                status: 1002,
              })
            }
          })
      }

      return this.json({
        status: 200,
        message: '成功',
        data: Object.assign({}, metadata, {
          cover: images.length > 0 ? `${DOMAIN}/${p}/${filename}.jpg` : '',
        }),
      })
    })
  }

  async getAudioInfoFromLocalAction () {
    let params = this.get()
    let filename = getUUID('INIG-img-')
    let p = this.checkImagePath()
    try {
      let uploadedFile = await this.upload({
        accept:
          params.accept ||
          'mp3;wav;flac;ogg;aac;m4a;wma;mka;au;aiff;opus;ra;amr',
        size: 200 * 1024 * 1024,
        uploadDir: DIR + '/' + p,
        rename: true,
        multiples: false,
      })

      let command = ffmpeg(`${DIR + '/' + p + '/' + uploadedFile.filename}`)
      command.ffprobe((err, metadata) => {
        if (err) {
          return this.json({
            message: err.message,
            status: 1001,
          })
        }
        var images = metadata.streams.filter(function (stream) {
          return stream.disposition.attached_pic
        })
        console.log(uploadedFile)
        if (images.length > 0) {
          command
            .outputOptions(['-c copy', `-map 0:${images[0].index}`])
            .saveToFile(`${DIR}/${p}/${filename}.jpg`)
            .on('error', (err) => {
              return this.json({
                status: 1002,
                message: err.message || '失败',
                data: null,
              })
            })
            .on('end', () => {
              return this.json({
                status: 200,
                message: '成功',
                data: Object.assign({}, metadata, {
                  audio: `${DOMAIN}/${p}/${uploadedFile.filename}`,
                  cover:
                    images.length > 0 ? `${DOMAIN}/${p}/${filename}.jpg` : '',
                }),
              })
            })
        } else {
          return this.json({
            status: 200,
            message: '成功',
            data: Object.assign({}, metadata, {
              audio: `${DOMAIN}/${p}/${uploadedFile.filename}`,
              cover: images.length > 0 ? `${DOMAIN}/${p}/${filename}.jpg` : '',
            }),
          })
        }
      })
    } catch (err) {
      return this.json({
        status: 1001,
        message: err.message || '失败',
        data: null,
      })
    }
  }

}

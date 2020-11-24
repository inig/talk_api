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

  async doConvert2Action () {
    let params = this.get()
    let filename = getUUID('INIG-')
    let p = this.checkImagePath()
    try {
      let uploadedFile = await this.upload({
        accept:
          params.accept ||
          'png;jpeg;jpg;ico;gif;bmp;pbm;pgm;ppm;tif;tiff;ras;rgb;xwd;xbm',
        size: 200 * 1024 * 1024,
        uploadDir: DIR + '/' + p,
        rename: true,
        multiples: false,
      })
      let cmdStr = `ffmpeg -i '${DIR + '/' + p + '/' + uploadedFile.filename}' `
      if (params.width != 0 && params.height != 0) {
        cmdStr += `-s ${params.width}x${params.height} `
      }
      cmdStr += `-pix_fmt rgb24 -y ${DIR}/${p}/${filename}.${params.imageType}`
      try {
        execSync(cmdStr)
        exec(`rm -rf ${DIR + '/' + p + '/' + uploadedFile.filename}`)
        return this.json({
          status: 200,
          message: '成功',
          data: {
            path: `${DOMAIN}/${p}/${filename}.${params.imageType}`,
          },
        })
      } catch (err) {
        return this.json({
          status: 1001,
          message: '失败',
          data: null,
        })
      }
    } catch (err) {
      return this.json({
        status: 1001,
        message: err.message || '失败',
        data: null,
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
      var imgData = ''
      res.setEncoding('binary') //一定要设置response的编码为binary否则会下载下来的图片打不开
      res.on('data', function (chunk) {
        imgData += chunk
      })
      res.on('end', function () {
        fs.writeFile(
          DIR + '/' + p + '/tmp-' + filename,
          imgData,
          'binary',
          function (err) {
            if (err) {
              return that.json({
                status: 1001,
                message: err.message || '失败',
                data: null,
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
                  path: `${DOMAIN}/${p}/${filename}.${params.imageType}`,
                },
              })
            } catch (err) {
              return that.json({
                status: 1001,
                message: '失败',
                data: null,
              })
            }
          }
        )
      })
      res.on('error', function (err) {
        return that.json({
          status: 1001,
          message: err.message || '失败',
          data: null,
        })
      })
    })
    req.on('error', function (err) {
      return that.json({
        status: 1001,
        message: err.message || '失败',
        data: null,
      })
    })
  }

  async indexAction () {
    let params = this.get()
    let uploadFile = this.uploadTmpFile(params)
    return this.json({
      status: 200,
      message: '成功666',
      path: uploadFile,
    })
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

  async setAudioInfoAction () { }

  /**
   * 音频添加封面，标题等metadata
   */
  async setAudioInfo2Action () {
    let params = this.get()
    let filename = getUUID('INIG-img-')
    let p = this.checkImagePath()
    try {
      // let uploadedFile = await this.upload({
      //   accept: params.accept || "mp3;wav;flac;ogg;aac;m4a;wma;mka;au;aiff;opus;ra;amr",
      //   size: 200 * 1024 * 1024,
      //   uploadDir: DIR + '/' + p,
      //   rename: true,
      //   multiples: false
      // });

      let command = ffmpeg()
        .addInput(`/Users/liangshan/Downloads/01.flac`)
        .addInput('/Users/liangshan/Downloads/1.jpeg')
        .outputOptions([
          '-map 0:0',
          '-map 1:0',
          '-c copy',
          '-id3v2_version 3',
          '-metadata:s:v title="Album Cover"',
          '-metadata:s:v comment="Cover (front)"',
        ])
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
            data: {
              path: `${DOMAIN}/${p}/${uploadedFile.filename}`,
            },
          })
        })
    } catch (err) {
      return this.json({
        status: 1001,
        message: err.message || '失败',
        data: null,
      })
    }
  }

  _durationFormat (duration) {
    let d = parseInt(Number(duration))
    let h = String(parseInt(d / (60 * 60)))
    let m = String(parseInt((d % (60 * 60)) / 60)).padStart(2, '0')
    let s = String(parseInt(d % 60)).padStart(2, '0')
    return (h > 0 ? h.padStart(2, '0') + ':' : '') + m + ':' + s
  }

  async convertAudioAction () { }

  /**
   * 音频添加封面，标题等metadata
   */
  async convertAudio2Action () {
    let params = this.get()
    let filename = getUUID('INIG-audio-')
    let p = this.checkImagePath()
    try {
      let uploadedFile = await this.upload({
        accept:
          params.accept || 'mp3;wav;flac;ogg;aac;m4a;wma;mka;au;aiff;opus;amr',
        size: 200 * 1024 * 1024,
        uploadDir: DIR + '/' + p,
        rename: true,
        multiples: false,
      })
      console.log(params)
      // let command = ffmpeg(params.path)
      let command = ffmpeg(`${DIR + '/' + p + '/' + uploadedFile.filename}`)
      let outOptions = []
      if (params.sampleRate && params.sampleRate != '-1') {
        outOptions.push('-ar ' + params.sampleRate)
      }
      if (params.bitRate && params.bitRate != '-1') {
        outOptions.push('-ab ' + params.bitRate)
      }
      if (params.channels && params.channels != '-1') {
        outOptions.push('-ac ' + params.channels)
      }
      if (params.volume && params.volume != '0') {
        outOptions.push(`-filter:a volume=${params.volume}dB`)
      }
      let cut = params.cut ? params.cut.split(',') : []
      if (cut && cut.length == 2) {
        // outOptions.push('-c:a copy')
        outOptions.push('-ss ' + this._durationFormat(cut[0]))
        outOptions.push(
          '-t ' + this._durationFormat(Number(cut[1]) - Number(cut[0]))
        )
      }
      console.log(outOptions)
      command
        .outputOptions(outOptions)
        .saveToFile(`${DIR}/${p}/${filename}.${params.audioType}`)
        .on('error', (err) => {
          return this.json({
            status: 1002,
            message: err.message || '失败',
            data: null,
          })
        })
        .on('end', () => {
          let cmd = ffmpeg(`${DIR}/${p}/${filename}.${params.audioType}`)
          cmd.ffprobe((err, metadata) => {
            if (err) {
              return this.json({
                status: 200,
                message: '成功',
                data: {
                  path: `${DOMAIN}/${p}/${filename}.${params.audioType}`,
                },
              })
            }
            var images = metadata.streams.filter(function (stream) {
              return stream.disposition.attached_pic
            })
            if (images.length > 0) {
              cmd
                .outputOptions(['-c copy', `-map 0:${images[0].index}`])
                .saveToFile(`${DIR}/${p}/${filename}.jpg`)
                .on('error', (e) => {
                  return this.json({
                    status: 1002,
                    message: e.message || '失败',
                    data: null,
                  })
                })
                .on('end', () => {
                  return this.json({
                    status: 200,
                    message: '成功',
                    data: Object.assign({}, metadata, {
                      path: `${DOMAIN}/${p}/${filename}.${params.audioType}`,
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
                  path: `${DOMAIN}/${p}/${uploadedFile.filename}`,
                  cover: images.length > 0 ? `${DOMAIN}/${p}/${filename}.jpg` : '',
                }),
              })
            }
          })
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

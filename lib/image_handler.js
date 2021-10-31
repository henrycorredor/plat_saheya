const mv = require('mv')
const path = require('path')
const jimp = require('jimp')
const fs = require('fs')
const { nanoid } = require('nanoid')

module.exports = function (file, destinationPath) {
    const id = nanoid()
    const tempPath = path.join(__dirname, "../images/receiver", id + 'small.jpg')
    return new Promise((resolve, reject) => {
        if (!file) reject('No valid file')
        const actualPath = path.join(__dirname, '..', file.path)
        jimp.read(actualPath)
            .then(image => {
                return image.scaleToFit(800, 800).quality(70).write(tempPath, () => {
                    fs.unlink(actualPath, err => {
                        if (err) {
                            reject(err)
                        } else {
                            mv(tempPath, path.join(destinationPath, id + '.jpg'), { mkdirp: true }, (e) => {
                                if (e) {
                                    reject(e)
                                } else {
                                    resolve(id + '.jpg')
                                }
                            })
                        }
                    })
                })
            })
            .catch(e => {
                reject(e)
            })
    })
}
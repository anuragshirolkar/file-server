const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const utils = require('./utils')

// set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})

const upload = multer({
    storage: storage
}).array('inp-files', 20)

const app = express()

app.use('/static', express.static('static'))

const port = 3000
app.listen(port, () => console.log(`server started on port ${port}`))

app.get('*', async (req, res) => {
    let path = req.params[0]
    let childrenPaths = await fs.readdir('.' + path)
    let children = await Promise.all(childrenPaths.map(child =>
        fs.lstat('.' + path + "/" + child)
            .then(stat => ({
                name: child,
                isDir: stat.isDirectory(),
                size: utils.beautifySize(stat.size)
            }))))
    
    console.log(children)

    res.sendFile('views/index.html', { root: __dirname })
})

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            console.log(req.file)
            res.send('test')
        }
    })
})
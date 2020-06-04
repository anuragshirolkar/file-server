const express = require('express')
const multer = require('multer')
const ejs = require('ejs')
const path = require('path')
const { createBrotliCompress } = require('zlib')

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

app.use(express.static('./public'))

const port = 3000
app.listen(port, () => console.log(`server started on port ${port}`))

app.get('/', (req, res) => res.sendFile('views/upload.html', {root: __dirname }))

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
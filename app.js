const express = require('express')
const multer = require('multer')
const path = require('path')
const ejs = require('ejs')
const fs = require('fs').promises
const utils = require('./utils')
const bodyParser = require('body-parser')
const pathUtil = require('path')
const cookieParser = require("cookie-parser")

const PASSWORD = 'passwd'

fs.mkdir('public')
    .then(v => fs.mkdir('public/uploads'))
    .catch(err => console.log(err))

// set storage engine
const storage = path => multer.diskStorage({
    destination: 'public/uploads' + path,
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})

const upload = path => multer({
    storage: storage(path)
}).array('files', 20)

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(cookieParser())

app.use('/static', express.static('static'))
app.use('/', express.static('public/uploads'))

const port = 3000
app.listen(port, () => console.log(`server started on port ${port}`))


app.get('/authenticate', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)
    res.sendStatus(200)
})

app.get('*', async (req, res) => {
    let path = req.params[0]
    let relPath = 'public/uploads' + path
    let childrenPaths = await fs.readdir(relPath)
    let files = await Promise.all(childrenPaths.map(child =>
        fs.lstat(relPath + '/' + child)
            .then(stat => ({
                name: child,
                isDir: stat.isDirectory(),
                size: utils.beautifySize(stat.size)
            }))))
    

    res.render('index', {
        parent: path == '/' ? undefined : pathUtil.join(path, '..'),
        files: files,
        path: path
    })
})

function authenticate(req) {
    if (!req.cookies.password) return false
    return req.cookies.password == PASSWORD
}

app.put('*', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    let path = req.params[0]
    upload(path)(req, res, err => {
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            console.log(req.file)
            res.sendStatus(200)
        }
    })
})

app.delete('*', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    let path = 'public/uploads' + req.params[0]
    console.log('deleting file: ' + path)
    fs.lstat(path)
        .then(stat => {
            if (stat.isDirectory()) {
                return fs.rmdir(path)
            }
            return fs.unlink(path)
        })
        .then(v => res.sendStatus(200))
})

app.post('/mkdir', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    console.log(req.cookies)
    let path = 'public/uploads' + req.body.path + req.body.dirname
    console.log(path)
    fs.mkdir(path)
        .then(result => res.sendStatus(200))
})

const express = require('express')
const multer = require('multer')
const ejs = require('ejs')
const fs = require('fs').promises
const utils = require('./utils')
const bodyParser = require('body-parser')
const pathUtil = require('path')
const cookieParser = require("cookie-parser")
const crypto = require('crypto')

let PASSWORD_HASH
fs.readFile('password.txt')
    .then(buffer => PASSWORD_HASH = buffer.toString())
    .catch(err => PASSWORD_HASH = hash(''))

function hash(str) {
    return crypto.createHmac('sha1', '')
        .update(str)
        .digest('hex')
}


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
    let childrenPaths = await fs.readdir(relPath).catch(() => res.sendStatus(404))
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
    if (hash('') == PASSWORD_HASH) return true
    if (!req.cookies.password) return false
    return hash(req.cookies.password) == PASSWORD_HASH
}

app.put('*', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    let path = req.params[0]
    upload(path)(req, res, err => {
        if (err) {
            res.send(err)
        } else {
            res.sendStatus(200)
        }
    })
})

async function recursiveRemove(path) {
    let stat = await fs.lstat(path)
    if (!stat.isDirectory()) {
        return fs.unlink(path)
    }
    let children = await fs.readdir(path)
    await Promise.all(
        children.map(child => recursiveRemove(pathUtil.join(path, child))))
    fs.rmdir(path)
}

app.delete('*', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    let path = 'public/uploads' + req.params[0]
    recursiveRemove(path)
        .then(() => res.sendStatus(200))
})

app.post('/mkdir', (req, res) => {
    if (!authenticate(req)) return res.sendStatus(401)

    let path = 'public/uploads' + req.body.path + req.body.dirname
    fs.mkdir(path)
        .then(result => res.sendStatus(200))
        .catch(reason => {
            if (reason.code == 'EEXIST') return res.sendStatus(200)
            return res.sendStatus(500)
        })
})



const uploadForm = document.getElementById('upload-form')
const inpFile = document.getElementById('inp-file')
const progressBarFill = document.querySelector('#progress-bar > .progress-bar-fill')
const progressBarText = progressBarFill.querySelector('.progress-bar-text')

uploadForm.addEventListener('submit', uploadFile)

function uploadFile(e) {
    e.preventDefault()

    const xhr = new XMLHttpRequest()

    xhr.open('POST', '/upload')
    xhr.upload.addEventListener('progress', e => {
        console.log(e)
    })

    xhr.setRequestHeader('Content-Type', 'multipart/form-data')
    xhr.send(new FormData(uploadForm))
}

const uploadForm = document.getElementById('upload-form')
const inpFile = document.getElementById('inp-files')
const progressBarFill = document.querySelector('#progress-bar > .progress-bar-fill')
const progressBarText = progressBarFill.querySelector('.progress-bar-text')

uploadForm.addEventListener('submit', uploadFile)

function uploadFile(e) {
    e.preventDefault()

    const xhr = new XMLHttpRequest()

    xhr.open('POST', '/upload')
    xhr.upload.addEventListener('progress', e => {
      const percentage = e.lengthComputable ? (e.loaded / e.total) * 100 : 0
      progressBarFill.style.width = percentage.toFixed(2) + "%"
      progressBarText.textContent = percentage.toFixed(2) + "%"
        console.log(e)
    })

    xhr.send(new FormData(uploadForm))
}
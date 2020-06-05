
const uploadForm = document.getElementById('upload-form')
const inpFile = document.getElementById('inp-files')
const progressBar = document.querySelector("#progress-bar")
const progressBarFill = document.querySelector('#progress-bar-fill')
const progressBarText = document.querySelector('#progress-bar-text')
const uploadSuccessAlert = document.querySelector('#upload-success-alert')
const deleteSuccessAlert = document.querySelector('#delete-success-alert')
const mkdirSuccessAlert = document.querySelector('#mkdir-success-alert')

uploadForm.addEventListener('submit', uploadFile)

function uploadFile(e) {
    e.preventDefault()

    console.log(e)

    const xhr = new XMLHttpRequest()

    progressBar.style.display = 'block'

    xhr.open('PUT', path)
    xhr.upload.addEventListener('progress', e => {
      const percentage = e.lengthComputable ? (e.loaded / e.total) * 100 : 0
      progressBarFill.style.width = percentage.toFixed(2) + "%"
      progressBarText.textContent = percentage.toFixed(2) + "%"
    })

    xhr.upload.addEventListener('load', e => {
      progressBar.style.display = 'none'
      uploadSuccessAlert.style.display = 'block'
    })

    xhr.send(new FormData(uploadForm))
}

const mkdirForm = document.getElementById('mkdir-form')

mkdirForm.addEventListener('submit', mkdir)

function mkdir(e) {
  console.log('called mkdir '+ new FormData(mkdirForm).entries().next().value)
  e.preventDefault()
  fetch('/mkdir', {
    method: 'POST',
    body: new URLSearchParams([...new FormData(mkdirForm).entries()]),
  }).then(res => {
    console.log(res)
    mkdirSuccessAlert.style.display = 'block'
  })
}

function deleteFile(filePath) {
  console.log('deleting file: ' + filePath)
  fetch(filePath, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    console.log(res)
    deleteSuccessAlert.style.display = 'block'
  })
}
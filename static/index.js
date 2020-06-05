
const uploadForm = document.getElementById('upload-form')
const inpFile = document.getElementById('inp-files')
const progress = document.querySelector("#progress")
const progressBar = document.querySelector('#progress-bar')
const successAlert = document.querySelector('#success-alert')

uploadForm.addEventListener('submit', uploadFile)

function uploadFile(e) {
    e.preventDefault()

    console.log(e)

    const xhr = new XMLHttpRequest()

    progress.style.visibility = 'visible'

    xhr.open('PUT', path)
    xhr.upload.addEventListener('progress', e => {
      const percentage = e.lengthComputable ? (e.loaded / e.total) * 100 : 0
      progressBar.style.width = percentage.toFixed(2) + "%"
      progressBar.setAttribute('aria-valuenow', percentage.toFixed(2))
      progressBar.innerHTML = percentage.toFixed(2) + '%'
    })

    xhr.upload.addEventListener('load', e => {
      progress.style.visibility = 'hidden'
      successAlert.style.visibility = 'visible'
    })

    xhr.send(new FormData(uploadForm))
}

function deleteFile(filePath) {
  console.log('deleting file: ' + filePath)
  fetch(filePath, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => console.log(res))
}
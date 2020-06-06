
const uploadForm = document.getElementById('upload-form')
const inpFile = document.getElementById('inp-files')
const progressBar = document.querySelector("#progress-bar")
const progressBarFill = document.querySelector('#progress-bar-fill')
const progressBarText = document.querySelector('#progress-bar-text')
const uploadSuccessAlert = document.querySelector('#upload-success-alert')
const deleteSuccessAlert = document.querySelector('#delete-success-alert')
const mkdirSuccessAlert = document.querySelector('#mkdir-success-alert')

uploadForm.addEventListener('submit', uploadFile)

async function uploadFile(e) {
  e.preventDefault()

  // Simple get request to /authenticate before starting the upload.
  const authResponse = await fetch('/authenticate')
  if (authResponse.status == 401) return showAuthFailureMessage()
  else if (!authResponse.ok) return showGenericErrorMessage()

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
  console.log('called mkdir ' + new FormData(mkdirForm).entries().next().value)
  e.preventDefault()
  fetch('/mkdir', {
    method: 'POST',
    body: new URLSearchParams([...new FormData(mkdirForm).entries()]),
  }).then(res => {
    if (res.ok) mkdirSuccessAlert.style.display = 'block'
    else if (res.status == 401) showAuthFailureMessage()
    else showGenericErrorMessage()
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
    if (res.ok) deleteSuccessAlert.style.display = 'block'
    else if (res.status == 401) showAuthFailureMessage()
    else showGenericErrorMessage()
  })
}

function getPassword() {
  return document.cookie
    .split(';')
    .map(cookie => cookie.split('='))
    .reduce((accumulator, [key, value]) => ({ ...accumulator, [key.trim()]: decodeURIComponent(value) }), {})
    .password
}

function setPassword(password) {
  document.cookie = `password=${password}`
}

function updatePassword() {
  const password = document.getElementById('password')
  if (password.value == '') {
    showError("Can't set empty password")
    return 
  }
  setPassword(password.value)
  password.value = ''
  showSuccess('Password updated!')
}

function resetPassword() {
  setPassword('')
}

function showAlert(id) {
  const alert = document.getElementById(id)
  let timeoutHandle;
  function go(str) {
    console.log(alert)
    alert.innerText = str
    alert.style.display = 'block'
    if (timeoutHandle) clearTimeout(timeoutHandle)
    timeoutHandle = setTimeout(() => alert.style.display = 'none', 5000)
  }
  return go
}

const showError = showAlert('error-alert')
const showSuccess = showAlert('success-alert')

function showAuthFailureMessage() {
  showError('Authentication failed. Set the right password.')
}

function showGenericErrorMessage() {
  showError('Something went wrong.')
}
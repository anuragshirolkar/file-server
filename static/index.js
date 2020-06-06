const uploadForm = document.getElementById('upload-form')
uploadForm.addEventListener('submit', uploadFile)

async function uploadFile(e) {
  e.preventDefault()

  // Simple get request to /authenticate before starting the upload.
  const authResponse = await fetch('/authenticate')
  if (authResponse.status == 401) return showAuthFailureMessage()
  else if (!authResponse.ok) return showGenericErrorMessage()

  const xhr = new XMLHttpRequest()

  showProgress(0)

  xhr.open('PUT', path)
  xhr.upload.addEventListener('progress', e => {
    const percentage = e.lengthComputable ? (e.loaded / e.total) * 100 : 0
    showProgress(percentage)
  })

  xhr.upload.addEventListener('load', e => {
    hideProgressBar()
    showAlertById('upload-success-alert')
  })

  xhr.send(new FormData(uploadForm))
}

function showProgress(percentage) {
  const progressBar = document.querySelector("#progress-bar")
  const progressBarFill = document.querySelector('#progress-bar-fill')
  const progressBarText = document.querySelector('#progress-bar-text')

  progressBar.style.display = 'block'
  progressBarFill.style.width = percentage.toFixed(2) + "%"
  progressBarText.textContent = percentage.toFixed(2) + "%"
}

function hideProgressBar() {
  document.querySelector("#progress-bar").style.display = 'none'
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
    if (res.ok) showAlertById('mkdir-success-alert')
    else if (res.status == 401) showAuthFailureMessage()
    else showGenericErrorMessage()
  })
}

function deleteSelected() {
  var checkboxes = Array.from(document.getElementsByClassName('delete-checkbox'))
  var selected = checkboxes.filter(cb => cb.checked)
  if (selected.length == 0) {
    showError("No file selected.")
    return
  }
  Promise.all(selected
    .map(cb => cb.value)
    .map(path => {console.log(path); return path})
    .map(path => deleteFile(path)))
    .then(([res]) => {
      if (res.ok) showAlertById('delete-success-alert')
      else if (res.status == 401) showAuthFailureMessage()
    }).catch(() => showGenericErrorMessage())
  
  function deleteFile(path) {
    return fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

function getPassword() {
  return document.cookie
    .split(';')
    .map(cookie => cookie.split('='))
    .reduce((accumulator, [key, value]) => ({ ...accumulator, [key.trim()]: decodeURIComponent(value) }), {})
    .password
}

function setPassword(password) {
  document.cookie = `password=${password}; path=/`
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

function showAlertById(id) {
  document.getElementById(id).style.display = 'block'
}

const toggleAll = (() => {
  var state = false

  function go() {
    state = !state
    var checkboxes = Array.from(document.getElementsByClassName('delete-checkbox'))
    checkboxes.forEach(cb => cb.checked = state)
  }

  return go
})()
/* global gapi */
const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError')
const UnauthorizedError = require('../../src/exceptions/unauthorizedError')
const ExceptionMessages = require('./exceptionMessages')

const NUMBER_4 = 4
const NUMBER_200 = 200
const NUMBER_204 = 204

const sheet = function (sheetReference) {
  const self = {};

  (function () {
    const matches = sheetReference.match('https:\\/\\/docs.google.com\\/spreadsheets\\/d\\/(.*?)($|\\/$|\\/.*|\\?.*)')
    self.id = matches !== null ? matches[1] : sheetReference
  })()

  self.validate = function (callback) {
    const skipGoogleAuth = process.env.SKIP_GOOGLE_AUTH || false
    const feedURL = skipGoogleAuth ? `https://spreadsheets.google.com/feeds/worksheets/${self.id}/public/basic?alt=json`
      : `https://sheets.googleapis.com/v4/spreadsheets/${self.id}?key=${process.env.API_KEY}`

    // TODO: Move this out (as HTTPClient)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', feedURL, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === NUMBER_4) {
        if (xhr.status === NUMBER_200) {
          return callback()
        } else if (xhr.status === NUMBER_204) {
          return callback(new SheetNotFoundError(ExceptionMessages.SHEET_NOT_FOUND))
        } else {
          return callback(new UnauthorizedError(ExceptionMessages.UNAUTHORIZED))
        }
      }
    }
    xhr.send(null)
  }

  self.getSheet = function () {
    return gapi.client.sheets.spreadsheets.get({ spreadsheetId: self.id })
  }

  self.getData = function (range) {
    return gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: self.id,
      range: range
    })
  }

  self.processSheetResponse = function (sheetName, createBlips, handleError) {
    self.getSheet().then(response => processSheetData(sheetName, response, createBlips, handleError)).catch(handleError)
  }

  function processSheetData (sheetName, sheetResponse, createBlips, handleError) {
    const sheetNames = sheetResponse.result.sheets.map(s => s.properties.title)
    sheetName = !sheetName ? sheetNames[0] : sheetName
    self.getData(`${sheetName}!A1:E`)
      .then(r => createBlips(sheetResponse.result.properties.title, r.result.values, sheetNames))
      .catch(handleError)
  }

  return self
}

module.exports = sheet

/* eslint no-constant-condition: "off" */

const d3 = require('d3')
const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  capitalize: require('lodash/capitalize'),
  each: require('lodash/each')
}

const InputSanitizer = require('./inputSanitizer')
const Radar = require('../models/radar')
const Quadrant = require('../models/quadrant')
const Ring = require('../models/ring')
const Blip = require('../models/blip')
const GraphingRadar = require('../graphing/radar')
const MalformedDataError = require('../exceptions/malformedDataError')
const SheetNotFoundError = require('../exceptions/sheetNotFoundError')
const ContentValidator = require('./contentValidator')
const ExceptionMessages = require('./exceptionMessages')

const NUMBER_4 = 4
const NUMBER_133 = 133
const NUMBER_620 = 620

const url = `${window.location.href}radar.csv`

const plotRadar = function (title, blips, currentRadarName, alternativeRadars) {
  if (title.endsWith('.csv')) {
    title = title.substring(0, title.length - NUMBER_4)
  }
  document.title = title
  d3.selectAll('.loading').remove()

  const rings = _.map(_.uniqBy(blips, 'ring'), 'ring')
  const ringMap = {}
  const maxRings = NUMBER_4

  _.each(rings, function (ringName, i) {
    if (i === maxRings) {
      throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS)
    }
    ringMap[ringName] = new Ring(ringName, i)
  })

  const quadrants = {}
  _.each(blips, function (blip) {
    if (!quadrants[blip.quadrant]) {
      quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant))
    }
    quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
  })

  const radar = new Radar()
  _.each(quadrants, function (quadrant) {
    radar.addQuadrant(quadrant)
  })

  if (alternativeRadars !== undefined) {
    alternativeRadars.forEach(function (sheetName) {
      radar.addAlternative(sheetName)
    })
  }

  if (currentRadarName !== undefined) {
    radar.setCurrentSheet(currentRadarName)
  }

  const size = (window.innerHeight - NUMBER_133) < NUMBER_620 ? NUMBER_620 : window.innerHeight - NUMBER_133

  new GraphingRadar(size, radar).init().plot()
}

const csvDocument = function (url) {
  const self = {}

  self.build = function () {
    d3.csv(url).then(createBlips)
  }

  const createBlips = function (data) {
    try {
      const columnNames = data.columns
      delete data.columns
      const contentValidator = new ContentValidator(columnNames)
      contentValidator.verifyContent()
      contentValidator.verifyHeaders()
      const blips = _.map(data, new InputSanitizer().sanitize)
      // plotRadar(FileName(url), blips, 'CSV File', [])
      plotRadar('Technology Radar', blips, 'CSV File', [])
    } catch (exception) {
      plotErrorMessage(exception)
    }
  }

  self.init = function () {
    // plotLoading()
    return self
  }

  return self
}

const googleSheetInput = function () {
  const self = {}
  let sheet

  self.build = function () {
    sheet = csvDocument(url)
    sheet.init().build()
  }

  return self
}

function setDocumentTitle () {
  document.title = 'Build your own Radar'
}

function plotLogo (content) {
  content.append('div')
    .attr('class', 'input-sheet__logo')
    .html('<a href="https://www.thoughtworks.com"><em class="bc-icon bc-lg ng-star-inserted">&#xea50;</em></a>')
}

function plotFooter (content) {
  content
    .append('div')
    .attr('id', 'footer')
    .append('div')
    .attr('class', 'footer-content')
    .append('p')
    .html(`Powered by <a href="https://www.thoughtworks.com"> ThoughtWorks</a>. 
      By using this service you agree to <a href="https://www.thoughtworks.com/radar/tos">ThoughtWorks terms of use</a>. 
      You also agree to our <a href="https://www.thoughtworks.com/privacy-policy">privacy policy</a>, 
      which describes how we will gather, use and protect any personal data contained in your public Google Sheet. 
      This software is <a href="https://github.com/thoughtworks/build-your-own-radar">open source</a> 
      and available for download and self-hosting.`)
}

function plotBanner (content, text) {
  content.append('div')
    .attr('class', 'input-sheet__banner')
    .html(text)
}

function plotErrorMessage (exception) {
  let message = 'Oops! It seems like there are some problems with loading your data. '

  const content = d3.select('body')
    .append('div')
    .attr('class', 'input-sheet')
  setDocumentTitle()

  plotLogo(content)

  const bannerText = '<div><h1>Build your own radar</h1><p>Once you\'ve <a href ="https://www.thoughtworks.com/radar/byor">created your Radar</a>, you can use this service' +
    ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://www.thoughtworks.com/radar/how-to-byor">Read this first.</a></p></div>'

  plotBanner(content, bannerText)

  d3.selectAll('.loading').remove()
  message = "Oops! We can't find the Google Sheet you've entered"
  const faqMessage = 'Please check <a href="https://www.thoughtworks.com/radar/how-to-byor">FAQs</a> for possible solutions.'
  if (exception instanceof MalformedDataError) {
    message = message.concat(exception.message)
  } else if (exception instanceof SheetNotFoundError) {
    message = exception.message
  } else {
    console.error(exception)
  }

  const container = content.append('div').attr('class', 'error-container')
  const errorContainer = container.append('div')
    .attr('class', 'error-container__message')
  errorContainer.append('div').append('p')
    .html(message)
  errorContainer.append('div').append('p')
    .html(faqMessage)

  let homePageURL = `${window.location.protocol}//${window.location.hostname}`
  homePageURL += (window.location.port === '' ? '' : `:${window.location.port}`)
  const homePage = `<a href=${homePageURL}>GO BACK</a>`

  errorContainer.append('div').append('p')
    .html(homePage)

  plotFooter(content)
}

module.exports = googleSheetInput

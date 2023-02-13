const MalformedDataError = require('../exceptions/malformedDataError')
const ExceptionMessages = require('../util/exceptionMessages')

const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  sortBy: require('lodash/sortBy')
}

const NUMBER_4 = 4

const radar = function () {
  let blipNumber, addingQuadrant, currentSheetName

  blipNumber = 0
  addingQuadrant = 0
  const quadrants = [
    { order: 'first', startAngle: 90 },
    { order: 'second', startAngle: 0 },
    { order: 'third', startAngle: -90 },
    { order: 'fourth', startAngle: -180 }
  ]
  const alternatives = []
  currentSheetName = ''
  const self = {}

  function setNumbers (blips) {
    blips.forEach(function (blip) {
      ++blipNumber
      blip.setNumber(blipNumber)
    })
  }

  self.addAlternative = function (sheetName) {
    alternatives.push(sheetName)
  }

  self.getAlternatives = function () {
    return alternatives
  }

  self.setCurrentSheet = function (sheetName) {
    currentSheetName = sheetName
  }

  self.getCurrentSheet = function () {
    return currentSheetName
  }

  self.addQuadrant = function (quadrant) {
    if (addingQuadrant >= NUMBER_4) {
      throw new MalformedDataError(ExceptionMessages.TOO_MANY_QUADRANTS)
    }
    quadrants[addingQuadrant].quadrant = quadrant
    setNumbers(quadrant.blips())
    addingQuadrant++
  }

  function allQuadrants () {
    if (addingQuadrant < NUMBER_4) {
      throw new MalformedDataError(ExceptionMessages.LESS_THAN_FOUR_QUADRANTS)
    }

    return _.map(quadrants, 'quadrant')
  }

  function allBlips () {
    return allQuadrants().reduce(function (blips, quadrant) {
      return blips.concat(quadrant.blips())
    }, [])
  }

  self.rings = function () {
    return _.sortBy(_.map(_.uniqBy(allBlips(), function (blip) {
      return blip.ring().name()
    }), function (blip) {
      return blip.ring()
    }), function (ring) {
      return ring.order()
    })
  }

  self.quadrants = function () {
    return quadrants
  }

  return self
}

module.exports = radar

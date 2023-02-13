const IDEAL_BLIP_WIDTH = 22
const blip = function (name, ring, isNew, topic, description) {
  let number

  const self = {}
  number = -1

  self.width = IDEAL_BLIP_WIDTH

  self.name = function () {
    return name
  }

  self.topic = function () {
    return topic || ''
  }

  self.description = function () {
    return description || ''
  }

  self.isNew = function () {
    return isNew
  }

  self.ring = function () {
    return ring
  }

  self.number = function () {
    return number
  }

  self.setNumber = function (newNumber) {
    number = newNumber
  }

  return self
}

module.exports = blip

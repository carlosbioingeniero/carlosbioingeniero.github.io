const ring = function (name, order) {
  const self = {}

  self.name = function () {
    return name
  }

  self.order = function () {
    return order
  }

  return self
}

module.exports = ring

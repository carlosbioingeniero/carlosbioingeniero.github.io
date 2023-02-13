const NUMBER_0 = 0
const NUMBER_1 = 1
const NUMBER_2 = 2
const NUMBER_3 = 3
const NUMBER_5 = 5
const NUMBER_6 = 6

const ringCalculator = function (numberOfRings, maxRadius) {
  const sequence = [NUMBER_0, NUMBER_6, NUMBER_5, NUMBER_3, NUMBER_2, NUMBER_1, NUMBER_1, NUMBER_1]

  const self = {}

  self.sum = function (length) {
    return sequence.slice(0, length + 1).reduce(function (previous, current) {
      return previous + current
    }, 0)
  }

  self.getRadius = function (ring) {
    const total = self.sum(numberOfRings)
    const sum = self.sum(ring)

    return maxRadius * sum / total
  }

  return self
}

module.exports = ringCalculator

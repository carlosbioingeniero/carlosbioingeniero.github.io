const d3 = require('d3')
const d3tip = require('d3-tip')
const Chance = require('chance')
const _ = require('lodash/core')

const RingCalculator = require('../util/ringCalculator')
const QueryParams = require('../util/queryParamProcessor')
const AutoComplete = require('../util/autoComplete')

const MIN_BLIP_WIDTH = 12
const ANIMATION_DURATION = 1000

const QUADRANT_TABLE = '.quadrant-table.'
const QUADRANT_TABLE_SELECTED = '.quadrant-table.selected'
const QUADRANT_GROUP = '.quadrant-group'
const QUADRANT_GROUP_ = '.quadrant-group-'
const QUADRANT_GROUP_NOT = '.quadrant-group:not(.quadrant-group-'
const TRANSLATE = 'translate'
const TEXT_ANCHOR = 'text-anchor'
const BLIP_LINK = 'g.blip-link'
const BLIP_LIST_ITEM = '.blip-list-item'
const BLIP_ITEM_DESCRIPTION = '.blip-item-description.expanded'
const HOME_LINK = '.home-link'
const POINTER_EVENTS = 'pointer-events'
const INLINE_BLOCK = 'inline-block'
const MARGIN_LEFT = 'margin-left'

const NUMBER_0_3 = 0.3
const NUMBER_0_8 = 0.8
const NUMBER_0 = 0
const NUMBER_1 = 1
const NUMBER_2 = 2
const NUMBER_3 = 3
const NUMBER_4 = 4
const NUMBER_5 = 5
const NUMBER_7 = 7
const NUMBER_10 = 10
const NUMBER_14 = 14
const NUMBER_15 = 15
const NUMBER_17 = 17
const NUMBER_20 = 20
const NUMBER_22 = 22
const NUMBER_25 = 25
const NUMBER_34 = 34
const NUMBER_45 = 45
const NUMBER_64 = 64
const NUMBER_180 = 180
const NUMBER_90 = 90

const NUMBER_NEG_282 = -282
const NUMBER_NEG_404 = -404

const radarFunc = function (size, radar) {
  let svg, radarElement, quadrantButtons, buttonsGroup, header, alternativeDiv

  const tip = d3tip().attr('class', 'd3-tip').html(function (text) {
    return text
  })

  tip.direction(function () {
    if (d3.select(QUADRANT_TABLE_SELECTED).node()) {
      const selectedQuadrant = d3.select(QUADRANT_TABLE_SELECTED)
      if (selectedQuadrant.classed('first') || selectedQuadrant.classed('fourth')) {
        return 'ne'
      } else {
        return 'nw'
      }
    }
    return 'n'
  })

  const ringCalculator = new RingCalculator(radar.rings().length, center())

  const self = {}
  let chance

  function center () {
    return Math.round(size / NUMBER_2)
  }

  function toRadian (angleInDegrees) {
    return Math.PI * angleInDegrees / NUMBER_180
  }

  function plotLines (quadrantGroup, quadrant) {
    const startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + NUMBER_1) / NUMBER_2)
    const endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - NUMBER_90)) + NUMBER_1) / NUMBER_2)

    let startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + NUMBER_1) / NUMBER_2)
    let endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - NUMBER_90)) + NUMBER_1) / NUMBER_2)

    if (startY > endY) {
      const aux = endY
      endY = startY
      startY = aux
    }

    quadrantGroup.append('line')
      .attr('x1', center()).attr('x2', center())
      .attr('y1', startY - NUMBER_2).attr('y2', endY + NUMBER_2)
      .attr('stroke-width', NUMBER_10)

    quadrantGroup.append('line')
      .attr('x1', endX).attr('y1', center())
      .attr('x2', startX).attr('y2', center())
      .attr('stroke-width', NUMBER_10)
  }

  function plotQuadrant (rings, quadrant) {
    const quadrantGroup = svg.append('g')
      .attr('class', `quadrant-group quadrant-group-${quadrant.order}`)
      .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
      .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
      .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))

    rings.forEach(function (ring, i) {
      const arc = d3.arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + NUMBER_1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - NUMBER_90))

      quadrantGroup.append('path')
        .attr('d', arc)
        .attr('class', `ring-arc-${ring.order()}`)
        .attr('transform', `${TRANSLATE}(${center()}, ${center()})`)
    })

    return quadrantGroup
  }

  function plotTexts (quadrantGroup, rings, quadrant) {
    rings.forEach(function (ring, i) {
      if (quadrant.order === 'first' || quadrant.order === 'fourth') {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + NUMBER_4)
          .attr('x', center() + (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + NUMBER_1)) / NUMBER_2)
          .attr(TEXT_ANCHOR, 'middle')
          .text(ring.name())
      } else {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + NUMBER_4)
          .attr('x', center() - (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + NUMBER_1)) / NUMBER_2)
          .attr(TEXT_ANCHOR, 'middle')
          .text(ring.name())
      }
    })
  }

  function triangle (blip, x, y, order, group) {
    return group.append('path')
      .attr('d', `M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,
                  8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306
                  6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,
                  0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,
                  412.201,311.406`)
      .attr('transform', `scale(${blip.width / NUMBER_34})${TRANSLATE}(${(NUMBER_NEG_404 + x * (NUMBER_34 / blip.width) - NUMBER_17)}, 
                            ${(NUMBER_NEG_282 + y * (NUMBER_34 / blip.width) - NUMBER_17)})`)
      .attr('class', order)
  }

  function triangleLegend (x, y, group) {
    return group.append('path')
      .attr('d', `M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051
                  8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,
                  6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,
                  0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406`)
      .attr('transform', `scale(${(NUMBER_22 / NUMBER_64)}) ${TRANSLATE}(${(NUMBER_NEG_404 + x * (NUMBER_64 / NUMBER_22) - NUMBER_17)}, 
                            ${(NUMBER_NEG_282 + y * (NUMBER_64 / NUMBER_22) - NUMBER_17)})`)
  }

  function circle (blip, x, y, order, group) {
    return (group || svg).append('path')
      .attr('d', `M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,
                  8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,
                  8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092`)
      .attr('transform', `scale(${(blip.width / NUMBER_34)}) ${TRANSLATE}(${(NUMBER_NEG_404 + x * (NUMBER_34 / blip.width) - NUMBER_17)},
                           ${(NUMBER_NEG_282 + y * (NUMBER_34 / blip.width) - NUMBER_17)})`)
      .attr('class', order)
  }

  function circleLegend (x, y, group) {
    return (group || svg).append('path')
      .attr('d', `M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,
                  8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,
                  8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092`)
      .attr('transform', `scale(${(NUMBER_22 / NUMBER_64)}) ${TRANSLATE}(${(NUMBER_NEG_404 + x * (NUMBER_64 / NUMBER_22) - NUMBER_17)}, 
                            ${(NUMBER_NEG_282 + y * (NUMBER_64 / NUMBER_22) - NUMBER_17)})`)
  }

  function addRing (ring, order) {
    const table = d3.select(QUADRANT_TABLE + order)
    table.append('h3').text(ring)
    return table.append('ul')
  }

  function calculateBlipCoordinates (blip, chance, minRadius, maxRadius, startAngle) {
    const adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    const adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle))

    const radius = chance.floating({ min: minRadius + blip.width / NUMBER_2, max: maxRadius - blip.width / NUMBER_2 })
    let angleDelta = Math.asin(blip.width / NUMBER_2 / radius) * NUMBER_180 / Math.PI
    angleDelta = angleDelta > NUMBER_45 ? NUMBER_45 : angleDelta
    const angle = toRadian(chance.integer({ min: angleDelta, max: NUMBER_90 - angleDelta }))

    const x = center() + radius * Math.cos(angle) * adjustX
    const y = center() + radius * Math.sin(angle) * adjustY

    return [x, y]
  }

  function thereIsCollision (blip, coordinates, allCoordinates) {
    return allCoordinates.some(function (currentCoordinates) {
      return (Math.abs(currentCoordinates[0] - coordinates[0]) < blip.width) && (Math.abs(currentCoordinates[1] - coordinates[1]) < blip.width)
    })
  }

  function plotBlips (quadrantGroup, rings, quadrantWrapper) {
    const quadrant = quadrantWrapper.quadrant
    const startAngle = quadrantWrapper.startAngle
    const order = quadrantWrapper.order

    d3.select(QUADRANT_TABLE + order).append('h2').attr('class', 'quadrant-table__name').text(quadrant.name())

    const blips = quadrant.blips()
    rings.forEach(function (ring, i) {
      const ringBlips = blips.filter(function (blip) {
        return blip.ring() === ring
      })

      if (ringBlips.length === 0) {
        return
      }

      const minRadius = ringCalculator.getRadius(i)
      const maxRadius = ringCalculator.getRadius(i + 1)

      const sumRing = ring.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      const sumQuadrant = quadrant.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      chance = new Chance(Math.PI * sumRing * ring.name().length * sumQuadrant * quadrant.name().length)

      const ringList = addRing(ring.name(), order)
      const allBlipCoordinatesInRing = []

      ringBlips.forEach(function (blip) {
        const coordinates = findBlipCoordinates(blip,
          minRadius,
          maxRadius,
          startAngle,
          allBlipCoordinatesInRing)

        allBlipCoordinatesInRing.push(coordinates)
        drawBlipInCoordinates(blip, coordinates, order, quadrantGroup, ringList)
      })
    })
  }

  function findBlipCoordinates (blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing) {
    const maxIterations = 200
    let coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
    let iterationCounter = 0
    let foundAPlace = false

    while (iterationCounter < maxIterations) {
      if (thereIsCollision(blip, coordinates, allBlipCoordinatesInRing)) {
        coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
      } else {
        foundAPlace = true
        break
      }
      iterationCounter++
    }

    if (!foundAPlace && blip.width > MIN_BLIP_WIDTH) {
      blip.width = blip.width - 1
      return findBlipCoordinates(blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing)
    } else {
      return coordinates
    }
  }

  function drawBlipInCoordinates (blip, coordinates, order, quadrantGroup, ringList) {
    const x = coordinates[0]
    const y = coordinates[1]

    const group = quadrantGroup.append('g').attr('class', 'blip-link').attr('id', `blip-link-${blip.number()}`)

    if (blip.isNew()) {
      triangle(blip, x, y, order, group)
    } else {
      circle(blip, x, y, order, group)
    }

    group.append('text')
      .attr('x', x)
      .attr('y', y + NUMBER_4)
      .attr('class', 'blip-text')
      // derive font-size from current blip width
      .style('font-size', `${((blip.width * NUMBER_10) / NUMBER_22)}px`)
      .attr(TEXT_ANCHOR, 'middle')
      .text(blip.number())

    const blipListItem = ringList.append('li')
    const blipText = `${blip.number()}. ${blip.name()}${(blip.topic() ? (`. - ${blip.topic()}`) : '')}`
    blipListItem.append('div')
      .attr('class', 'blip-list-item')
      .attr('id', `blip-list-item-${blip.number()}`)
      .text(blipText)

    const blipItemDescription = blipListItem.append('div')
      .attr('id', `blip-description-${blip.number()}`)
      .attr('class', 'blip-item-description')
    if (blip.description()) {
      blipItemDescription.append('p').html(blip.description())
    }

    const mouseOver = function () {
      d3.selectAll(BLIP_LINK).attr('opacity', NUMBER_0_3)
      group.attr('opacity', 1.0)
      blipListItem.selectAll(BLIP_LIST_ITEM).classed('highlight', true)
      tip.show(blip.name(), group.node())
    }

    const mouseOut = function () {
      d3.selectAll(BLIP_LINK).attr('opacity', 1.0)
      blipListItem.selectAll(BLIP_LIST_ITEM).classed('highlight', false)
      tip.hide().style('left', 0).style('top', 0)
    }

    blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut)
    group.on('mouseover', mouseOver).on('mouseout', mouseOut)

    const clickBlip = function () {
      d3.select(BLIP_ITEM_DESCRIPTION).node() !== blipItemDescription.node() &&
      d3.select(BLIP_ITEM_DESCRIPTION).classed('expanded', false)
      blipItemDescription.classed('expanded', !blipItemDescription.classed('expanded'))

      blipItemDescription.on('click', function () {
        d3.event.stopPropagation()
      })
    }

    blipListItem.on('click', clickBlip)
  }

  function removeHomeLink () {
    d3.select(HOME_LINK).remove()
  }

  function createHomeLink (pageElement) {
    if (pageElement.select(HOME_LINK).empty()) {
      pageElement.insert('div', 'div#alternative-buttons')
        .html('&#171; Back to Radar home')
        .attr('id', 'go-back')
        .classed('home-link', true)
        .classed('selected', true)
        .on('click', redrawFullRadar)
        .append('g')
        .attr('fill', '#626F87')
        .append('path')
        .attr('d', `M27.6904224,13.939279 C27.6904224,13.7179572 27.6039633,13.5456925 27.4314224,13.4230122 L18.9285959,
                    6.85547454 C18.6819796,6.65886965 18.410898,6.65886965 18.115049,6.85547454 L9.90776939,
                    13.4230122 C9.75999592,13.5456925 9.68592041,13.7179572 9.68592041,13.939279 L9.68592041,
                    25.7825947 C9.68592041,25.979501 9.74761224,26.1391059 9.87092041,26.2620876 C9.99415306,
                    26.3851446 10.1419265,26.4467108 10.3145429,26.4467108 L15.1946918,26.4467108 C15.391698,
                    26.4467108 15.5518551,26.3851446 15.6751633,26.2620876 C15.7984714,26.1391059 15.8600878,
                    25.979501 15.8600878,25.7825947 L15.8600878,18.5142424 L21.4794061,18.5142424 L21.4794061,
                    25.7822933 C21.4794061,25.9792749 21.5410224,26.1391059 21.6643306,26.2620876 C21.7876388,
                    26.3851446 21.9477959,26.4467108 22.1448776,26.4467108 L27.024951,26.4467108 C27.2220327,
                    26.4467108 27.3821898,26.3851446 27.505498,26.2620876 C27.6288061,26.1391059 27.6904224,
                    25.9792749 27.6904224,25.7822933 L27.6904224,13.939279 Z M18.4849735,0.0301425662 C21.0234,
                    0.0301425662 23.4202449,0.515814664 25.6755082,1.48753564 C27.9308469,2.45887984 29.8899592,
                    3.77497963 31.5538265,5.43523218 C33.2173918,7.09540937 34.5358755,9.05083299 35.5095796,
                    11.3015031 C36.4829061,13.5518717 36.9699469,15.9439104 36.9699469,18.4774684 C36.9699469,
                    20.1744196 36.748098,21.8101813 36.3044755,23.3844521 C35.860551,24.9584216 35.238498,
                    26.4281731 34.4373347,27.7934053 C33.6362469,29.158336 32.6753041,30.4005112 31.5538265,
                    31.5197047 C30.432349,32.6388982 29.1876388,33.5981853 27.8199224,34.3973401 C26.4519041,
                    35.1968717 24.9791531,35.8176578 23.4016694,36.2606782 C21.8244878,36.7033971 20.1853878,
                    36.9247943 18.4849735,36.9247943 C16.7841816,36.9247943 15.1453837,36.7033971 13.5679755,
                    36.2606782 C11.9904918,35.8176578 10.5180429,35.1968717 9.15002449,34.3973401 C7.78223265,
                    33.5978839 6.53752245,32.6388982 5.41612041,31.5197047 C4.29464286,30.4005112 3.33339796,
                    29.158336 2.53253673,27.7934053 C1.73144898,26.4281731 1.10909388,24.9584216 0.665395918,
                    23.3844521 C0.22184898,21.8101813 0,20.1744196 0,18.4774684 C0,16.7801405 0.22184898,
                    15.1446802 0.665395918,13.5704847 C1.10909388,11.9962138 1.73144898,10.5267637 2.53253673,
                    9.16153157 C3.33339796,7.79652546 4.29464286,6.55435031 5.41612041,5.43523218 C6.53752245,
                    4.3160387 7.78223265,3.35675153 9.15002449,2.55752138 C10.5180429,1.75806517 11.9904918,
                    1.13690224 13.5679755,0.694183299 C15.1453837,0.251464358 16.7841816,0.0301425662 18.4849735,
                    0.0301425662 L18.4849735,0.0301425662 Z`)
    }
  }

  function removeRadarLegend () {
    d3.select('.legend').remove()
  }

  function drawLegend (order) {
    removeRadarLegend()

    const triangleKey = 'New or moved'
    const circleKey = 'No change'

    const container = d3.select('svg').append('g')
      .attr('class', `legend legend-${order}`)

    let x = 10
    let y = 10

    if (order === 'first') {
      x = NUMBER_4 * size / NUMBER_5
      y = 1 * size / NUMBER_5
    }

    if (order === 'second') {
      x = 1 * size / NUMBER_5 - NUMBER_15
      y = 1 * size / NUMBER_5 - NUMBER_20
    }

    if (order === 'third') {
      x = 1 * size / NUMBER_5 - NUMBER_15
      y = NUMBER_4 * size / NUMBER_5 + NUMBER_15
    }

    if (order === 'fourth') {
      x = NUMBER_4 * size / NUMBER_5
      y = NUMBER_4 * size / NUMBER_5
    }

    d3.select('.legend')
      .attr('class', `legend legend-${order}`)
      .transition()
      .style('visibility', 'visible')

    triangleLegend(x, y, container)

    container
      .append('text')
      .attr('x', x + NUMBER_15)
      .attr('y', y + NUMBER_5)
      .attr('font-size', '0.8em')
      .text(triangleKey)

    circleLegend(x, y + NUMBER_20, container)

    container
      .append('text')
      .attr('x', x + NUMBER_15)
      .attr('y', y + NUMBER_25)
      .attr('font-size', '0.8em')
      .text(circleKey)
  }

  function redrawFullRadar () {
    removeHomeLink()
    removeRadarLegend()
    d3.select('#ringDescription').classed('hidden', false)
    tip.hide()
    d3.selectAll(BLIP_LINK).attr('opacity', 1.0)

    svg.style('left', 0).style('right', 0)

    d3.selectAll('.button')
      .classed('selected', false)
      .classed('full-view', true)

    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll(HOME_LINK).classed('selected', false)

    d3.selectAll(QUADRANT_GROUP)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll('.quadrant-group .blip-link')
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll(QUADRANT_GROUP)
      .style(POINTER_EVENTS, 'auto')
  }

  function searchBlip (_e, ui) {
    const { blip, quadrant } = ui.item
    const isQuadrantSelected = d3.select(`div.button.${quadrant.order}`).classed('selected')
    selectQuadrant.bind({}, quadrant.order, quadrant.startAngle)()
    const selectedDesc = d3.select(`#blip-description-${blip.number()}`)
    d3.select(BLIP_ITEM_DESCRIPTION).node() !== selectedDesc.node() &&
    d3.select(BLIP_ITEM_DESCRIPTION).classed('expanded', false)
    selectedDesc.classed('expanded', true)

    d3.selectAll(BLIP_LINK).attr('opacity', NUMBER_0_3)
    const group = d3.select(`#blip-link-${blip.number()}`)
    group.attr('opacity', 1.0)
    d3.selectAll(BLIP_LIST_ITEM).classed('highlight', false)
    d3.select(`#blip-list-item-${blip.number()}`).classed('highlight', true)
    if (isQuadrantSelected) {
      tip.show(blip.name(), group.node())
    } else {
      // need to account for the animation time associated with selecting a quadrant
      tip.hide()

      setTimeout(function () {
        tip.show(blip.name(), group.node())
      }, ANIMATION_DURATION)
    }
  }

  function plotRadarHeader () {
    header = d3.select('body').insert('header', '#radar')
    header.append('div')
      .attr('class', 'radar-title')
      .append('div')
      .attr('class', 'radar-title__logo')
      .html(`<a href="${window.location.href}"><em class="bc-icon bc-lg ng-star-inserted">&#xea50;</em></a>`)

    header.select('.radar-title')
      .append('div')
      .attr('class', 'radar-title__text')
      .append('h1')
      .attr('id', 'radar-title')
      .text(document.title)
      .style('cursor', 'pointer')
      .on('click', redrawFullRadar)

    buttonsGroup = header.append('div')
      .classed('buttons-group', true)

    quadrantButtons = buttonsGroup.append('div')
      .classed('quadrant-btn--group', true)

    alternativeDiv = header.append('div')
      .attr('id', 'alternative-buttons')

    return header
  }

  function plotQuadrantButtons (quadrants) {
    function addButton (quadrant) {
      radarElement
        .append('div')
        .attr('class', `quadrant-table ${quadrant.order}`)

      quadrantButtons.append('div')
        .attr('class', `button ${quadrant.order} full-view`)
        .text(quadrant.quadrant.name())
        .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
        .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
        .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))
    }

    _.each([NUMBER_0, NUMBER_1, NUMBER_2, NUMBER_3], function (i) {
      addButton(quadrants[i])
    })

    buttonsGroup.append('div')
      .classed('print-radar-btn', true)
      .append('div')
      .classed('print-radar button no-capitalize', true)
      .text('Print this radar')
      .on('click', window.print.bind(window))

    alternativeDiv.append('div')
      .classed('search-box', true)
      .append('input')
      .attr('id', 'auto-complete')
      .attr('placeholder', 'Search')
      .classed('search-radar', true)

    AutoComplete('#auto-complete', quadrants, searchBlip)
  }

  function plotRadarFooter () {
    d3.select('body')
      .insert('div', '#radar-plot + *')
      .attr('id', 'footer')
      .insert('div')
      .attr('class', 'radar-thlogo')
      .html('<img id="footerLogo" src="images/logo.png"/>')
    d3.select('#footer')
      .append('div')
      .attr('class', 'footer-content')
      .html('<em class="bc-icon bc-lg ng-star-inserted">&#xea50;</em><p>Copyright © 2021 Grupo Bancolombia.</p></div>')
  }

  function mouseoverQuadrant (order) {
    d3.select(QUADRANT_GROUP_ + order).style('opacity', 1)
    d3.selectAll(`${QUADRANT_GROUP_NOT}${order})`).style('opacity', NUMBER_0_3)
  }

  function mouseoutQuadrant (order) {
    d3.selectAll(`${QUADRANT_GROUP_NOT}${order})`).style('opacity', 1)
  }

  function selectQuadrant (order, startAngle) {
    d3.selectAll(HOME_LINK).classed('selected', false)
    createHomeLink(d3.select('header'))
    d3.select('#ringDescription').classed('hidden', true)

    d3.selectAll('.button').classed('selected', false).classed('full-view', false)
    d3.selectAll(`.button.${order}`).classed('selected', true)
    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll(QUADRANT_TABLE + order).classed('selected', true)
    d3.selectAll('.blip-item-description').classed('expanded', false)

    const scale = 2

    const adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    const adjustY = Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle))

    const translateX = (-1 * (1 + adjustX) * size / NUMBER_2 * (scale - 1)) + (-adjustX * (1 - scale / NUMBER_2) * size)
    const translateY = (-1 * (1 - adjustY) * (size / NUMBER_2 - NUMBER_7) * (scale - 1)) - ((1 - adjustY) / NUMBER_2 * (1 - scale / NUMBER_2) * size)

    const translateXAll = (1 - adjustX) / NUMBER_2 * size * scale / NUMBER_2 + ((1 - adjustX) / NUMBER_2 * (1 - scale / NUMBER_2) * size)
    const translateYAll = (1 + adjustY) / NUMBER_2 * size * scale / NUMBER_2

    const moveRight = (1 + adjustX) * (NUMBER_0_8 * window.innerWidth - size) / NUMBER_2
    const moveLeft = (1 - adjustX) * (NUMBER_0_8 * window.innerWidth - size) / NUMBER_2

    const blipScale = NUMBER_3 / NUMBER_4
    const blipTranslate = (1 - blipScale) / blipScale

    svg.style('left', `${moveLeft}px`).style('right', `${moveRight}px`)
    d3.select(QUADRANT_GROUP_ + order)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', `${TRANSLATE}(${translateX},${translateY})scale(${scale})`)
    d3.selectAll(`${QUADRANT_GROUP_}${order} .blip-link text`).each(function () {
      const x = d3.select(this).attr('x')
      const y = d3.select(this).attr('y')
      d3.select(this.parentNode)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('transform', `scale(${blipScale})${TRANSLATE}(${blipTranslate * x},${blipTranslate * y})`)
    })

    d3.selectAll(QUADRANT_GROUP)
      .style(POINTER_EVENTS, 'auto')

    d3.selectAll(`${QUADRANT_GROUP_NOT}${order})`)
      .transition()
      .duration(ANIMATION_DURATION)
      .style(POINTER_EVENTS, 'none')
      .attr('transform', `${TRANSLATE}(${translateXAll},${translateYAll})scale(0)`)

    if (d3.select(`.legend.legend-${order}`).empty()) {
      drawLegend(order)
    }
  }

  self.init = function () {
    radarElement = d3.select('body').append('div').attr('id', 'radar')
    return self
  }

  function constructSheetUrl (sheetName) {
    const noParamUrl = window.location.href.substring(0, window.location.href.indexOf(window.location.search))
    const queryParams = QueryParams(window.location.search.substring(1))
    return `${noParamUrl}?sheetId=${queryParams.sheetId}&sheetName=${encodeURIComponent(sheetName)}`
  }

  function plotAlternativeRadars (alternatives, currentSheet) {
    const alternativeSheetButton = alternativeDiv
      .append('div')
      .classed('multiple-sheet-button-group', true)

    alternativeSheetButton.append('p').text('Choose a sheet to populate radar')
    alternatives.forEach(function (alternative) {
      alternativeSheetButton
        .append('div:a')
        .attr('class', 'first full-view alternative multiple-sheet-button')
        .attr('href', constructSheetUrl(alternative))
        .text(alternative)

      if (alternative === currentSheet) {
        d3.selectAll('.alternative').filter(function () {
          return d3.select(this).text() === alternative
        }).attr('class', 'highlight multiple-sheet-button')
      }
    })
  }

  function plotRingDescription () {
    const ringDescription = d3.select('body').append('div').attr('id', 'ringDescription').style('width', '50%')

    const div1 = ringDescription.append('div')
    const span1 = div1.append('span').style('display', INLINE_BLOCK).style('width', '40%').style(MARGIN_LEFT, '10%')
    const span2 = div1.append('span').style('display', INLINE_BLOCK).style('width', '40%').style(MARGIN_LEFT, '10%')

    const div2 = ringDescription.append('div')
    const span3 = div2.append('span').style('display', INLINE_BLOCK).style('width', '40%').style(MARGIN_LEFT, '10%')
    const span4 = div2.append('span').style('display', INLINE_BLOCK).style('width', '40%').style(MARGIN_LEFT, '10%')

    span1.append('h4').text('Adopt').style('display', 'inline')
    span1.append('p').text(`These items are guidelines and have to be used by every project when suitable. 
                            Every project should use them if they can be applied.`)

    span2.append('h4').text('Assess').style('display', 'inline')
    span2.append('p').text(`These items have been analyzed and fully approved to be used in projects when needed. 
                            Their usage does not need prior validation.`)

    span3.append('h4').text('Trial').style('display', 'inline')
    span3.append('p').text(`These items can be used with previous approval from IngSW or Cloud. 
                            Their usage is not free, depends on the usage case and needs prior validation.`)

    span4.append('h4').text('Hold').style('display', 'inline')
    span4.append('p').text(`Should not be considered for usage in new projects. 
                            In most cases should consider migrating towards other alternatives.`)
  }

  self.plot = function () {
    const rings = radar.rings()
    const quadrants = radar.quadrants()
    const alternatives = radar.getAlternatives()
    const currentSheet = radar.getCurrentSheet()
    header = plotRadarHeader()

    if (alternatives.length) {
      plotAlternativeRadars(alternatives, currentSheet)
    }

    plotQuadrantButtons(quadrants, header)

    radarElement.style('height', `${size + NUMBER_14}px`)
    svg = radarElement.append('svg').call(tip)
    svg.attr('id', 'radar-plot').attr('width', size).attr('height', size + NUMBER_14)

    _.each(quadrants, function (quadrant) {
      const quadrantGroup = plotQuadrant(rings, quadrant)
      plotLines(quadrantGroup, quadrant)
      plotTexts(quadrantGroup, rings, quadrant)
      plotBlips(quadrantGroup, rings, quadrant)
    })

    plotRingDescription()

    plotRadarFooter()
  }

  return self
}

module.exports = radarFunc

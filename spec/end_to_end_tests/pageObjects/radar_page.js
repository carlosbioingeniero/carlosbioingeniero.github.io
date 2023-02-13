class RadarPage {
  constructor () {
    this.blip = '.quadrant-group-second .blip-link'
    this.blip_selected = '.blip-list-item'
    this.blip_description = '.blip-item-description.expanded p'
    this.sheet2 = '.alternative'
    this.autocomplete = '.search-radar'
    this.search_value = 'Context Map'
    this.search_item = '.search-box'
  }

  clickTheBlipFromInteractiveSection () {
    cy.get(this.blip).click()
  }

  clickTheBlip () {
    cy.get(this.blip_selected).click()
  }

  validateBlipDescription (text) {
    expect(cy.get(this.blip_description).contains(text))
  }

  clickSheet2 () {
    cy.get(this.sheet2).click()
  }

  searchTheBlip () {
    cy.get(this.autocomplete).type(this.search_value)
    cy.get(this.search_item).click()
  }

  validateBlipSearch () {
    expect(cy.get(this.blip_selected).contains(this.search_value))
  }
}

module.exports = new RadarPage()

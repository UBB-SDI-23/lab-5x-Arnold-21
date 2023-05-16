describe('Testing Login', () => {
  it('Testing login from main menu', () => {
    // Go to the website login page
    cy.visit('https://leaguelizer.netlify.app')
    cy.get('#loginNavButton').click()

    // Check if the url is correct
    cy.url().should('include', '/login')

    //Write incorrect user info and login action
    cy.get('#username').type("user1")
    cy.get('#password').type("Testing123")
    cy.get('#loginButton').click()

    //Check if we are still in the same page
    cy.url().should('include', '/login')

    cy.get('#adminNavButton')
    cy.get('#logoutNavButton')
    cy.get('#personalNavButton')
  })
})
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

    //Check if we are still in the same page, with a toastify error message
    cy.url().should('include', '/login')
    cy.get('div.Toastify', {timeout: 2500}).should('have.text','Authentication Failed!')

    //Check correct login
    cy.get('#username').clear()
    cy.get('#password').clear()
    cy.get('#username').type("user1")
    cy.get('#password').type("Testing123.")
    cy.get('#loginButton').click()
    
    //Check if we get thrown back to the main page
    cy.url().should('not.include', '/login')
    cy.window().then((win) => {
      const key = win.localStorage.getItem('tokens') !== null;
      cy.expect(key).to.be.true
    })

    //Check if the main page is correctly loaded
    cy.get('#adminNavButton')
    cy.get('#logoutNavButton')
    cy.get('#personalNavButton')

    //Trying to visit the register page
    cy.visit('https://leaguelizer.netlify.app/register')

    //Checking if we are thrown back to the main page
    cy.url().should('not.include', '/register')
    cy.get('#adminNavButton')
    cy.get('#logoutNavButton')
    cy.get('#personalNavButton')

    //Checking login
    cy.visit('https://leaguelizer.netlify.app/login')
    cy.url().should('not.include', '/login')
    cy.get('#adminNavButton')
    cy.get('#logoutNavButton')
    cy.get('#personalNavButton')

    //Logging out
    cy.visit('https://leaguelizer.netlify.app/logout')
  })
})
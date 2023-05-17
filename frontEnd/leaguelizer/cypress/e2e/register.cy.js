describe('Testing Login', () => {
    it('Testing login from main menu', () => {
        //Go to the website
        cy.visit('https://leaguelizer.netlify.app')

        // Go to the register page 
        cy.get('#registerNavButton').click()

        // Check if the url is correct
        cy.url().should('include', '/register')

        //Fill inputs with data
        cy.get('#username').type('Sali2')
        cy.get('#email').type('saliarnold2002@gmail.com')
        cy.get('#password').type('Testing123.')
        cy.get('#bio').type('Bio')
        cy.get('#location').type('location')

        //Press register
        cy.get('#registerBtn').click()

        //Check url
        cy.url().should('include', '/activation')
    })
})
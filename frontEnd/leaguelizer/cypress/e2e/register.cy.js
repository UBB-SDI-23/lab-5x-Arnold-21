describe('Testing Login', () => {
    it('Testing login from main menu', () => {
        //Go to the website
        cy.visit('https://leaguelizer.netlify.app')

        // Go to the register page 
        cy.get('#registerNAvButton').click()

        // Check if the url is correct
        cy.url().should('include', '/register')

        //Fill inputs with data
        cy.get('#username').type('Sali')
        cy.get('#email').type('saliarnold2002@gmail.com')
        cy.get('#password').type('Testing123.')
        cy.get('#bio').type('Bio')
        cy.get('#location').type('location')
        cy.get('#birthday').type('2002-07-18')

        //Press register
        cy.
    })
})
describe('Testing Login', () => {
  it('Testing login from main menu', () => {
    cy.visit('https://leaguelizer.netlify.app')
    cy.contains('/login')

    cy.get('#username').type("user1")
    cy.get('#password').type("Testing123.")
  })
})
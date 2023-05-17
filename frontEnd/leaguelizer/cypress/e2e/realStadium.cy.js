describe('Testing Stadium methods and validations', () => {
    it('Testing Stadium methods and validations', () => {
        //Go to the website
        cy.visit('https://leaguelizer.netlify.app')

        // Go to the stadium page 
        cy.get('#stadiumNavButton').click()

        //Check if the buttons are present, they shouldn't be
        cy.should('not.exist', '#stadiumPostBtn')
        cy.should('not.exist', '#stadiumPutBtn')
        cy.should('not.exist', '#stadiumDeleteBtn')

        //Check if the elements are retrieved properly
        for (let i=1; i<13; i++){
            cy.contains('td', String(i))
        }

        //Change the paginationValue, than check the items again
        cy.get('div[aria-haspopup="listbox"]').click()
        cy.get('li[data-value="20"]').click()
        for (let i=1; i<21; i++){
            cy.contains('td', String(i))
        }

        // Go to the website login page
        cy.visit('https://leaguelizer.netlify.app')
        cy.get('#loginNavButton').click()

        // Check if the url is correct
        cy.url().should('include', '/login')

        //Write incorrect user info and login action
        cy.get('#username').type("user1")
        cy.get('#password').type("Testing123.")
        cy.get('#loginButton').click()
        cy.url().should('not.include', '/login')

        //Go back to the stadium page, and check if the buttons exist
        cy.get('#stadiumNavButton').click()
        
        cy.get('#stadiumPostBtn').should('exist')
        cy.get('#stadiumPUTBtn').should('exist')
        cy.get('#stadiumDeleteBtn').should('exist')

        //Check Validation rules
        cy.get('#name').type("test/.")
        cy.get('#bDate').type("2002-07-18")
        cy.get('#rDate').type("2002-07-18")
        cy.get('#city').type("Barcelona")
        cy.get('#capacity').type("150000")
        cy.get('#description').type("Test")

        //Checking each validation rule
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 2500}).should('have.text','Stadium Name can only contain numbers and letters')

        cy.get('#name').clear()
        cy.get('#name').type("Test")
        cy.get('#bDate').clear()
        cy.get('#bDate').type("2002-07-18*")
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 2500}).should('have.text','Stadium Name can only contain numbers and lettersBuild Date needs to have the following format: yyyy-mm-dd')

        cy.get('#bDate').clear()
        cy.get('#bDate').type("2002-07-18")
        cy.get('#rDate').clear()
        cy.get('#rDate').type("2002-07-18*")
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 2500}).should('have.text','Stadium Name can only contain numbers and lettersBuild Date needs to have the following format: yyyy-mm-ddRenovation Date needs to have the following format: yyyy-mm-dd')
        
        cy.get('#rDate').clear()
        cy.get('#rDate').type("2002-07-18")
        cy.get('#capacity').clear()
        cy.get('#capacity').type("-15")
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 5000}).should('have.text','Stadium capacity must be positive')

        cy.get('#capacity').clear()
        cy.get('#capacity').type("15")
        cy.get('#city').clear()
        cy.get('#city').type("asd./")
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 5000}).should('have.text','Stadium City can only contain numbers and letters')

        cy.get('#city').clear()
        cy.get('#city').type("Barcelona")
        cy.get('#description').clear()
        cy.get('#description').type("asd./")
        cy.get('#stadiumPostBtn').click()
        cy.get('div.Toastify', {timeout: 5000}).should('have.text','Stadium Description can only contain numbers and letters')

        //Check a real post action
        cy.get('#description').clear()
        cy.get('#description').type("Desc")
        cy.get('#stadiumPostBtn').click()

        //Logging out
        cy.visit('https://leaguelizer.netlify.app/logout')
        cy.get('#logoutBtn').click()
        cy.url().should('include', '/login')
    })
})
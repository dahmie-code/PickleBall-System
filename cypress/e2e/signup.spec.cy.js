describe('Signup Component', () => {
  beforeEach(() => {
    
    // Assuming your app is hosted at localhost:3000
    
    cy.visit('http://localhost:5173/signup');
  });

  it('should navigate to login page', () => {
    cy.get('[data-cypress-name="sign-in-link-signup"]').click();
    cy.location('pathname').should('eq', '/')

  })
});
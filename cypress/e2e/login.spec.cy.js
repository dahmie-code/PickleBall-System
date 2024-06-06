// Assuming you have a login route at '/login'

describe('Login Component', () => {
  beforeEach(() => {
    
    // Assuming your app is hosted at localhost:3000
    
    cy.visit('http://localhost:5173/');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain.text', 'Sign in');
    cy.get('form').should('exist');
    cy.get('label').should('have.length', 2);
    cy.get('[data-cypress-name="login-email-input"]').should('exist');
    cy.get('[data-cypress-name="password-email-input"]').should('exist');
    cy.get('[data-cypress-name="login-form-submit-button"]').should('contain.text', 'Sign In');
  });

  it('should navigate to dashboard on successful login', () => {

    // cy.visit('http://127.0.0.1:5174/');
    cy.get('input:nth-child(2)').click();
    cy.get('input:nth-child(2)').type('nageeb.damani+2@gmail.com');
    cy.get('input:nth-child(1)').type('Pass123!');
    cy.get('button').click();
    
  });
});

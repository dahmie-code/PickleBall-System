import React from 'react';
import { Router, Routes, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Signup from '../../src/authComponents/Signup';
// import { isEmailValid } from '../../src/authComponents/Signup';
import { getAuth, deleteUser } from "firebase/auth";
import { remove, db, ref, set } from '../../src/firebase/Firebase.jsx';

describe('Signup Component', () => {
  beforeEach(() => {
    const history = createMemoryHistory();

    cy.mount(
      <Router location={history.location} navigator={history}>
        <Routes>
          <Route path="/" element={<Signup />} />
        </Routes>
      </Router>
    );
  });

  const typeDefault = (first = 'Sam', last = 'mmm', phone = '111-111-1111', email = 'sam.mmm@gmail.com', emailConfirm = 'sam.mmm@gmail.com', password = 'Mmmmm!124', passwordConfirm = 'Mmmmm!124') => {
    cy.get('[data-cypress-name="first-name-signup"]').type(first);
    cy.get('[data-cypress-name="last-name-signup"]').type(last);
    cy.get('[data-cypress-name="birthdate-signup"] input').type('01/01/2000').type("Cypress.io{enter}");
    cy.get('[data-cypress-name="gender-signup"]').select('Male');
    cy.get('[data-cypress-name="phone-number-signup"]').type(phone);
    cy.get('[data-cypress-name="country-signup"]').click();
    cy.contains('Canada').click();
    cy.get('[data-cypress-name="state-signup"]').click();
    cy.contains('Alberta').click();
    cy.get('[data-cypress-name="city-signup"]').click();
    cy.contains('Calgary').click();
    cy.get('[data-cypress-name="email-signup"]').type(email);
    cy.get('[data-cypress-name="confirm-email-signup"]').type(emailConfirm);
    cy.get('[data-cypress-name="password-signup"]').type(password);
    cy.get('[data-cypress-name="confirm-password-signup"]').type(passwordConfirm);
  }

  it('mounts', () => {
    cy.get('[data-cypress-name="signup-title"]').should('exist');
  });

  it('should input valid information and submit successfully', () => {
    typeDefault();
    cy.get('[data-cypress-name="submit-button-signup"]').click();

  
  });

  it('shows an error for mismatched email and confirm email fields', () => {
    typeDefault(undefined, undefined, undefined, undefined, 'sam.m@gmail.com', undefined, undefined);
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.contains('Email and Confirm Email must match.'
    ).should('exist')
  })

  it('shows an error for invalid password', () => {
    cy.get('[data-cypress-name="password-signup"]').type('m');
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.contains('Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.'
    ).should('exist')
  })

  it('shows an error for invalid email', () => {
    typeDefault(undefined, undefined, undefined, 'hey', 'hey', undefined, undefined);
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.get('input:invalid').should('have.length', 2)
  })

  it('shows an error invalid phone number', () => {
    typeDefault(undefined, undefined, 'invalid_number', undefined, undefined, undefined, undefined);
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.contains('Phone number should only contain numeric values, max 20 characters and non-numeric characters (),+,-')
      .should('exist');
  })

  it('shows an error when required fields are empty', () => {
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.get('input:invalid').should('not.have.length', 0)
  })

  it('should not show an error for a password with the minimum valid characters', () => {
    cy.get('[data-cypress-name="password-signup"]').type('Pass1@');
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.contains('Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.'
    ).should('not.exist')
  })

  it('should not show an error for a password with the maximum valid characters', () => {
    cy.get('[data-cypress-name="password-signup"]').type('Password12345678900@');
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.contains('Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.'
    ).should('not.exist')
  })

  it('should display the selected date of birth', () => {
    cy.get('[data-cypress-name="birthdate-signup"] input').type('01/01/2000').type("Cypress.io{enter}");
    cy.get('[data-cypress-name="birthdate-signup"] input').invoke('val').should('eq', "2000/01/01")
  })

  it('should display the selected location', () => {
    cy.get('[data-cypress-name="country-signup"]').click();
    cy.contains('Canada').click();
    cy.contains('Canada').should('exist')
    cy.get('[data-cypress-name="state-signup"]').click();
    cy.contains('Alberta').click()
    cy.contains('Alberta').should('exist');
    cy.get('[data-cypress-name="city-signup"]').click();
    cy.contains('Calgary').click()
    cy.contains('Calgary').should('exist');
  })

  it('shows an error for an empty password field', () => {
    cy.get('[data-cypress-name="password-signup"]').focus().blur();
    cy.contains('Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.'
    ).should('exist')
  })


  it('shows an error when country is not selected', () => {
    cy.get('[data-cypress-name="first-name-signup"]').type('sam');
    cy.get('[data-cypress-name="last-name-signup"]').type('mmm');
    cy.get('[data-cypress-name="birthdate-signup"] input').type('01/01/2000').type("Cypress.io{enter}");
    cy.get('[data-cypress-name="gender-signup"]').select('Male');
    cy.get('[data-cypress-name="phone-number-signup"]').type('111');

    cy.get('[data-cypress-name="email-signup"]').type('sam.mmm@gmail.com');
    cy.get('[data-cypress-name="confirm-email-signup"]').type("sam.mmm@gmail.com");
    cy.get('[data-cypress-name="password-signup"]').type("Pass1234!");
    cy.get('[data-cypress-name="confirm-password-signup"]').type("Pass1234!");
    cy.get('[data-cypress-name="submit-button-signup"]').click();
    cy.get('input:invalid').should('have.length', 1)


  })



  afterEach(async () => {
    const auth = await getAuth();
    const user = auth.currentUser;

    let uid;
    getAuth().onAuthStateChanged(function (user) {
      if (user) {
        console.log('yuh')
        console.log(user.uid)
        uid = user.uid;

        deleteUser(user).then(() => {
          console.log('hiiii')

        }).catch((error) => {
          // An error ocurred
          // ...
        });
      } else {
        console.log('huuh')
        // No user is signed in.
      }
    });
    const userRef = ref(db, `/players/${uid}`);
    console.log('kkk')
    console.log(userRef)
    set(userRef, null)
  })
});

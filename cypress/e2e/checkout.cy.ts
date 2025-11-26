describe('Checkout flow', () => {
  it('starts checkout and redirects', () => {
    cy.intercept('POST', '/api/create-checkout', { url: 'https://checkout.stripe.com/session/abc' }).as('createCheckout')

    cy.visit('/pricing')

    // Click on upgrade button on Pro plan (first non-free tier)
    cy.contains('Get Pro').click()

    // If not signed in: sign-up or redirect occurs; assume user clicked and we tried to hit <api/create-checkout>
    cy.wait('@createCheckout')

    // Should have been redirected to stripe url
    cy.url().should('include', 'checkout.stripe.com')
  })
})

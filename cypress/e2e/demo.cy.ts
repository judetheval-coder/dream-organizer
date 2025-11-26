describe('Demo onboarding', () => {
  it('shows welcome toast when demoCreated', () => {
    cy.intercept('POST', '/api/sync-user', { success: true, demoCreated: true }).as('syncUser')

    cy.visit('/dashboard')

    cy.wait('@syncUser')

    cy.contains('Welcome! We created a demo dream for you').should('exist')
  })
})

describe('Full user flows', () => {
  it('shows welcome screen and CTA', () => {
    cy.visit('/')
    cy.contains('Start Creating').should('exist')
    cy.contains('Start Creating').click()
    // If sign-up modal shows, it will have create account; otherwise redirect to /dashboard
    cy.location('pathname').then((p) => {
      if (p === '/') {
        // Sign-up modal might open, assert modal visible or signup page link
        cy.get('main').should('exist')
      }
    })
  })

  it('creates a new dream and shows it in dashboard', () => {
    // Ensure user is considered signed-in by mocking sync-user; the app expects Clerk, but we'll rely on demo mode for tests
    cy.intercept('POST', '/api/sync-user', { success: true, demoCreated: true }).as('syncUser')

    cy.visit('/dashboard')
    cy.wait('@syncUser')

    // Open create dream modal
    cy.contains('Start a dream').click()

    cy.get('input[placeholder="e.g., Flying Over the City"]').type('Flying Over the City')
    cy.get('textarea[placeholder="Describe what happened..."]').type('I was flying over a castle with dragons and clouds.')

    // Submit
    cy.contains('💾 Save Dream').click()

    // Expect new dream to appear in list
    cy.contains('Flying Over the City').should('exist')
  })

  it('generates a comic panel for the dream', () => {
    // Mock image generation
    cy.intercept('POST', '/api/generate-image', (req) => {
      req.reply({ statusCode: 200, body: { image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' } })
    }).as('generateImage')

    cy.visit('/dashboard')

    // Click generate on first dream panel
    cy.get('button').contains('Generate').first().click()

    cy.wait('@generateImage')

    // Panel should display an <img> with the stubbed data URL
    cy.get('img').should('have.attr', 'src').and('include', 'data:image/png;base64')
  })
})
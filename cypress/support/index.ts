// Cypress support file

// You can add global configuration and behaviors here

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore errors that come from the app to prevent tests from failing
  return false
})

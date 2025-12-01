// Cypress support file

// You can add global configuration and behaviors here

/* eslint-disable @typescript-eslint/no-unused-vars */
Cypress.on('uncaught:exception', (_err, _runnable) => {
  // Ignore errors that come from the app to prevent tests from failing
  return false
})
/* eslint-enable @typescript-eslint/no-unused-vars */

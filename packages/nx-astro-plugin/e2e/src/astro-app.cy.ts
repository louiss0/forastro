describe('Astro Application E2E', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
  });

  it('should display the home page', () => {
    cy.contains('Welcome to Astro');
    cy.get('h1').should('be.visible');
  });

  it('should have proper meta tags', () => {
    cy.get('head title').should('exist');
    cy.get('head meta[name="description"]').should('exist');
  });

  it('should load CSS properly', () => {
    cy.get('body').should('have.css', 'margin', '0px');
  });

  it('should navigate between pages if multiple pages exist', () => {
    // This test would be extended if there are navigation elements
    cy.get('body').should('exist');
  });

  it('should be responsive', () => {
    // Test different viewport sizes
    cy.viewport(1200, 800);
    cy.get('body').should('be.visible');
    
    cy.viewport(768, 1024);
    cy.get('body').should('be.visible');
    
    cy.viewport(320, 568);
    cy.get('body').should('be.visible');
  });

  it('should have working JavaScript if present', () => {
    // Test that JavaScript is working
    cy.window().should('have.property', 'navigator');
  });

  it('should have accessible content', () => {
    // Basic accessibility tests
    cy.get('html').should('have.attr', 'lang');
    cy.get('body').should('be.visible');
    
    // Check for heading hierarchy
    cy.get('h1').should('exist');
  });

  it('should handle 404 pages gracefully', () => {
    // Test 404 handling
    cy.request({
      url: '/non-existent-page',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});

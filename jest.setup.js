// Jest setup file
// Add custom matchers and global test utilities

// Helper to add visual separators in test output
global.logSection = (title) => {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
};

global.logStep = (step) => {
  console.log(`\n  → ${step}`);
};

global.logResult = (label, value) => {
  console.log(`    ✓ ${label}: ${JSON.stringify(value)}`);
};

global.logError = (label, value) => {
  console.log(`    ✗ ${label}: ${value}`);
};

const { createReleaseConfigWithScopeFilter } = require('../../tools/release');

module.exports = createReleaseConfigWithScopeFilter({
  projectScope: 'nx-strapi-plugin',
  projectRoot: 'packages/nx-strapi-plugin',
  buildOutput: 'dist/packages/nx-strapi-plugin',
});
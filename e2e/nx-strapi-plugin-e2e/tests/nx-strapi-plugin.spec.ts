import {
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-strapi-plugin e2e', () => {
  it('should create nx-strapi-plugin', async (done) => {
    const plugin = uniq('nx-strapi-plugin');
    ensureNxProject(
      '@design4pro/nx-strapi-plugin',
      'dist/packages/nx-strapi-plugin'
    );
    await runNxCommandAsync(
      `generate @design4pro/nx-strapi-plugin:app ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Strapi build done');

    done();
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('nx-strapi-plugin');
      ensureNxProject(
        '@design4pro/nx-strapi-plugin',
        'dist/packages/nx-strapi-plugin'
      );
      await runNxCommandAsync(
        `generate @design4pro/nx-strapi-plugin:app ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});

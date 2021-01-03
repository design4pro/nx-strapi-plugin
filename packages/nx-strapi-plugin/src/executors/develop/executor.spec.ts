import {
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('Builds the strapi admin app', () => {
  it('can run develop', async (done) => {
    const plugin = uniq('nx-strapi-plugin');

    ensureNxProject(
      '@design4pro/nx-strapi-plugin',
      'dist/packages/nx-strapi-plugin'
    );
    await runNxCommandAsync(
      `generate @design4pro/nx-strapi-plugin:app ${plugin}`
    );

    const result = await runNxCommandAsync(`develop ${plugin}`);
    expect(result.stdout).toContain('Strapi develop done');

    done();
  });
});

import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import * as generateStrapi from 'strapi-generate-new';
import generator from './generator';
import { NxStrapiPluginGeneratorSchema } from './schema';

jest.mock('strapi-generate-new');

describe('nx-strapi generator', () => {
  let appTree: Tree;
  const options: NxStrapiPluginGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');

    expect(config).toBeDefined();
    expect(generateStrapi).toHaveBeenLastCalledWith('apps/test', {
      quickstart: true,
      run: false,
    });
  });
});

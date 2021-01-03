import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { MockBuilderContext } from '@nrwl/workspace/testing';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

function getTempDir() {
  const tmpDir = tmpdir();
  const tmpFolder = `${tmpDir}${sep}`;
  return mkdtempSync(tmpFolder);
}

export async function getTestArchitect() {
  const tmpDir = getTempDir();
  const architectHost = new TestingArchitectHost(tmpDir, tmpDir);
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);

  const architect = new Architect(architectHost, registry);

  await architectHost.addBuilderFromPackage(join(__dirname, '../..'));

  return [architect, architectHost] as [Architect, TestingArchitectHost];
}

export async function getMockContext() {
  const [architect, architectHost] = await getTestArchitect();

  const context = new MockBuilderContext(architect, architectHost);
  await context.addBuilderFromPackage(join(__dirname, '../..'));
  return context;
}

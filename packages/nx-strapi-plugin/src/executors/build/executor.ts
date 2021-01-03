import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { fork } from 'child_process';
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  symlinkSync,
} from 'fs';
import { dirname, join } from 'path';
import { from, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { getProjectRoot } from '../../utils/get-project-root';
import { BuildExecutorSchema } from './schema';

export function runBuilder(
  options: BuildExecutorSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  context.reportStatus(`Building strapi ...`);

  return from(getProjectRoot(context)).pipe(
    concatMap((projectRoot) => {
      return new Observable<BuilderOutput>((subscriber) => {
        runStrapiBuild(context.workspaceRoot, projectRoot, options)
          .then(() => {
            context.reportStatus('Strapi project build');
            context.reportStatus('Copying files to dist folder');

            copyFolderSync(
              `${context.workspaceRoot}/${projectRoot}`,
              `${context.workspaceRoot}/dist/${projectRoot}`
            );

            context.reportStatus('Strapi build done');
            context.logger.info('Strapi build done');

            subscriber.next({
              success: true,
            });
            subscriber.complete();
          })
          .catch((err) => {
            context.logger.error('Error during build', err);

            subscriber.next({
              success: false,
            });
            subscriber.complete();
          });
      });
    })
  );
}

export function runStrapiBuild(
  workspaceRoot: string,
  projectRoot: string,
  options: BuildExecutorSchema
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const cp = fork(
      require.resolve('strapi'),
      ['build', ...createBuildOptions(options)],
      {
        cwd: join(workspaceRoot, projectRoot),
      }
    );

    cp.on('error', (err) => {
      reject(err);
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        resolve({ success: code === 0 });
      } else {
        reject(code);
      }
    });
  });
}

function createBuildOptions(options: BuildExecutorSchema) {
  return Object.keys(options).reduce((acc, k) => {
    const val = options[k];
    if (typeof val === 'undefined') return acc;
    switch (k) {
      case 'clean':
        return val ? acc.concat(`--clean`) : acc;
      case 'noOptimization':
        return val ? acc.concat('--no-optimization') : acc;
      default:
        return acc;
    }
  }, []);
}

function copyFolderSync(from: string, to: string) {
  readdirSync(from).forEach((element) => {
    const stat = lstatSync(join(from, element));
    const toPath = join(to, element);

    if (stat.isFile()) {
      // Make sure the directory exists
      mkdirSync(dirname(toPath), { recursive: true });

      copyFileSync(join(from, element), toPath);
    } else if (stat.isSymbolicLink()) {
      symlinkSync(readlinkSync(join(from, element)), toPath);
    } else if (stat.isDirectory() && element !== 'node_modules') {
      copyFolderSync(join(from, element), toPath);
    }
  });
}

export default createBuilder(runBuilder);

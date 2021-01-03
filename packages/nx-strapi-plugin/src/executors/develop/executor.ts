import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { fork } from 'child_process';
import { join } from 'path';
import { from, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { getProjectRoot } from '../../utils/get-project-root';
import { BuildExecutorSchema } from './schema';

export function runBuilder(
  options: BuildExecutorSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  return from(getProjectRoot(context)).pipe(
    concatMap((projectRoot) => {
      return new Observable<BuilderOutput>((subscriber) => {
        runStrapiBuild(context.workspaceRoot, projectRoot, options)
          .then(() => {
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
      ['develop', ...createBuildOptions(options)],
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
      case 'noBuild':
        return val ? acc.concat(`--no-build`) : acc;
      case 'watchAdmin':
        return val ? acc.concat('--watch-admin') : acc;
      case 'browser':
        return val ? acc.concat([`--browser`, val]) : acc;
      default:
        return acc;
    }
  }, []);
}

export default createBuilder(runBuilder);

import { JsonObject } from '@angular-devkit/core';

export interface BuildExecutorSchema extends JsonObject {
  noBuild?: boolean;
  watchAdmin?: boolean;
  browser?: boolean;
} // eslint-disable-line

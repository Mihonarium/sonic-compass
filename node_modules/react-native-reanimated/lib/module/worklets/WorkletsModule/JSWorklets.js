'use strict';

import { ReanimatedError } from "../../errors.js";
export function createJSWorkletsModule() {
  return new JSWorklets();
}
class JSWorklets {
  makeShareableClone() {
    throw new ReanimatedError('makeShareableClone should never be called in JSWorklets.');
  }
}
//# sourceMappingURL=JSWorklets.js.map
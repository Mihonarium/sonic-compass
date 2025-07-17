'use strict';

import { ReanimatedError } from "../../errors.js";
import { WorkletsTurboModule } from "../../specs/index.js";
import { getValueUnpackerCode } from "../valueUnpacker.js";
export function createNativeWorkletsModule() {
  return new NativeWorklets();
}
class NativeWorklets {
  #workletsModuleProxy;
  constructor() {
    if (global.__workletsModuleProxy === undefined) {
      const valueUnpackerCode = getValueUnpackerCode();
      WorkletsTurboModule?.installTurboModule(valueUnpackerCode);
    }
    if (global.__workletsModuleProxy === undefined) {
      throw new ReanimatedError(`Native part of Reanimated doesn't seem to be initialized (Worklets).
See https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting#native-part-of-reanimated-doesnt-seem-to-be-initialized for more details.`);
    }
    this.#workletsModuleProxy = global.__workletsModuleProxy;
  }
  makeShareableClone(value, shouldPersistRemote, nativeStateSource) {
    return this.#workletsModuleProxy.makeShareableClone(value, shouldPersistRemote, nativeStateSource);
  }
}
//# sourceMappingURL=NativeWorklets.js.map
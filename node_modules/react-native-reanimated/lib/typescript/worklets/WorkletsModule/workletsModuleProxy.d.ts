import type { ShareableRef } from '../../commonTypes';
/** Type of `__workletsModuleProxy` injected with JSI. */
export interface WorkletsModuleProxy {
    makeShareableClone<TValue>(value: TValue, shouldPersistRemote: boolean, nativeStateSource?: object): ShareableRef<TValue>;
}
//# sourceMappingURL=workletsModuleProxy.d.ts.map
import type { ForwardRefExoticComponent, ForwardRefRenderFunction, RefAttributes } from 'react';
export declare function isReactRendering(): boolean;
export declare function isFirstReactRender(): any;
export declare function componentWithRef<T, P = {}>(render: ForwardRefRenderFunction<T, P>): ForwardRefExoticComponent<P & RefAttributes<T>>;
//# sourceMappingURL=reactUtils.d.ts.map
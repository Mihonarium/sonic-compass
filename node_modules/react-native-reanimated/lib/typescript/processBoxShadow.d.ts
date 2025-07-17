import type { OpaqueColorValue } from 'react-native';
import type { StyleProps } from '.';
type ParsedBoxShadow = {
    offsetX: number;
    offsetY: number;
    blurRadius?: number | OpaqueColorValue;
    spreadDistance?: number;
    inset?: boolean;
    color?: string;
};
export declare function processBoxShadow(props: StyleProps): ParsedBoxShadow[] | undefined;
export {};
//# sourceMappingURL=processBoxShadow.d.ts.map
import { warnUnimplementedFilter } from '../../lib/util';
import FilterPrimitive from './FilterPrimitive';
export default class FeComponentTransferFunction extends FilterPrimitive {
  channel = 'UNKNOWN';
  static defaultProps = {
    type: 'identity',
    tableValues: [],
    slope: 1,
    intercept: 0,
    amplitude: 1,
    exponent: 1,
    offset: 0
  };
  render() {
    warnUnimplementedFilter();
    return null;
  }
}
export class FeFuncR extends FeComponentTransferFunction {
  static displayName = 'FeFuncR';
  channel = 'R';
}
export class FeFuncG extends FeComponentTransferFunction {
  static displayName = 'FeFuncG';
  channel = 'G';
}
export class FeFuncB extends FeComponentTransferFunction {
  static displayName = 'FeFuncB';
  channel = 'B';
}
export class FeFuncA extends FeComponentTransferFunction {
  static displayName = 'FeFuncA';
  channel = 'A';
}
//# sourceMappingURL=FeComponentTransferFunction.js.map
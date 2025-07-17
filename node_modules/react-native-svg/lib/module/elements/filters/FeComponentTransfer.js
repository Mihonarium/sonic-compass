import FilterPrimitive from './FilterPrimitive';
import { warnUnimplementedFilter } from '../../lib/util';
export default class FeComponentTransfer extends FilterPrimitive {
  static displayName = 'FeComponentTransfer';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    warnUnimplementedFilter();
    return null;
  }
}
//# sourceMappingURL=FeComponentTransfer.js.map
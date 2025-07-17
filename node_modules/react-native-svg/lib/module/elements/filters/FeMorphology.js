import { warnUnimplementedFilter } from '../../lib/util';
import FilterPrimitive from './FilterPrimitive';
export default class FeMorphology extends FilterPrimitive {
  static displayName = 'FeMorphology';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    warnUnimplementedFilter();
    return null;
  }
}
//# sourceMappingURL=FeMorphology.js.map
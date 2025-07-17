import { warnUnimplementedFilter } from '../../lib/util';
import FilterPrimitive from './FilterPrimitive';
export default class FeSpecularLighting extends FilterPrimitive {
  static displayName = 'FeSpecularLighting';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    warnUnimplementedFilter();
    return null;
  }
}
//# sourceMappingURL=FeSpecularLighting.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _FilterPrimitive = _interopRequireDefault(require("./FilterPrimitive"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class FeMergeNode extends _FilterPrimitive.default {
  static displayName = 'FeMergeNode';

  // Force update parent
  setNativeProps = () => {
    const {
      parent
    } = this.props;
    if (parent) {
      parent.forceUpdate();
    }
  };
  render() {
    return null;
  }
}
exports.default = FeMergeNode;
//# sourceMappingURL=FeMergeNode.js.map
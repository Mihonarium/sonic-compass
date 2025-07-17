"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _FilterPrimitive = _interopRequireDefault(require("./FilterPrimitive"));
var _util = require("../../lib/util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class FeComponentTransfer extends _FilterPrimitive.default {
  static displayName = 'FeComponentTransfer';
  static defaultProps = {
    ...this.defaultPrimitiveProps
  };
  render() {
    (0, _util.warnUnimplementedFilter)();
    return null;
  }
}
exports.default = FeComponentTransfer;
//# sourceMappingURL=FeComponentTransfer.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FeFuncR = exports.FeFuncG = exports.FeFuncB = exports.FeFuncA = void 0;
var _util = require("../../lib/util");
var _FilterPrimitive = _interopRequireDefault(require("./FilterPrimitive"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class FeComponentTransferFunction extends _FilterPrimitive.default {
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
    (0, _util.warnUnimplementedFilter)();
    return null;
  }
}
exports.default = FeComponentTransferFunction;
class FeFuncR extends FeComponentTransferFunction {
  static displayName = 'FeFuncR';
  channel = 'R';
}
exports.FeFuncR = FeFuncR;
class FeFuncG extends FeComponentTransferFunction {
  static displayName = 'FeFuncG';
  channel = 'G';
}
exports.FeFuncG = FeFuncG;
class FeFuncB extends FeComponentTransferFunction {
  static displayName = 'FeFuncB';
  channel = 'B';
}
exports.FeFuncB = FeFuncB;
class FeFuncA extends FeComponentTransferFunction {
  static displayName = 'FeFuncA';
  channel = 'A';
}
exports.FeFuncA = FeFuncA;
//# sourceMappingURL=FeComponentTransferFunction.js.map
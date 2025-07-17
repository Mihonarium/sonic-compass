"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebShape = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _prepare = require("./utils/prepare");
var _convertInt32Color = require("./utils/convertInt32Color");
var _utils = require("./utils");
var _SvgTouchableMixin = _interopRequireDefault(require("../lib/SvgTouchableMixin"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class WebShape extends _react.default.Component {
  prepareProps(props) {
    return props;
  }
  elementRef = /*#__PURE__*/_react.default.createRef();
  lastMergedProps = {};

  /**
   * disclaimer: I am not sure why the props are wrapped in a `style` attribute here, but that's how reanimated calls it
   */
  setNativeProps(props) {
    const merged = Object.assign({}, this.props, this.lastMergedProps, props.style);
    this.lastMergedProps = merged;
    const clean = (0, _prepare.prepare)(this, this.prepareProps(merged));
    const current = this.elementRef.current;
    if (current) {
      for (const cleanAttribute of Object.keys(clean)) {
        const cleanValue = clean[cleanAttribute];
        switch (cleanAttribute) {
          case 'ref':
          case 'children':
            break;
          case 'style':
            // style can be an object here or an array, so we convert it to an array and assign each element
            for (const partialStyle of [].concat(clean.style ?? [])) {
              Object.assign(current.style, partialStyle);
            }
            break;
          case 'fill':
            if (cleanValue && typeof cleanValue === 'object') {
              const value = cleanValue;
              current.setAttribute('fill', (0, _convertInt32Color.convertInt32ColorToRGBA)(value.payload));
            }
            break;
          case 'stroke':
            if (cleanValue && typeof cleanValue === 'object') {
              const value = cleanValue;
              current.setAttribute('stroke', (0, _convertInt32Color.convertInt32ColorToRGBA)(value.payload));
            }
            break;
          default:
            // apply all other incoming prop updates as attributes on the node
            // same logic as in https://github.com/software-mansion/react-native-reanimated/blob/d04720c82f5941532991b235787285d36d717247/src/reanimated2/js-reanimated/index.ts#L38-L39
            // @ts-expect-error TODO: fix this
            current.setAttribute((0, _utils.camelCaseToDashed)(cleanAttribute), cleanValue);
            break;
        }
      }
    }
  }
  constructor(props) {
    super(props);

    // Do not attach touchable mixin handlers if SVG element doesn't have a touchable prop
    if ((0, _utils.hasTouchableProperty)(props)) {
      (0, _SvgTouchableMixin.default)(this);
    }
    this._remeasureMetricsOnActivation = _utils.remeasure.bind(this);
  }
  render() {
    if (!this.tag) {
      throw new Error('When extending `WebShape` you need to overwrite either `tag` or `render`!');
    }
    this.lastMergedProps = {};
    return (0, _reactNative.unstable_createElement)(this.tag, (0, _prepare.prepare)(this, this.prepareProps(this.props)));
  }
}
exports.WebShape = WebShape;
//# sourceMappingURL=WebShape.js.map
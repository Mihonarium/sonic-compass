"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalSvg = LocalSvg;
exports.default = exports.WithLocalSvg = void 0;
exports.getUriFromSource = getUriFromSource;
exports.isUriAnAndroidResourceIdentifier = isUriAnAndroidResourceIdentifier;
exports.loadAndroidRawResource = loadAndroidRawResource;
exports.loadLocalRawResource = void 0;
exports.loadLocalRawResourceAndroid = loadLocalRawResourceAndroid;
exports.loadLocalRawResourceDefault = loadLocalRawResourceDefault;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _reactNative = require("react-native");
var _reactNativeSvg = require("react-native-svg");
var _resolveAssetUri = require("../lib/resolveAssetUri");
var _css = require("./css");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function getUriFromSource(source) {
  const resolvedAssetSource = _reactNative.Platform.OS === 'web' ? (0, _resolveAssetUri.resolveAssetUri)(source) : _reactNative.Image.resolveAssetSource(source);
  return resolvedAssetSource === null || resolvedAssetSource === void 0 ? void 0 : resolvedAssetSource.uri;
}
function loadLocalRawResourceDefault(source) {
  const uri = getUriFromSource(source);
  return (0, _reactNativeSvg.fetchText)(uri);
}
function isUriAnAndroidResourceIdentifier(uri) {
  return typeof uri === 'string' && uri.indexOf('/') <= -1;
}
async function loadAndroidRawResource(uri) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RNSVGRenderableModule =
    // neeeded for new arch
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../fabric/NativeSvgRenderableModule').default;
    return await RNSVGRenderableModule.getRawResource(uri);
  } catch (e) {
    console.error('Error in RawResourceUtils while trying to natively load an Android raw resource: ', e);
    return null;
  }
}
function loadLocalRawResourceAndroid(source) {
  const uri = getUriFromSource(source);
  if (uri && isUriAnAndroidResourceIdentifier(uri)) {
    return loadAndroidRawResource(uri);
  } else {
    return (0, _reactNativeSvg.fetchText)(uri);
  }
}
const loadLocalRawResource = exports.loadLocalRawResource = _reactNative.Platform.OS !== 'android' ? loadLocalRawResourceDefault : loadLocalRawResourceAndroid;
function LocalSvg(props) {
  const {
    asset,
    ...rest
  } = props;
  const [xml, setXml] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    loadLocalRawResource(asset).then(setXml);
  }, [asset]);
  return /*#__PURE__*/React.createElement(_css.SvgCss, _extends({
    xml: xml
  }, rest));
}
class WithLocalSvg extends _react.Component {
  state = {
    xml: null
  };
  componentDidMount() {
    this.load(this.props.asset);
  }
  componentDidUpdate(prevProps) {
    const {
      asset
    } = this.props;
    if (asset !== prevProps.asset) {
      this.load(asset);
    }
  }
  async load(asset) {
    try {
      this.setState({
        xml: asset ? await loadLocalRawResource(asset) : null
      });
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    const {
      props,
      state: {
        xml
      }
    } = this;
    return /*#__PURE__*/React.createElement(_css.SvgWithCss, {
      xml: xml,
      override: props
    });
  }
}
exports.WithLocalSvg = WithLocalSvg;
var _default = exports.default = LocalSvg;
//# sourceMappingURL=LocalSvg.js.map
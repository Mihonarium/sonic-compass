"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extractFeFlood;
exports.extractIn = exports.extractFilter = exports.extractFeMerge = exports.extractFeGaussianBlur = exports.extractFeComposite = exports.extractFeColorMatrix = exports.extractFeBlend = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _extractBrush = _interopRequireDefault(require("./extractBrush"));
var _extractOpacity = _interopRequireDefault(require("./extractOpacity"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const spaceReg = /\s+/;
const extractFilter = props => {
  const {
    x,
    y,
    width,
    height,
    result
  } = props;
  const extracted = {
    x,
    y,
    width,
    height,
    result
  };
  return extracted;
};
exports.extractFilter = extractFilter;
const extractIn = props => {
  if (props.in) {
    return {
      in1: props.in
    };
  }
  return {};
};
exports.extractIn = extractIn;
const extractFeBlend = props => {
  const extracted = {};
  if (props.in2) {
    extracted.in2 = props.in2;
  }
  if (props.mode) {
    extracted.mode = props.mode;
  }
  return extracted;
};
exports.extractFeBlend = extractFeBlend;
const extractFeColorMatrix = props => {
  const extracted = {};
  if (props.values !== undefined) {
    if (Array.isArray(props.values)) {
      extracted.values = props.values.map(num => typeof num === 'number' ? num : parseFloat(num));
    } else if (typeof props.values === 'number') {
      extracted.values = [props.values];
    } else if (typeof props.values === 'string') {
      extracted.values = props.values.split(spaceReg).map(parseFloat).filter(el => !isNaN(el));
    } else {
      console.warn('Invalid value for FeColorMatrix `values` prop');
    }
  }
  if (props.type) {
    extracted.type = props.type;
  }
  return extracted;
};
exports.extractFeColorMatrix = extractFeColorMatrix;
const extractFeComposite = props => {
  const extracted = {
    in1: props.in || '',
    in2: props.in2 || '',
    operator1: props.operator || 'over'
  };
  ['k1', 'k2', 'k3', 'k4'].forEach(key => {
    if (props[key] !== undefined) {
      extracted[key] = Number(props[key]) || 0;
    }
  });
  return extracted;
};
exports.extractFeComposite = extractFeComposite;
const defaultFill = {
  type: 0,
  payload: (0, _reactNative.processColor)('black')
};
function extractFeFlood(props) {
  const extracted = {};
  const {
    floodColor,
    floodOpacity
  } = props;
  if (floodColor != null) {
    extracted.floodColor = !floodColor && typeof floodColor !== 'number' ? defaultFill : (0, _extractBrush.default)(floodColor);
  } else {
    // we want the default value of fill to be black to match the spec
    extracted.floodColor = defaultFill;
  }
  if (floodOpacity != null) {
    extracted.floodOpacity = (0, _extractOpacity.default)(floodOpacity);
  }
  return extracted;
}
const extractFeGaussianBlur = props => {
  const extracted = {};
  if (Array.isArray(props.stdDeviation)) {
    extracted.stdDeviationX = Number(props.stdDeviation[0]) || 0;
    extracted.stdDeviationY = Number(props.stdDeviation[1]) || 0;
  } else if (typeof props.stdDeviation === 'string' && props.stdDeviation.match(spaceReg)) {
    const stdDeviation = props.stdDeviation.split(spaceReg);
    extracted.stdDeviationX = Number(stdDeviation[0]) || 0;
    extracted.stdDeviationY = Number(stdDeviation[1]) || 0;
  } else if (typeof props.stdDeviation === 'number' || typeof props.stdDeviation === 'string' && !props.stdDeviation.match(spaceReg)) {
    extracted.stdDeviationX = Number(props.stdDeviation) || 0;
    extracted.stdDeviationY = Number(props.stdDeviation) || 0;
  }
  if (props.edgeMode) {
    extracted.edgeMode = props.edgeMode;
  }
  return extracted;
};
exports.extractFeGaussianBlur = extractFeGaussianBlur;
const extractFeMerge = (props, parent) => {
  const nodes = [];
  const childArray = props.children ? _react.default.Children.map(props.children, child => /*#__PURE__*/_react.default.cloneElement(child, {
    parent
  })) : [];
  const l = childArray.length;
  for (let i = 0; i < l; i++) {
    const {
      props: {
        in: in1
      }
    } = childArray[i];
    nodes.push(in1 || '');
  }
  return {
    nodes
  };
};
exports.extractFeMerge = extractFeMerge;
//# sourceMappingURL=extractFilter.js.map
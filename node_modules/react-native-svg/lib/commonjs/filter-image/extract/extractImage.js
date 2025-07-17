"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractResizeMode = void 0;
const extractResizeMode = resizeMode => {
  switch (resizeMode) {
    case 'contain':
      return 'xMidYMid meet';
    case 'stretch':
      return 'none';
    case 'center':
      return 'xMidYMid meet';
    default:
      return 'xMidYMid slice';
  }
};
exports.extractResizeMode = extractResizeMode;
//# sourceMappingURL=extractImage.js.map
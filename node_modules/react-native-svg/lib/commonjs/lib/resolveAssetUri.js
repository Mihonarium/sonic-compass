"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveAssetUri = resolveAssetUri;
var _reactNative = require("react-native");
var _registry = require("@react-native/assets-registry/registry");
// @ts-expect-error react-native/assets-registry doesn't export types.

const svgDataUriPattern = /^(data:image\/svg\+xml;utf8,)(.*)/;

// Based on that function: https://github.com/necolas/react-native-web/blob/54c14d64dabd175e8055e1dc92e9196c821f9b7d/packages/react-native-web/src/exports/Image/index.js#L118-L156
function resolveAssetUri(source) {
  let src = {};
  if (typeof source === 'number') {
    // get the URI from the packager
    const asset = (0, _registry.getAssetByID)(source);
    if (asset == null) {
      throw new Error(`Image: asset with ID "${source}" could not be found. Please check the image source or packager.`);
    }
    src = {
      width: asset.width,
      height: asset.height,
      scale: asset.scales[0]
    };
    if (asset.scales.length > 1) {
      const preferredScale = _reactNative.PixelRatio.get();
      // Get the scale which is closest to the preferred scale
      src.scale = asset.scales.reduce((prev, curr) => Math.abs(curr - preferredScale) < Math.abs(prev - preferredScale) ? curr : prev);
    }
    const scaleSuffix = src.scale !== 1 ? `@${src.scale}x` : '';
    src.uri = asset ? `${asset.httpServerLocation}/${asset.name}${scaleSuffix}.${asset.type}` : '';
  } else if (typeof source === 'string') {
    src.uri = source;
  } else if (source && !Array.isArray(source) && typeof source.uri === 'string') {
    src.uri = source.uri;
  }
  if (src.uri) {
    var _src;
    const match = (_src = src) === null || _src === void 0 || (_src = _src.uri) === null || _src === void 0 ? void 0 : _src.match(svgDataUriPattern);
    // inline SVG markup may contain characters (e.g., #, ") that need to be escaped
    if (match) {
      const [, prefix, svg] = match;
      const encodedSvg = encodeURIComponent(svg);
      src.uri = `${prefix}${encodedSvg}`;
      return src;
    }
  }
  return src;
}
//# sourceMappingURL=resolveAssetUri.js.map
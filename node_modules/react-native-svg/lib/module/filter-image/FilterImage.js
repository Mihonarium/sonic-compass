function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { Platform, Image as RNImage, StyleSheet, View } from 'react-native';
import { Filter, Image, Svg } from '../index';
import { resolveAssetUri } from '../lib/resolveAssetUri';
import { getRandomNumber } from '../lib/util';
import { extractFiltersCss, mapFilterToComponent } from './extract/extractFilters';
import { extractResizeMode } from './extract/extractImage';
export const FilterImage = props => {
  const {
    filters = [],
    source,
    style,
    ...imageProps
  } = props;
  const {
    filter: stylesFilter,
    ...styles
  } = StyleSheet.flatten(style ?? {});
  const extractedFilters = [...filters, ...extractFiltersCss(stylesFilter)];
  const filterId = React.useMemo(() => `RNSVG-${getRandomNumber()}`, []);
  if (!source) return null;
  const src = Platform.OS === 'web' ? resolveAssetUri(source) : RNImage.resolveAssetSource(source);
  const width = props.width || (styles === null || styles === void 0 ? void 0 : styles.width) || (src === null || src === void 0 ? void 0 : src.width);
  const height = props.height || (styles === null || styles === void 0 ? void 0 : styles.height) || (src === null || src === void 0 ? void 0 : src.height);
  const preserveAspectRatio = extractResizeMode(props.resizeMode);
  return /*#__PURE__*/React.createElement(View, {
    style: [styles, {
      width,
      height,
      overflow: 'hidden'
    }]
  }, /*#__PURE__*/React.createElement(Svg, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(Filter, {
    id: filterId
  }, extractedFilters.map(mapFilterToComponent)), /*#__PURE__*/React.createElement(Image, _extends({}, imageProps, {
    href: props.src || props.source,
    width: "100%",
    height: "100%",
    preserveAspectRatio: preserveAspectRatio,
    filter: extractedFilters.length > 0 ? `url(#${filterId})` : undefined
  }))));
};
//# sourceMappingURL=FilterImage.js.map
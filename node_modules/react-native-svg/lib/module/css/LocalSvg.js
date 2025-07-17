function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { useState, useEffect, Component } from 'react';
import { Image, Platform } from 'react-native';
import { fetchText } from 'react-native-svg';
import { resolveAssetUri } from '../lib/resolveAssetUri';
import { SvgCss, SvgWithCss } from './css';
export function getUriFromSource(source) {
  const resolvedAssetSource = Platform.OS === 'web' ? resolveAssetUri(source) : Image.resolveAssetSource(source);
  return resolvedAssetSource === null || resolvedAssetSource === void 0 ? void 0 : resolvedAssetSource.uri;
}
export function loadLocalRawResourceDefault(source) {
  const uri = getUriFromSource(source);
  return fetchText(uri);
}
export function isUriAnAndroidResourceIdentifier(uri) {
  return typeof uri === 'string' && uri.indexOf('/') <= -1;
}
export async function loadAndroidRawResource(uri) {
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
export function loadLocalRawResourceAndroid(source) {
  const uri = getUriFromSource(source);
  if (uri && isUriAnAndroidResourceIdentifier(uri)) {
    return loadAndroidRawResource(uri);
  } else {
    return fetchText(uri);
  }
}
export const loadLocalRawResource = Platform.OS !== 'android' ? loadLocalRawResourceDefault : loadLocalRawResourceAndroid;
export function LocalSvg(props) {
  const {
    asset,
    ...rest
  } = props;
  const [xml, setXml] = useState(null);
  useEffect(() => {
    loadLocalRawResource(asset).then(setXml);
  }, [asset]);
  return /*#__PURE__*/React.createElement(SvgCss, _extends({
    xml: xml
  }, rest));
}
export class WithLocalSvg extends Component {
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
    return /*#__PURE__*/React.createElement(SvgWithCss, {
      xml: xml,
      override: props
    });
  }
}
export default LocalSvg;
//# sourceMappingURL=LocalSvg.js.map
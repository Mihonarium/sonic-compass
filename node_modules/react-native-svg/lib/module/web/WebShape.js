import React from 'react';
import {
// @ts-ignore it is not seen in exports
unstable_createElement as createElement } from 'react-native';
import { prepare } from './utils/prepare';
import { convertInt32ColorToRGBA } from './utils/convertInt32Color';
import { camelCaseToDashed, hasTouchableProperty, remeasure } from './utils';
import SvgTouchableMixin from '../lib/SvgTouchableMixin';
export class WebShape extends React.Component {
  prepareProps(props) {
    return props;
  }
  elementRef = /*#__PURE__*/React.createRef();
  lastMergedProps = {};

  /**
   * disclaimer: I am not sure why the props are wrapped in a `style` attribute here, but that's how reanimated calls it
   */
  setNativeProps(props) {
    const merged = Object.assign({}, this.props, this.lastMergedProps, props.style);
    this.lastMergedProps = merged;
    const clean = prepare(this, this.prepareProps(merged));
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
              current.setAttribute('fill', convertInt32ColorToRGBA(value.payload));
            }
            break;
          case 'stroke':
            if (cleanValue && typeof cleanValue === 'object') {
              const value = cleanValue;
              current.setAttribute('stroke', convertInt32ColorToRGBA(value.payload));
            }
            break;
          default:
            // apply all other incoming prop updates as attributes on the node
            // same logic as in https://github.com/software-mansion/react-native-reanimated/blob/d04720c82f5941532991b235787285d36d717247/src/reanimated2/js-reanimated/index.ts#L38-L39
            // @ts-expect-error TODO: fix this
            current.setAttribute(camelCaseToDashed(cleanAttribute), cleanValue);
            break;
        }
      }
    }
  }
  constructor(props) {
    super(props);

    // Do not attach touchable mixin handlers if SVG element doesn't have a touchable prop
    if (hasTouchableProperty(props)) {
      SvgTouchableMixin(this);
    }
    this._remeasureMetricsOnActivation = remeasure.bind(this);
  }
  render() {
    if (!this.tag) {
      throw new Error('When extending `WebShape` you need to overwrite either `tag` or `render`!');
    }
    this.lastMergedProps = {};
    return createElement(this.tag, prepare(this, this.prepareProps(this.props)));
  }
}
//# sourceMappingURL=WebShape.js.map
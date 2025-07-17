import { encodeSvg, getBoundingClientRect } from './web/utils';
import { WebShape } from './web/WebShape';
export class Circle extends WebShape {
  tag = 'circle';
}
export class ClipPath extends WebShape {
  tag = 'clipPath';
}
export class Defs extends WebShape {
  tag = 'defs';
}
export class Ellipse extends WebShape {
  tag = 'ellipse';
}
export class FeBlend extends WebShape {
  tag = 'feBlend';
}
export class FeColorMatrix extends WebShape {
  tag = 'feColorMatrix';
}
export class FeComponentTransfer extends WebShape {
  tag = 'feComponentTransfer';
}
export class FeComposite extends WebShape {
  tag = 'feComposite';
}
export class FeConvolveMatrix extends WebShape {
  tag = 'feConvolveMatrix';
}
export class FeDiffuseLighting extends WebShape {
  tag = 'feDiffuseLighting';
}
export class FeDisplacementMap extends WebShape {
  tag = 'feDisplacementMap';
}
export class FeDistantLight extends WebShape {
  tag = 'feDistantLight';
}
export class FeDropShadow extends WebShape {
  tag = 'feDropShadow';
}
export class FeFlood extends WebShape {
  tag = 'feFlood';
}
export class FeFuncA extends WebShape {
  tag = 'feFuncA';
}
export class FeFuncB extends WebShape {
  tag = 'feFuncB';
}
export class FeFuncG extends WebShape {
  tag = 'feFuncG';
}
export class FeFuncR extends WebShape {
  tag = 'feFuncR';
}
export class FeGaussianBlur extends WebShape {
  tag = 'feGaussianBlur';
}
export class FeImage extends WebShape {
  tag = 'feImage';
}
export class FeMerge extends WebShape {
  tag = 'feMerge';
}
export class FeMergeNode extends WebShape {
  tag = 'feMergeNode';
}
export class FeMorphology extends WebShape {
  tag = 'feMorphology';
}
export class FeOffset extends WebShape {
  tag = 'feOffset';
}
export class FePointLight extends WebShape {
  tag = 'fePointLight';
}
export class FeSpecularLighting extends WebShape {
  tag = 'feSpecularLighting';
}
export class FeSpotLight extends WebShape {
  tag = 'feSpotLight';
}
export class FeTile extends WebShape {
  tag = 'feTile';
}
export class FeTurbulence extends WebShape {
  tag = 'feTurbulence';
}
export class Filter extends WebShape {
  tag = 'filter';
}
export class ForeignObject extends WebShape {
  tag = 'foreignObject';
}
export class G extends WebShape {
  tag = 'g';
  prepareProps(props) {
    const {
      x,
      y,
      ...rest
    } = props;
    if ((x || y) && !rest.translate) {
      rest.translate = `${x || 0}, ${y || 0}`;
    }
    return rest;
  }
}
export class Image extends WebShape {
  tag = 'image';
}
export class Line extends WebShape {
  tag = 'line';
}
export class LinearGradient extends WebShape {
  tag = 'linearGradient';
}
export class Marker extends WebShape {
  tag = 'marker';
}
export class Mask extends WebShape {
  tag = 'mask';
}
export class Path extends WebShape {
  tag = 'path';
}
export class Pattern extends WebShape {
  tag = 'pattern';
}
export class Polygon extends WebShape {
  tag = 'polygon';
}
export class Polyline extends WebShape {
  tag = 'polyline';
}
export class RadialGradient extends WebShape {
  tag = 'radialGradient';
}
export class Rect extends WebShape {
  tag = 'rect';
}
export class Stop extends WebShape {
  tag = 'stop';
}
export class Svg extends WebShape {
  tag = 'svg';
  toDataURL(callback, options = {}) {
    const ref = this.elementRef.current;
    if (ref === null) {
      return;
    }
    const rect = getBoundingClientRect(ref);
    const width = Number(options.width) || rect.width;
    const height = Number(options.height) || rect.height;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.appendChild(ref.cloneNode(true));
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context === null || context === void 0 || context.drawImage(img, 0, 0);
      callback(canvas.toDataURL().replace('data:image/png;base64,', ''));
    };
    img.src = `data:image/svg+xml;utf8,${encodeSvg(new window.XMLSerializer().serializeToString(svg))}`;
  }
}
export class Symbol extends WebShape {
  tag = 'symbol';
}
export class TSpan extends WebShape {
  tag = 'tspan';
}
export class Text extends WebShape {
  tag = 'text';
}
export class TextPath extends WebShape {
  tag = 'textPath';
}
export class Use extends WebShape {
  tag = 'use';
}
export default Svg;
//# sourceMappingURL=elements.web.js.map
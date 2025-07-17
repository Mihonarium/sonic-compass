"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Use = exports.TextPath = exports.Text = exports.TSpan = exports.Symbol = exports.Svg = exports.Stop = exports.Rect = exports.RadialGradient = exports.Polyline = exports.Polygon = exports.Pattern = exports.Path = exports.Mask = exports.Marker = exports.LinearGradient = exports.Line = exports.Image = exports.G = exports.ForeignObject = exports.Filter = exports.FeTurbulence = exports.FeTile = exports.FeSpotLight = exports.FeSpecularLighting = exports.FePointLight = exports.FeOffset = exports.FeMorphology = exports.FeMergeNode = exports.FeMerge = exports.FeImage = exports.FeGaussianBlur = exports.FeFuncR = exports.FeFuncG = exports.FeFuncB = exports.FeFuncA = exports.FeFlood = exports.FeDropShadow = exports.FeDistantLight = exports.FeDisplacementMap = exports.FeDiffuseLighting = exports.FeConvolveMatrix = exports.FeComposite = exports.FeComponentTransfer = exports.FeColorMatrix = exports.FeBlend = exports.Ellipse = exports.Defs = exports.ClipPath = exports.Circle = void 0;
var _utils = require("./web/utils");
var _WebShape = require("./web/WebShape");
class Circle extends _WebShape.WebShape {
  tag = 'circle';
}
exports.Circle = Circle;
class ClipPath extends _WebShape.WebShape {
  tag = 'clipPath';
}
exports.ClipPath = ClipPath;
class Defs extends _WebShape.WebShape {
  tag = 'defs';
}
exports.Defs = Defs;
class Ellipse extends _WebShape.WebShape {
  tag = 'ellipse';
}
exports.Ellipse = Ellipse;
class FeBlend extends _WebShape.WebShape {
  tag = 'feBlend';
}
exports.FeBlend = FeBlend;
class FeColorMatrix extends _WebShape.WebShape {
  tag = 'feColorMatrix';
}
exports.FeColorMatrix = FeColorMatrix;
class FeComponentTransfer extends _WebShape.WebShape {
  tag = 'feComponentTransfer';
}
exports.FeComponentTransfer = FeComponentTransfer;
class FeComposite extends _WebShape.WebShape {
  tag = 'feComposite';
}
exports.FeComposite = FeComposite;
class FeConvolveMatrix extends _WebShape.WebShape {
  tag = 'feConvolveMatrix';
}
exports.FeConvolveMatrix = FeConvolveMatrix;
class FeDiffuseLighting extends _WebShape.WebShape {
  tag = 'feDiffuseLighting';
}
exports.FeDiffuseLighting = FeDiffuseLighting;
class FeDisplacementMap extends _WebShape.WebShape {
  tag = 'feDisplacementMap';
}
exports.FeDisplacementMap = FeDisplacementMap;
class FeDistantLight extends _WebShape.WebShape {
  tag = 'feDistantLight';
}
exports.FeDistantLight = FeDistantLight;
class FeDropShadow extends _WebShape.WebShape {
  tag = 'feDropShadow';
}
exports.FeDropShadow = FeDropShadow;
class FeFlood extends _WebShape.WebShape {
  tag = 'feFlood';
}
exports.FeFlood = FeFlood;
class FeFuncA extends _WebShape.WebShape {
  tag = 'feFuncA';
}
exports.FeFuncA = FeFuncA;
class FeFuncB extends _WebShape.WebShape {
  tag = 'feFuncB';
}
exports.FeFuncB = FeFuncB;
class FeFuncG extends _WebShape.WebShape {
  tag = 'feFuncG';
}
exports.FeFuncG = FeFuncG;
class FeFuncR extends _WebShape.WebShape {
  tag = 'feFuncR';
}
exports.FeFuncR = FeFuncR;
class FeGaussianBlur extends _WebShape.WebShape {
  tag = 'feGaussianBlur';
}
exports.FeGaussianBlur = FeGaussianBlur;
class FeImage extends _WebShape.WebShape {
  tag = 'feImage';
}
exports.FeImage = FeImage;
class FeMerge extends _WebShape.WebShape {
  tag = 'feMerge';
}
exports.FeMerge = FeMerge;
class FeMergeNode extends _WebShape.WebShape {
  tag = 'feMergeNode';
}
exports.FeMergeNode = FeMergeNode;
class FeMorphology extends _WebShape.WebShape {
  tag = 'feMorphology';
}
exports.FeMorphology = FeMorphology;
class FeOffset extends _WebShape.WebShape {
  tag = 'feOffset';
}
exports.FeOffset = FeOffset;
class FePointLight extends _WebShape.WebShape {
  tag = 'fePointLight';
}
exports.FePointLight = FePointLight;
class FeSpecularLighting extends _WebShape.WebShape {
  tag = 'feSpecularLighting';
}
exports.FeSpecularLighting = FeSpecularLighting;
class FeSpotLight extends _WebShape.WebShape {
  tag = 'feSpotLight';
}
exports.FeSpotLight = FeSpotLight;
class FeTile extends _WebShape.WebShape {
  tag = 'feTile';
}
exports.FeTile = FeTile;
class FeTurbulence extends _WebShape.WebShape {
  tag = 'feTurbulence';
}
exports.FeTurbulence = FeTurbulence;
class Filter extends _WebShape.WebShape {
  tag = 'filter';
}
exports.Filter = Filter;
class ForeignObject extends _WebShape.WebShape {
  tag = 'foreignObject';
}
exports.ForeignObject = ForeignObject;
class G extends _WebShape.WebShape {
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
exports.G = G;
class Image extends _WebShape.WebShape {
  tag = 'image';
}
exports.Image = Image;
class Line extends _WebShape.WebShape {
  tag = 'line';
}
exports.Line = Line;
class LinearGradient extends _WebShape.WebShape {
  tag = 'linearGradient';
}
exports.LinearGradient = LinearGradient;
class Marker extends _WebShape.WebShape {
  tag = 'marker';
}
exports.Marker = Marker;
class Mask extends _WebShape.WebShape {
  tag = 'mask';
}
exports.Mask = Mask;
class Path extends _WebShape.WebShape {
  tag = 'path';
}
exports.Path = Path;
class Pattern extends _WebShape.WebShape {
  tag = 'pattern';
}
exports.Pattern = Pattern;
class Polygon extends _WebShape.WebShape {
  tag = 'polygon';
}
exports.Polygon = Polygon;
class Polyline extends _WebShape.WebShape {
  tag = 'polyline';
}
exports.Polyline = Polyline;
class RadialGradient extends _WebShape.WebShape {
  tag = 'radialGradient';
}
exports.RadialGradient = RadialGradient;
class Rect extends _WebShape.WebShape {
  tag = 'rect';
}
exports.Rect = Rect;
class Stop extends _WebShape.WebShape {
  tag = 'stop';
}
exports.Stop = Stop;
class Svg extends _WebShape.WebShape {
  tag = 'svg';
  toDataURL(callback, options = {}) {
    const ref = this.elementRef.current;
    if (ref === null) {
      return;
    }
    const rect = (0, _utils.getBoundingClientRect)(ref);
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
    img.src = `data:image/svg+xml;utf8,${(0, _utils.encodeSvg)(new window.XMLSerializer().serializeToString(svg))}`;
  }
}
exports.Svg = Svg;
class Symbol extends _WebShape.WebShape {
  tag = 'symbol';
}
exports.Symbol = Symbol;
class TSpan extends _WebShape.WebShape {
  tag = 'tspan';
}
exports.TSpan = TSpan;
class Text extends _WebShape.WebShape {
  tag = 'text';
}
exports.Text = Text;
class TextPath extends _WebShape.WebShape {
  tag = 'textPath';
}
exports.TextPath = TextPath;
class Use extends _WebShape.WebShape {
  tag = 'use';
}
exports.Use = Use;
var _default = exports.default = Svg;
//# sourceMappingURL=elements.web.js.map
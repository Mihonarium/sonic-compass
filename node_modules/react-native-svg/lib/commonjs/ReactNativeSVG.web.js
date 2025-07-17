"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  camelCase: true,
  parse: true,
  SvgAst: true,
  SvgFromUri: true,
  SvgFromXml: true,
  SvgUri: true,
  SvgXml: true,
  fetchText: true,
  inlineStyles: true,
  loadLocalRawResource: true,
  LocalSvg: true,
  SvgCss: true,
  SvgCssUri: true,
  SvgWithCss: true,
  SvgWithCssUri: true,
  WithLocalSvg: true
};
Object.defineProperty(exports, "LocalSvg", {
  enumerable: true,
  get: function () {
    return _deprecated.LocalSvg;
  }
});
Object.defineProperty(exports, "SvgAst", {
  enumerable: true,
  get: function () {
    return _xml.SvgAst;
  }
});
Object.defineProperty(exports, "SvgCss", {
  enumerable: true,
  get: function () {
    return _deprecated.SvgCss;
  }
});
Object.defineProperty(exports, "SvgCssUri", {
  enumerable: true,
  get: function () {
    return _deprecated.SvgCssUri;
  }
});
Object.defineProperty(exports, "SvgFromUri", {
  enumerable: true,
  get: function () {
    return _xml.SvgFromUri;
  }
});
Object.defineProperty(exports, "SvgFromXml", {
  enumerable: true,
  get: function () {
    return _xml.SvgFromXml;
  }
});
Object.defineProperty(exports, "SvgUri", {
  enumerable: true,
  get: function () {
    return _xml.SvgUri;
  }
});
Object.defineProperty(exports, "SvgWithCss", {
  enumerable: true,
  get: function () {
    return _deprecated.SvgWithCss;
  }
});
Object.defineProperty(exports, "SvgWithCssUri", {
  enumerable: true,
  get: function () {
    return _deprecated.SvgWithCssUri;
  }
});
Object.defineProperty(exports, "SvgXml", {
  enumerable: true,
  get: function () {
    return _xml.SvgXml;
  }
});
Object.defineProperty(exports, "WithLocalSvg", {
  enumerable: true,
  get: function () {
    return _deprecated.WithLocalSvg;
  }
});
Object.defineProperty(exports, "camelCase", {
  enumerable: true,
  get: function () {
    return _xml.camelCase;
  }
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return _elements.default;
  }
});
Object.defineProperty(exports, "fetchText", {
  enumerable: true,
  get: function () {
    return _fetchData.fetchText;
  }
});
Object.defineProperty(exports, "inlineStyles", {
  enumerable: true,
  get: function () {
    return _deprecated.inlineStyles;
  }
});
Object.defineProperty(exports, "loadLocalRawResource", {
  enumerable: true,
  get: function () {
    return _deprecated.loadLocalRawResource;
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function () {
    return _xml.parse;
  }
});
var _xml = require("./xml");
var _fetchData = require("./utils/fetchData");
var _deprecated = require("./deprecated");
var _types = require("./lib/extract/types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
var _elements = _interopRequireWildcard(require("./elements"));
Object.keys(_elements).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _elements[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _elements[key];
    }
  });
});
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
//# sourceMappingURL=ReactNativeSVG.web.js.map
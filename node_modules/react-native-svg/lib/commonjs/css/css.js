"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvgCss = SvgCss;
exports.SvgCssUri = SvgCssUri;
exports.inlineStyles = exports.SvgWithCssUri = exports.SvgWithCss = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _reactNativeSvg = require("react-native-svg");
var _cssTree = _interopRequireWildcard(require("css-tree"));
var _cssSelect = _interopRequireDefault(require("css-select"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const err = console.error.bind(console);

/*
 * Style element inlining experiment based on SVGO
 * https://github.com/svg/svgo/blob/11f9c797411a8de966aacc4cb83dbb3e471757bc/plugins/inlineStyles.js
 * */

/**
 * DOMUtils API for rnsvg AST (used by css-select)
 */
// is the node a tag?
// isTag: ( node:Node ) => isTag:Boolean
function isTag(node) {
  return typeof node === 'object';
}

// get the parent of the node
// getParent: ( node:Node ) => parentNode:Node
// returns null when no parent exists
function getParent(node) {
  return typeof node === 'object' && node.parent || null;
}

// get the node's children
// getChildren: ( node:Node ) => children:[Node]
function getChildren(node) {
  return typeof node === 'object' && node.children || [];
}

// get the name of the tag'
// getName: ( elem:ElementNode ) => tagName:String
function getName(elem) {
  return elem.tag;
}

// get the text content of the node, and its children if it has any
// getText: ( node:Node ) => text:String
// returns empty string when there is no text
function getText(_node) {
  return '';
}

// get the attribute value
// getAttributeValue: ( elem:ElementNode, name:String ) => value:String
// returns null when attribute doesn't exist
function getAttributeValue(elem, name) {
  return elem.props[name] || null;
}

// takes an array of nodes, and removes any duplicates, as well as any nodes
// whose ancestors are also in the array
function removeSubsets(nodes) {
  let idx = nodes.length;
  let node;
  let ancestor;
  let replace;

  // Check if each node (or one of its ancestors) is already contained in the
  // array.
  while (--idx > -1) {
    node = ancestor = nodes[idx];

    // Temporarily remove the node under consideration
    delete nodes[idx];
    replace = true;
    while (ancestor) {
      if (nodes.includes(ancestor)) {
        replace = false;
        nodes.splice(idx, 1);
        break;
      }
      ancestor = typeof ancestor === 'object' && ancestor.parent || null;
    }

    // If the node has been found to be unique, re-insert it.
    if (replace) {
      nodes[idx] = node;
    }
  }
  return nodes;
}

// does at least one of passed element nodes pass the test predicate?
function existsOne(predicate, elems) {
  return elems.some(elem => typeof elem === 'object' && (predicate(elem) || existsOne(predicate, elem.children)));
}

/*
  get the siblings of the node. Note that unlike jQuery's `siblings` method,
  this is expected to include the current node as well
*/
function getSiblings(node) {
  const parent = typeof node === 'object' && node.parent;
  return parent && parent.children || [];
}

// does the element have the named attribute?
function hasAttrib(elem, name) {
  return Object.prototype.hasOwnProperty.call(elem.props, name);
}

// finds the first node in the array that matches the test predicate, or one
// of its children
function findOne(predicate, elems) {
  let elem = null;
  for (let i = 0, l = elems.length; i < l && !elem; i++) {
    const node = elems[i];
    if (typeof node === 'string') {
      /* empty */
    } else if (predicate(node)) {
      elem = node;
    } else {
      const {
        children
      } = node;
      if (children.length !== 0) {
        elem = findOne(predicate, children);
      }
    }
  }
  return elem;
}

// finds all of the element nodes in the array that match the test predicate,
// as well as any of their children that match it
function findAll(predicate, nodes, result = []) {
  for (let i = 0, j = nodes.length; i < j; i++) {
    const node = nodes[i];
    if (typeof node !== 'object') {
      continue;
    }
    if (predicate(node)) {
      result.push(node);
    }
    const {
      children
    } = node;
    if (children.length !== 0) {
      findAll(predicate, children, result);
    }
  }
  return result;
}
const cssSelectOpts = {
  xmlMode: true,
  adapter: {
    removeSubsets,
    existsOne,
    getSiblings,
    hasAttrib,
    findOne,
    findAll,
    isTag,
    getParent,
    getChildren,
    getName,
    getText,
    getAttributeValue
  }
};
/**
 * Flatten a CSS AST to a selectors list.
 *
 * @param {Object} cssAst css-tree AST to flatten
 * @param {Array} selectors
 */
function flattenToSelectors(cssAst, selectors) {
  _cssTree.default.walk(cssAst, {
    visit: 'Rule',
    enter(rule) {
      const {
        type,
        prelude
      } = rule;
      if (type !== 'Rule') {
        return;
      }
      const atrule = this.atrule;
      prelude.children.each((node, item) => {
        const {
          children
        } = node;
        const pseudos = [];
        selectors.push({
          item,
          atrule,
          rule,
          pseudos
        });
        children.each(({
          type: childType
        }, pseudoItem, list) => {
          if (childType === 'PseudoClassSelector' || childType === 'PseudoElementSelector') {
            pseudos.push({
              item: pseudoItem,
              list
            });
          }
        });
      });
    }
  });
}

/**
 * Filter selectors by Media Query.
 *
 * @param {Array} selectors to filter
 * @return {Array} Filtered selectors that match the passed media queries
 */
function filterByMqs(selectors) {
  return selectors.filter(({
    atrule
  }) => {
    if (atrule === null) {
      return true;
    }
    const {
      name,
      prelude
    } = atrule;
    const atPrelude = prelude;
    const first = atPrelude && atPrelude.children.first();
    const mq = first && first.type === 'MediaQueryList';
    const query = mq ? _cssTree.default.generate(atPrelude) : name;
    return useMqs.includes(query);
  });
}
// useMqs Array with strings of media queries that should pass (<name> <expression>)
const useMqs = ['', 'screen'];

/**
 * Filter selectors by the pseudo-elements and/or -classes they contain.
 *
 * @param {Array} selectors to filter
 * @return {Array} Filtered selectors that match the passed pseudo-elements and/or -classes
 */
function filterByPseudos(selectors) {
  return selectors.filter(({
    pseudos
  }) => usePseudos.includes(_cssTree.default.generate({
    type: 'Selector',
    children: new _cssTree.List().fromArray(pseudos.map(pseudo => pseudo.item.data))
  })));
}
// usePseudos Array with strings of single or sequence of pseudo-elements and/or -classes that should pass
const usePseudos = [''];

/**
 * Remove pseudo-elements and/or -classes from the selectors for proper matching.
 *
 * @param {Array} selectors to clean
 * @return {Array} Selectors without pseudo-elements and/or -classes
 */
function cleanPseudos(selectors) {
  selectors.forEach(({
    pseudos
  }) => pseudos.forEach(pseudo => pseudo.list.remove(pseudo.item)));
}
function specificity(selector) {
  let A = 0;
  let B = 0;
  let C = 0;
  selector.children.each(function walk(node) {
    switch (node.type) {
      case 'SelectorList':
      case 'Selector':
        node.children.each(walk);
        break;
      case 'IdSelector':
        A++;
        break;
      case 'ClassSelector':
      case 'AttributeSelector':
        B++;
        break;
      case 'PseudoClassSelector':
        switch (node.name.toLowerCase()) {
          case 'not':
            {
              const children = node.children;
              children && children.each(walk);
              break;
            }
          case 'before':
          case 'after':
          case 'first-line':
          case 'first-letter':
            C++;
            break;

          // TODO: support for :nth-*(.. of <SelectorList>), :matches(), :has()

          default:
            B++;
        }
        break;
      case 'PseudoElementSelector':
        C++;
        break;
      case 'TypeSelector':
        {
          // ignore universal selector
          const {
            name
          } = node;
          if (name.charAt(name.length - 1) !== '*') {
            C++;
          }
          break;
        }
    }
  });
  return [A, B, C];
}

/**
 * Compares two selector specificities.
 * extracted from https://github.com/keeganstreet/specificity/blob/master/specificity.js#L211
 *
 * @param {Array} aSpecificity Specificity of selector A
 * @param {Array} bSpecificity Specificity of selector B
 * @return {Number} Score of selector specificity A compared to selector specificity B
 */
function compareSpecificity(aSpecificity, bSpecificity) {
  for (let i = 0; i < 4; i += 1) {
    if (aSpecificity[i] < bSpecificity[i]) {
      return -1;
    } else if (aSpecificity[i] > bSpecificity[i]) {
      return 1;
    }
  }
  return 0;
}
function selectorWithSpecificity(selector) {
  return {
    selector,
    specificity: specificity(selector.item.data)
  };
}

/**
 * Compare two simple selectors.
 *
 * @param {Object} a Simple selector A
 * @param {Object} b Simple selector B
 * @return {Number} Score of selector A compared to selector B
 */
function bySelectorSpecificity(a, b) {
  return compareSpecificity(a.specificity, b.specificity);
}

// Run a single pass with the given chunk size.
function pass(arr, len, chk, result) {
  // Step size / double chunk size.
  const dbl = chk * 2;
  // Bounds of the left and right chunks.
  let l, r, e;
  // Iterators over the left and right chunk.
  let li, ri;

  // Iterate over pairs of chunks.
  let i = 0;
  for (l = 0; l < len; l += dbl) {
    r = l + chk;
    e = r + chk;
    if (r > len) {
      r = len;
    }
    if (e > len) {
      e = len;
    }

    // Iterate both chunks in parallel.
    li = l;
    ri = r;
    while (true) {
      // Compare the chunks.
      if (li < r && ri < e) {
        // This works for a regular `sort()` compatible comparator,
        // but also for a simple comparator like: `a > b`
        if (bySelectorSpecificity(arr[li], arr[ri]) <= 0) {
          result[i++] = arr[li++];
        } else {
          result[i++] = arr[ri++];
        }
      }
      // Nothing to compare, just flush what's left.
      else if (li < r) {
        result[i++] = arr[li++];
      } else if (ri < e) {
        result[i++] = arr[ri++];
      }
      // Both iterators are at the chunk ends.
      else {
        break;
      }
    }
  }
}

// Execute the sort using the input array and a second buffer as work space.
// Returns one of those two, containing the final result.
function exec(arr, len) {
  // Rather than dividing input, simply iterate chunks of 1, 2, 4, 8, etc.
  // Chunks are the size of the left or right hand in merge sort.
  // Stop when the left-hand covers all of the array.
  let buffer = new Array(len);
  for (let chk = 1; chk < len; chk *= 2) {
    pass(arr, len, chk, buffer);
    const tmp = arr;
    arr = buffer;
    buffer = tmp;
  }
  return arr;
}

/**
 * Sort selectors stably by their specificity.
 *
 * @param {Array} selectors to be sorted
 * @return {Array} Stable sorted selectors
 */
function sortSelectors(selectors) {
  // Short-circuit when there's nothing to sort.
  const len = selectors.length;
  if (len <= 1) {
    return selectors;
  }
  const specs = selectors.map(selectorWithSpecificity);
  return exec(specs, len).map(s => s.selector);
}
const declarationParseProps = {
  context: 'declarationList',
  parseValue: false
};
function CSSStyleDeclaration(ast) {
  const {
    props,
    styles
  } = ast;
  if (!props.style) {
    props.style = {};
  }
  const style = props.style;
  const priority = new Map();
  ast.style = style;
  ast.priority = priority;
  if (!styles || styles.length === 0) {
    return;
  }
  try {
    const declarations = _cssTree.default.parse(styles, declarationParseProps);
    declarations.children.each(node => {
      try {
        const {
          property,
          value,
          important
        } = node;
        const name = property.trim();
        priority.set(name, important);
        style[(0, _reactNativeSvg.camelCase)(name)] = _cssTree.default.generate(value).trim();
      } catch (styleError) {
        if (styleError instanceof Error && styleError.message !== 'Unknown node type: undefined') {
          console.warn("Warning: Parse error when parsing inline styles, style properties of this element cannot be used. The raw styles can still be get/set using .attr('style').value. Error details: " + styleError);
        }
      }
    });
  } catch (parseError) {
    console.warn("Warning: Parse error when parsing inline styles, style properties of this element cannot be used. The raw styles can still be get/set using .attr('style').value. Error details: " + parseError);
  }
}
function initStyle(selectedEl) {
  if (!selectedEl.style) {
    CSSStyleDeclaration(selectedEl);
  }
  return selectedEl;
}

/**
 * Find the closest ancestor of the current element.
 * @param node
 * @param elemName
 * @return {?Object}
 */
function closestElem(node, elemName) {
  let elem = node;
  while ((elem = elem.parent) && elem.tag !== elemName) {
    /* empty */
  }
  return elem;
}
const parseProps = {
  parseValue: false,
  parseCustomProperty: false
};

/**
 * Moves + merges styles from style elements to element styles
 *
 * Options
 *   useMqs (default: ['', 'screen'])
 *     what media queries to be used
 *     empty string element for styles outside media queries
 *
 *   usePseudos (default: [''])
 *     what pseudo-classes/-elements to be used
 *     empty string element for all non-pseudo-classes and/or -elements
 *
 * @param {Object} document document element
 *
 * @author strarsis <strarsis@gmail.com>
 * @author modified by: msand <msand@abo.fi>
 */

function extractVariables(stylesheet) {
  const variables = new Map();
  _cssTree.default.walk(stylesheet, {
    visit: 'Declaration',
    enter(node) {
      const {
        property,
        value
      } = node;
      if (property.startsWith('--')) {
        const variableName = property.trim();
        const variableValue = _cssTree.default.generate(value).trim();
        variables.set(variableName, variableValue);
      }
    }
  });
  return variables;
}
function resolveVariables(value, variables) {
  if (value === undefined) {
    return '';
  }
  const valueStr = typeof value === 'string' ? value : _cssTree.default.generate(value);
  return valueStr.replace(/var\((--[^,)]+)(?:,\s*([^)]+))?\)/g, (_, variableName, fallback) => {
    const resolvedValue = variables.get(variableName);
    if (resolvedValue !== undefined) {
      return resolveVariables(resolvedValue, variables);
    }
    return fallback ? resolveVariables(fallback, variables) : '';
  });
}
const propsToResolve = ['color', 'fill', 'floodColor', 'lightingColor', 'stopColor', 'stroke'];
const resolveElementVariables = (element, variables) => propsToResolve.forEach(prop => {
  const value = element.props[prop];
  if (value && value.startsWith('var(')) {
    element.props[prop] = resolveVariables(value, variables);
  }
});
const inlineStyles = exports.inlineStyles = function inlineStyles(document) {
  // collect <style/>s
  const styleElements = (0, _cssSelect.default)('style', document, cssSelectOpts);

  // no <styles/>s, nothing to do
  if (styleElements.length === 0) {
    return document;
  }
  const selectors = [];
  let variables = new Map();
  for (const element of styleElements) {
    const {
      children
    } = element;
    if (!children.length || closestElem(element, 'foreignObject')) {
      // skip empty <style/>s or <foreignObject> content.
      continue;
    }

    // collect <style/>s and their css ast
    try {
      const styleString = children.join('');
      const stylesheet = _cssTree.default.parse(styleString, parseProps);
      variables = extractVariables(stylesheet);
      flattenToSelectors(stylesheet, selectors);
    } catch (parseError) {
      console.warn('Warning: Parse error of styles of <style/> element, skipped. Error details: ' + parseError);
    }
  }

  // filter for mediaqueries to be used or without any mediaquery
  const selectorsMq = filterByMqs(selectors);

  // filter for pseudo elements to be used
  const selectorsPseudo = filterByPseudos(selectorsMq);

  // remove PseudoClass from its SimpleSelector for proper matching
  cleanPseudos(selectorsPseudo);

  // stable sort selectors
  const sortedSelectors = sortSelectors(selectorsPseudo).reverse();
  const elementsWithColor = (0, _cssSelect.default)('*[color], *[fill], *[floodColor], *[lightingColor], *[stopColor], *[stroke]', document, cssSelectOpts);
  for (const element of elementsWithColor) {
    resolveElementVariables(element, variables);
  }

  // match selectors
  for (const {
    rule,
    item
  } of sortedSelectors) {
    if (rule === null) {
      continue;
    }
    const selectorStr = _cssTree.default.generate(item.data);
    try {
      // apply <style/> to matched elements
      const matched = (0, _cssSelect.default)(selectorStr, document, cssSelectOpts).map(initStyle);
      if (matched.length === 0) {
        continue;
      }
      _cssTree.default.walk(rule, {
        visit: 'Declaration',
        enter(node) {
          const {
            property,
            value,
            important
          } = node;
          // existing inline styles have higher priority
          // no inline styles, external styles,                                    external styles used
          // inline styles,    external styles same   priority as inline styles,   inline   styles used
          // inline styles,    external styles higher priority than inline styles, external styles used
          const name = property.trim();
          const camel = (0, _reactNativeSvg.camelCase)(name);
          const val = _cssTree.default.generate(value).trim();
          for (const element of matched) {
            const {
              style,
              priority
            } = element;
            const current = priority.get(name);
            if (current === undefined || current < important) {
              priority.set(name, important);
              // Handle if value is undefined
              if (val !== undefined) {
                style[camel] = val;
              } else {
                console.warn(`Undefined value for style property: ${camel}`);
              }
            }
          }
        }
      });
    } catch (selectError) {
      if (selectError instanceof SyntaxError) {
        console.warn('Warning: Syntax error when trying to select \n\n' + selectorStr + '\n\n, skipped. Error details: ' + selectError);
        continue;
      }
      throw selectError;
    }
  }
  return document;
};
function SvgCss(props) {
  const {
    xml,
    override,
    fallback,
    onError = err
  } = props;
  try {
    const ast = (0, _react.useMemo)(() => xml !== null ? (0, _reactNativeSvg.parse)(xml, inlineStyles) : null, [xml]);
    return /*#__PURE__*/React.createElement(_reactNativeSvg.SvgAst, {
      ast: ast,
      override: override || props
    });
  } catch (error) {
    onError(error);
    return fallback ?? null;
  }
}
function SvgCssUri(props) {
  const {
    uri,
    onError = err,
    onLoad,
    fallback
  } = props;
  const [xml, setXml] = (0, _react.useState)(null);
  const [isError, setIsError] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    uri ? (0, _reactNativeSvg.fetchText)(uri).then(data => {
      setXml(data);
      onLoad === null || onLoad === void 0 || onLoad();
    }).catch(e => {
      onError(e);
      setIsError(true);
    }) : setXml(null);
  }, [onError, uri, onLoad]);
  if (isError) {
    return fallback ?? null;
  }
  return /*#__PURE__*/React.createElement(SvgCss, {
    xml: xml,
    override: props,
    fallback: fallback
  });
}

// Extending Component is required for Animated support.

class SvgWithCss extends _react.Component {
  state = {
    ast: null
  };
  componentDidMount() {
    this.parse(this.props.xml);
  }
  componentDidUpdate(prevProps) {
    const {
      xml
    } = this.props;
    if (xml !== prevProps.xml) {
      this.parse(xml);
    }
  }
  parse(xml) {
    try {
      this.setState({
        ast: xml ? (0, _reactNativeSvg.parse)(xml, inlineStyles) : null
      });
    } catch (e) {
      this.props.onError ? this.props.onError(e) : console.error(e);
    }
  }
  render() {
    const {
      props,
      state: {
        ast
      }
    } = this;
    return /*#__PURE__*/React.createElement(_reactNativeSvg.SvgAst, {
      ast: ast,
      override: props.override || props
    });
  }
}
exports.SvgWithCss = SvgWithCss;
class SvgWithCssUri extends _react.Component {
  state = {
    xml: null
  };
  componentDidMount() {
    this.fetch(this.props.uri);
  }
  componentDidUpdate(prevProps) {
    const {
      uri
    } = this.props;
    if (uri !== prevProps.uri) {
      this.fetch(uri);
    }
  }
  async fetch(uri) {
    try {
      this.setState({
        xml: uri ? await (0, _reactNativeSvg.fetchText)(uri) : null
      });
    } catch (e) {
      this.props.onError ? this.props.onError(e) : console.error(e);
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
exports.SvgWithCssUri = SvgWithCssUri;
//# sourceMappingURL=css.js.map
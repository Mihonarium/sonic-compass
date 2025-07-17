import React from 'react';
import { tags } from '../../xmlTags';
import { parse } from './extractFiltersString';
export const extractFiltersCss = rawFilters => {
  if (!rawFilters) {
    return [];
  }
  if (Array.isArray(rawFilters)) {
    return rawFilters;
  }
  return parse(rawFilters);
};
export const mapFilterToComponent = ({
  name,
  ...props
}, index) => {
  return tags[name] ? /*#__PURE__*/React.createElement(tags[name], {
    ...props,
    key: name + index
  }) : null;
};
//# sourceMappingURL=extractFilters.js.map
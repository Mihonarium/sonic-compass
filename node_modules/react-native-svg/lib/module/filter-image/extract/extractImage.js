export const extractResizeMode = resizeMode => {
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
//# sourceMappingURL=extractImage.js.map
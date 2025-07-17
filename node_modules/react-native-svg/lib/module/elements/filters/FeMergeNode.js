import FilterPrimitive from './FilterPrimitive';
export default class FeMergeNode extends FilterPrimitive {
  static displayName = 'FeMergeNode';

  // Force update parent
  setNativeProps = () => {
    const {
      parent
    } = this.props;
    if (parent) {
      parent.forceUpdate();
    }
  };
  render() {
    return null;
  }
}
//# sourceMappingURL=FeMergeNode.js.map
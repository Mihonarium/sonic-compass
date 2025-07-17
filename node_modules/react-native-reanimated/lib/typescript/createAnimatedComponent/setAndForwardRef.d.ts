import type { RefObject } from 'react';
/** Imported from react-native */
/**
 * This is a helper function for when a component needs to be able to forward a
 * ref to a child component, but still needs to have access to that component as
 * part of its implementation.
 *
 * Its main use case is in wrappers for native components.
 *
 * Usage:
 *
 * Class MyView extends React.Component { _nativeRef = null;
 *
 *     _setNativeRef = setAndForwardRef({
 *       getForwardedRef: () => this.props.forwardedRef,
 *       setLocalRef: ref => {
 *         this._nativeRef = ref;
 *       },
 *     });
 *
 *     render() {
 *       return <View ref={this._setNativeRef} />;
 *     }
 *
 * }
 *
 * Const MyViewWithRef = React.forwardRef((props, ref) => ( <MyView {...props}
 * forwardedRef={ref} /> ));
 *
 * Module.exports = MyViewWithRef;
 */
declare function setAndForwardRef<T>({ getForwardedRef, setLocalRef, }: {
    getForwardedRef: () => RefObject<T> | ((ref: T) => void);
    setLocalRef: (ref: T) => void;
}): (ref: T) => void;
export default setAndForwardRef;
//# sourceMappingURL=setAndForwardRef.d.ts.map
declare module '*.svg' {
  import type {ComponentType} from 'react';
  import type {SvgProps} from 'react-native-svg';
  const Asset: ComponentType<SvgProps>;
  export default Asset;
}

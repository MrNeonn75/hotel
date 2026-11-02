import { Text, TextProps } from './Themed';
import { useTheme } from '@/constants/theme';

export function MonoText(props: TextProps) {
  const { fonts } = useTheme();
  return <Text {...props} style={[props.style, { fontFamily: fonts.medium }]} />;
}

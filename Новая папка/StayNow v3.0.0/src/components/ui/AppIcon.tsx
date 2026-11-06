import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '@/theme';

export interface AppIconProps {
  size?: number;
  borderRadius?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({
  size = 64,
  borderRadius = 16,
}) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="appIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.brand} />
            <Stop offset="100%" stopColor={colors.brandPressed} />
          </LinearGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={(borderRadius / size) * 100}
          fill="url(#appIconGrad)"
        />

        {/* Dynamic Stylized "S" */}
        <Path
          d="M68 33C66 28 61 24 52 24C41 24 34 30 34 38C34 50 64 47 64 60C64 68 57 74 47 74C37 74 31 68 29 63M38 24L62 74"
          stroke={colors.white}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface FloatingInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value = '',
  error,
  containerStyle,
  onFocus,
  onBlur,
  multiline = false,
  ...rest
}) => {
  const { colors, typography, radius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = Boolean(value && value.length > 0);
  const animatedIsFocused = useRef(new Animated.Value(hasValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, animatedIsFocused]);

  const labelTop = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 16 : 18, 7],
  });

  const labelFontSize = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });

  const labelColor = error
    ? colors.urgency
    : isFocused
    ? colors.primary
    : colors.textSecondary;

  const borderColor = error
    ? colors.urgency
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderRadius: radius.card - 4,
            backgroundColor: colors.background,
            height: multiline ? 90 : 56,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              fontWeight: isFocused || hasValue ? '600' : '500',
            },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              paddingTop: multiline ? 24 : 18,
            },
            multiline && { height: 75, textAlignVertical: 'top' },
          ]}
          multiline={multiline}
          placeholderTextColor="transparent"
          {...rest}
        />
      </View>

      {error ? (
        <Text style={[typography.micro, { color: colors.urgency, marginTop: 4, marginLeft: 4 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 14,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    paddingBottom: 4,
  },
});

export default FloatingInput;
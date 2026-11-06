import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, CircleCheck } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme';

export interface CheckoutProgressBarProps {
  currentStep: 1 | 2 | 3;
}

interface StepItem {
  number: 1 | 2 | 3;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Qonaq' },
  { number: 2, label: 'Ödəniş' },
  { number: 3, label: 'Təsdiq' },
];

export const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step indicator */}
              <View
                style={[
                  styles.stepPill,
                  isCompleted && styles.stepPillCompleted,
                  isCurrent && styles.stepPillCurrent,
                  isUpcoming && styles.stepPillUpcoming,
                ]}
              >
                {isCompleted ? (
                  <CircleCheck size={16} color={colors.savings} />
                ) : (
                  <View
                    style={[
                      styles.circleNum,
                      isCurrent && styles.circleNumCurrent,
                      isUpcoming && styles.circleNumUpcoming,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numText,
                        isCurrent && styles.numTextCurrent,
                        isUpcoming && styles.numTextUpcoming,
                      ]}
                    >
                      {step.number}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.label,
                    isCompleted && styles.labelCompleted,
                    isCurrent && styles.labelCurrent,
                    isUpcoming && styles.labelUpcoming,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector between steps */}
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    step.number < currentStep && styles.connectorActive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  stepPillCompleted: {
    backgroundColor: colors.surfaceAlt,
  },
  stepPillCurrent: {
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  stepPillUpcoming: {
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  circleNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumCurrent: {
    backgroundColor: colors.brand,
  },
  circleNumUpcoming: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  numTextCurrent: {
    color: colors.white,
  },
  numTextUpcoming: {
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  labelCompleted: {
    color: colors.text,
  },
  labelCurrent: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  labelUpcoming: {
    color: colors.textMuted,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  connectorActive: {
    backgroundColor: colors.savings,
  },
});
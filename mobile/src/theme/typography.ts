import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  headlineLg: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  headlineSm: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  titleLg: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  titleMd: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};

export const colors = {
  // Базовые
  bg: "#FFFBEB",
  surface: "#FFFFFF",
  surfaceDisabled: "#F3F4F6",
  border: "#E5E7EB",
  borderWarm: "#FDE68A",

  // Текст
  textPrimary: "#78350F",
  textSecondary: "#92400E",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",

  // Акцент
  primary: "#F59E0B",
  primarySoft: "#FEF3C7",
  primaryDark: "#C27500",

  // Состояния
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  dangerText: "#991B1B",
  success: "#34D399",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",
  infoText: "#2563EB",

  // Типы пива (жидкость + полоски)
  beerLight: "#F59E0B",
  beerDark: "#3F2410",
  beerIpa: "#D97706",
  beerWheat: "#FCD34D",
  beerStout: "#1C1108",

  // Прочее
  inactive: "#E5E7EB",
  overlay: "rgba(0,0,0,0.6)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
};

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: colors.textPrimary,
  },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  body: { fontSize: 16, color: colors.textPrimary },
  muted: { fontSize: 13, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textLight },
};

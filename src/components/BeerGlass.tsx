import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { getBeerAccent } from "../lib/beerColor";
import { colors } from "../lib/theme";
import { BeerType } from "../types";

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 140;
const GLASS_TOP = 10;
const GLASS_BOTTOM = 130;
const GLASS_INNER_HEIGHT = GLASS_BOTTOM - GLASS_TOP;
const FILL_DURATION_MS = 1000;

const GLASS_OUTLINE = "M 20 10 L 80 10 L 70 130 L 30 130 Z";
// Область вне стекла закрашивается цветом подложки: так прямоугольная жидкость
// обрезается по трапеции без clipPath, который не анимируется на новой архитектуре
const OUTSIDE_GLASS = `M 0 0 H ${VIEWBOX_WIDTH} V ${VIEWBOX_HEIGHT} H 0 Z ${GLASS_OUTLINE}`;

interface Props {
  fillLevel: number;
  size?: number;
  beerType?: BeerType;
  accessibilityLabel?: string;
  /** Цвет фона под бокалом: им закрашивается область вне стекла, должен совпадать с подложкой */
  backgroundColor?: string;
}

/** Бокал с наполнением за секунду. Анимация проигрывается только на видимом экране. */
export default function BeerGlass({
  fillLevel,
  size = 130,
  beerType = "light",
  accessibilityLabel,
  backgroundColor = colors.bg,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const unit = size / VIEWBOX_WIDTH;
  const windowHeight = GLASS_INNER_HEIGHT * unit;
  const height = size * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  const translateY = useSharedValue(windowHeight);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  useEffect(() => {
    // Под перекрытым экраном наполнение не запускаем, иначе пользователь его не увидит
    if (!isFocused) return;
    const clamped = Math.min(1, Math.max(0, fillLevel));
    cancelAnimation(translateY);
    translateY.value = withTiming((1 - clamped) * windowHeight, {
      duration: FILL_DURATION_MS,
      easing: Easing.out(Easing.quad),
    });
  }, [fillLevel, isFocused, windowHeight]);

  const liquidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const color = getBeerAccent(beerType);

  return (
    <View
      style={{ width: size, height }}
      accessible={!!accessibilityLabel}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.liquidWindow,
          { top: GLASS_TOP * unit, height: windowHeight },
        ]}
      >
        <Animated.View
          style={[
            styles.liquid,
            { height: windowHeight, backgroundColor: color },
            liquidStyle,
          ]}
        />
      </View>
      <View style={styles.overlay}>
        <Svg
          width={size}
          height={height}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        >
          <Path d={OUTSIDE_GLASS} fill={backgroundColor} fillRule="evenodd" />
          <Path
            d={GLASS_OUTLINE}
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <Path
            d="M 25 20 L 35 120"
            fill="none"
            stroke={colors.surface}
            strokeWidth="2"
            opacity="0.4"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  liquidWindow: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  liquid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
});

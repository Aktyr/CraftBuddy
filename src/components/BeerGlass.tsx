import { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { BeerType } from "../types";

// Создаём анимируемый компонент Rect через Reanimated
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const VB_W = 120;
const VB_H = 200;
const GLASS_TOP = 20;
const GLASS_BOTTOM = 185;
const GLASS_H = GLASS_BOTTOM - GLASS_TOP;
const GLASS_PATH = `M20,${GLASS_TOP} L100,${GLASS_TOP} L90,${GLASS_BOTTOM} Q60,${GLASS_BOTTOM + 8} 30,${GLASS_BOTTOM} Z`;

interface Props {
  fillLevel: number;
  size?: number;
  beerType?: BeerType;
}

export default function BeerGlass({
  fillLevel,
  size = 140,
  beerType = "light",
}: Props) {
  const progress = useSharedValue(0);
  const height = size * (VB_H / VB_W);

  // Палитра цветов для разных сортов
  const colors: Record<BeerType, { top: string; bottom: string }> = {
    light: { top: "#FCD34D", bottom: "#F59E0B" },
    wheat: { top: "#FEF3C7", bottom: "#FCD34D" },
    ipa: { top: "#F59E0B", bottom: "#D97706" },
    dark: { top: "#78350F", bottom: "#3F2410" },
    stout: { top: "#3F2410", bottom: "#1C1108" },
  };

  const palette = colors[beerType] || colors.light;

  useEffect(() => {
    // Плавная анимация значения от 0 до 1
    progress.value = withTiming(Math.max(0, Math.min(1, fillLevel)), {
      duration: 700,
    });
  }, [fillLevel]);

  // useAnimatedProps — правильный способ анимировать SVG в Reanimated
  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;
    return {
      y: GLASS_BOTTOM - p * GLASS_H,
      height: p * GLASS_H,
    } as any; // 'any' нужен, так как типы react-native-svg не знают о Reanimated
  });

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <LinearGradient id={`beer-${beerType}`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={palette.bottom} />
          <Stop offset="1" stopColor={palette.top} />
        </LinearGradient>
        <ClipPath id="glassClip">
          <Path d={GLASS_PATH} />
        </ClipPath>
      </Defs>

      {/* Жидкость с анимированными пропсами */}
      <AnimatedRect
        animatedProps={animatedProps}
        width={VB_W}
        fill={`url(#beer-${beerType})`}
        clipPath="url(#glassClip)"
      />

      {/* Контур бокала */}
      <Path d={GLASS_PATH} fill="none" stroke="#78350F" strokeWidth={3} />

      {/* Блик */}
      <Path
        d={`M34,${GLASS_TOP + 10} L38,${GLASS_BOTTOM - 20}`}
        stroke="#fff"
        strokeOpacity={0.35}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

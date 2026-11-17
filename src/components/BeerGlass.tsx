import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const VB_W = 120;
const VB_H = 200;
const GLASS_TOP = 20;
const GLASS_BOTTOM = 185;
const GLASS_H = GLASS_BOTTOM - GLASS_TOP;

const GLASS_PATH = `M20,${GLASS_TOP} L100,${GLASS_TOP} L90,${GLASS_BOTTOM} Q60,${GLASS_BOTTOM + 8} 30,${GLASS_BOTTOM} Z`;

interface Props {
  fillLevel: number; // 0..1
  size?: number;
}

export default function BeerGlass({ fillLevel, size = 140 }: Props) {
  const animated = useRef(new Animated.Value(0)).current;
  const height = size * (VB_H / VB_W);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.max(0, Math.min(1, fillLevel)),
      duration: 700,
      useNativeDriver: false, // SVG-пропсы нельзя анимировать нативно
    }).start();
  }, [fillLevel]);

  const y = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [GLASS_BOTTOM, GLASS_TOP],
  });
  const h = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, GLASS_H],
  });

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <LinearGradient id="beer" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#C27500" />
          <Stop offset="1" stopColor="#F59E0B" />
        </LinearGradient>
        <ClipPath id="glassClip">
          <Path d={GLASS_PATH} />
        </ClipPath>
      </Defs>

      {/* жидкость — обрезается по форме бокала */}
      <AnimatedRect
        x={0}
        y={y}
        width={VB_W}
        height={h}
        fill="url(#beer)"
        clipPath="url(#glassClip)"
      />

      {/* контур бокала */}
      <Path d={GLASS_PATH} fill="none" stroke="#78350F" strokeWidth={3} />

      {/* блик */}
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

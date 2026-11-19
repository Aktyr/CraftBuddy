import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import { getBeerAccent } from "../lib/beerColor";
import { BeerType } from "../types";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  fillLevel: number; // 0-1, относительно прогнозируемого пика BAC
  size?: number;
  beerType?: BeerType;
}

export default function BeerGlass({
  fillLevel,
  size = 130,
  beerType = "light",
}: Props) {
  const animatedHeight = useSharedValue(0);
  const animatedY = useSharedValue(130);

  useEffect(() => {
    const targetHeight = fillLevel * 120;
    const targetY = 130 - targetHeight;

    // Прерываем предыдущую анимацию перед запуском новой
    cancelAnimation(animatedHeight);
    cancelAnimation(animatedY);

    animatedHeight.value = withTiming(targetHeight, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });
    animatedY.value = withTiming(targetY, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });
  }, [fillLevel]);

  const liquidProps = useAnimatedProps(() => ({
    height: animatedHeight.value,
    y: animatedY.value,
  }));

  const color = getBeerAccent(beerType);

  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
      <Defs>
        <ClipPath id="glass-clip">
          <Path d="M 20 10 L 80 10 L 70 130 L 30 130 Z" />
        </ClipPath>
      </Defs>

      {/* Жидкость с анимацией заполнения */}
      <AnimatedRect
        x="10"
        width="80"
        fill={color}
        clipPath="url(#glass-clip)"
        animatedProps={liquidProps}
      />

      {/* Контур бокала */}
      <Path
        d="M 20 10 L 80 10 L 70 130 L 30 130 Z"
        fill="none"
        stroke="#78350F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Блик на бокале */}
      <Path
        d="M 25 20 L 35 120"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity="0.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

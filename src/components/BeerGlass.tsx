import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { getBeerAccent } from "../lib/beerColor";
import { getGlassShape } from "../lib/glassShapes";
import { colors } from "../lib/theme";
import { GlassId } from "../types";
import { LiquidLayer } from "../types/LiquidLayer";

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 140;
const GLASS_TOP = 10;
const GLASS_BOTTOM = 130;
const GLASS_INNER_HEIGHT = GLASS_BOTTOM - GLASS_TOP;
const LAYER_ANIMATION_DURATION_MS = 600;
const LAYER_ANIMATION_GAP_MS = 100;
const OVERLAP_PX = 3;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface AnimatedLayerProps {
  targetY: number;
  targetHeight: number;
  color: string;
  delay: number;
  isFocused: boolean;
  layerId: string;
  animationKey: number;
}

function AnimatedLayer({
  targetY,
  targetHeight,
  color,
  delay,
  isFocused,
  layerId,
  animationKey,
}: AnimatedLayerProps) {
  const progress = useSharedValue(0);
  const animTargetY = useSharedValue(targetY);
  const animTargetHeight = useSharedValue(targetHeight);

  useEffect(() => {
    animTargetY.value = targetY;
    animTargetHeight.value = targetHeight;
  }, [targetY, targetHeight]);

  useEffect(() => {
    if (!isFocused) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    const timeout = setTimeout(() => {
      cancelAnimation(progress);
      progress.value = withTiming(1, {
        duration: LAYER_ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.quad),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [isFocused, delay, animationKey]);

  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;
    const currentHeight = animTargetHeight.value * p;
    const currentY = animTargetY.value + animTargetHeight.value - currentHeight;
    return {
      y: currentY,
      height: currentHeight,
    };
  });

  return (
    <AnimatedRect
      x={0}
      y={targetY}
      width={VIEWBOX_WIDTH}
      height={targetHeight}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

interface Props {
  layers: LiquidLayer[];
  size?: number;
  now?: number;
  accessibilityLabel?: string;
  backgroundColor?: string;
  glassId?: GlassId;
}

export default function BeerGlass({
  layers,
  size = 130,
  now,
  accessibilityLabel,
  backgroundColor = colors.bg,
  glassId = "pint",
}: Props) {
  const shape = getGlassShape(glassId);
  const outsideGlass = `M 0 0 H ${VIEWBOX_WIDTH} V ${VIEWBOX_HEIGHT} H 0 Z ${shape.outline}`;
  const [isFocused, setIsFocused] = useState(false);
  const prevLayersRef = useRef<string>("");
  const animationCounterRef = useRef(0);
  const unit = size / VIEWBOX_WIDTH;
  // Размеры для RN-вёрстки в px; координаты слоёв внутри SVG остаются в единицах viewBox
  const windowPxHeight = GLASS_INNER_HEIGHT * unit;
  const height = size * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const layersKey = layers
    .map((l) => `${l.beerType}-${l.heightRatio.toFixed(3)}`)
    .join("|");
  const layersChanged = layersKey !== prevLayersRef.current;

  if (layersChanged) {
    prevLayersRef.current = layersKey;
    animationCounterRef.current += 1;
  }

  let currentY = GLASS_INNER_HEIGHT;
  const layerData = layers.map((layer, index) => {
    const layerHeight = GLASS_INNER_HEIGHT * layer.heightRatio;
    currentY -= layerHeight;
    // Перекрытие только между слоями, не для первого
    const overlap = index > 0 ? OVERLAP_PX : 0;
    const stepDuration = LAYER_ANIMATION_DURATION_MS + LAYER_ANIMATION_GAP_MS;
    return {
      id: `${layer.beerType}-${index}`,
      targetY: currentY - overlap,
      targetHeight: layerHeight + overlap,
      color: getBeerAccent(layer.beerType),
      delay: index * stepDuration,
      animationKey: animationCounterRef.current,
    };
  });

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
          { top: GLASS_TOP * unit, height: windowPxHeight },
        ]}
      >
        <Svg
          width={size}
          height={windowPxHeight}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${GLASS_INNER_HEIGHT}`}
        >
          <Defs>
            <ClipPath id={`glassClip-${glassId}`}>
              <Path d={shape.innerOutline} />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#glassClip-${glassId})`}>
            {layerData.map((data) => (
              <AnimatedLayer
                key={data.id}
                targetY={data.targetY}
                targetHeight={data.targetHeight}
                color={data.color}
                delay={data.delay}
                isFocused={isFocused}
                layerId={data.id}
                animationKey={data.animationKey}
              />
            ))}
          </G>
        </Svg>
      </View>
      <View style={styles.overlay}>
        <Svg
          width={size}
          height={height}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        >
          <Path d={outsideGlass} fill={backgroundColor} fillRule="evenodd" />
          <Path
            d={shape.outline}
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {shape.handlePath && (
            <Path
              d={shape.handlePath}
              fill="none"
              stroke={colors.textPrimary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <Path
            d={shape.highlightPath}
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
});

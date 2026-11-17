import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { calculateBac } from "../lib/bac";
import { BAC_LIMIT } from "../lib/constants";
import { Checkin, UserProfile } from "../types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WIDTH = 340;
const HEIGHT = 180;
const PADDING = 30;

interface Props {
  checkins: Checkin[];
  profile: UserProfile;
  now: number;
}

export default function BacChart({ checkins, profile, now }: Props) {
  const currentY = useSharedValue(0);

  const data = useMemo(() => {
    if (checkins.length === 0) return null;

    const firstTime = Math.min(...checkins.map((c) => c.timestamp));
    const endTime = Math.max(
      now + 4 * 60 * 60 * 1000,
      firstTime + 60 * 60 * 1000,
    );
    const step = 2 * 60 * 1000;

    const samples: { t: number; v: number }[] = [];
    for (let t = firstTime; t <= endTime; t += step) {
      samples.push({ t, v: calculateBac(checkins, profile, t) });
    }

    const maxBac = Math.max(BAC_LIMIT * 1.3, ...samples.map((s) => s.v));
    const chartW = WIDTH - PADDING * 2;
    const chartH = HEIGHT - PADDING * 2;
    const timeRange = endTime - firstTime;

    const toX = (t: number) => PADDING + ((t - firstTime) / timeRange) * chartW;
    const toY = (v: number) => PADDING + chartH - (v / maxBac) * chartH;

    // Создаём плавную кривую через все точки
    let pathData = `M ${toX(samples[0].t)},${toY(samples[0].v)}`;
    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1];
      const curr = samples[i];
      const prevX = toX(prev.t);
      const prevY = toY(prev.v);
      const currX = toX(curr.t);
      const currY = toY(curr.v);

      // Контрольные точки для плавной кривой (tension = 0.3)
      const tension = 0.3;
      const cp1x = prevX + (currX - prevX) * tension;
      const cp1y = prevY + (currY - prevY) * tension;
      const cp2x = prevX + (currX - prevX) * (1 - tension);
      const cp2y = prevY + (currY - prevY) * (1 - tension);

      pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currX},${currY}`;
    }

    const currentBac = calculateBac(checkins, profile, now);

    return {
      pathData,
      currentPoint: { x: toX(now), y: toY(currentBac) },
      limitY: toY(BAC_LIMIT),
      chartH,
      toY,
      maxBac,
    };
  }, [checkins, profile, now]);

  // Анимация точки "Сейчас" через Reanimated
  useEffect(() => {
    if (data) {
      currentY.value = withTiming(data.currentPoint.y, { duration: 500 });
    }
  }, [data?.currentPoint.y]);

  const animatedCircleProps = useAnimatedProps(() => ({
    cy: currentY.value,
  }));

  if (!data) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Динамика опьянения (BAC)</Text>
      <Svg width={WIDTH} height={HEIGHT}>
        <Rect
          x={PADDING}
          y={data.toY(BAC_LIMIT)}
          width={WIDTH - PADDING * 2}
          height={data.chartH - (data.toY(BAC_LIMIT) - PADDING)}
          fill="#ECFDF5"
          opacity={0.4}
        />
        <Rect
          x={PADDING}
          y={PADDING}
          width={WIDTH - PADDING * 2}
          height={data.toY(BAC_LIMIT) - PADDING}
          fill="#FEE2E2"
          opacity={0.4}
        />

        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={HEIGHT - PADDING}
          stroke="#E5E7EB"
        />
        <Line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="#E5E7EB"
        />

        <SvgText
          x={PADDING - 5}
          y={PADDING + 4}
          fontSize={9}
          fill="#9CA3AF"
          textAnchor="end"
        >
          {data.maxBac.toFixed(1)}
        </SvgText>
        <SvgText
          x={PADDING - 5}
          y={HEIGHT - PADDING + 4}
          fontSize={9}
          fill="#9CA3AF"
          textAnchor="end"
        >
          0
        </SvgText>

        <Line
          x1={PADDING}
          y1={data.limitY}
          x2={WIDTH - PADDING}
          y2={data.limitY}
          stroke="#EF4444"
          strokeDasharray="4,4"
          strokeWidth={1.5}
        />
        <SvgText
          x={WIDTH - PADDING + 5}
          y={data.limitY + 4}
          fontSize={10}
          fill="#EF4444"
          fontWeight="bold"
        >
          {BAC_LIMIT}
        </SvgText>

        {/* кривая BAC */}
        <Path
          d={data.pathData}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Анимированная точка через Reanimated */}
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          cx={data.currentPoint.x}
          r={6}
          fill="#F59E0B"
          stroke="#fff"
          strokeWidth={2}
        />
        <SvgText
          x={data.currentPoint.x}
          y={data.currentPoint.y - 12}
          fontSize={11}
          fill="#78350F"
          fontWeight="bold"
          textAnchor="middle"
        >
          Сейчас
        </SvgText>
      </Svg>
      <View style={styles.legend}>
        <Text style={styles.legendItem}>🟢 Безопасно</Text>
        <Text style={styles.legendItem}>🔴 Превышение лимита</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, alignItems: "center" },
  title: { fontSize: 14, color: "#78350F", marginBottom: 8, fontWeight: "700" },
  legend: { flexDirection: "row", gap: 16, marginTop: 8 },
  legendItem: { fontSize: 11, color: "#92400E" },
});

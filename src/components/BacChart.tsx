import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { calculateBac } from "../lib/bac";
import {
  BAC_LIMIT,
  CHART_BASE_STEP_MS,
  CHART_MAX_POINTS,
  CHART_WINDOW_BACK_MS,
  CHART_WINDOW_FORWARD_MS,
} from "../lib/constants";
import { Checkin, UserProfile } from "../types";

const WIDTH = 340;
const HEIGHT = 180;
const PADDING = 30;

interface Props {
  checkins: Checkin[];
  profile: UserProfile;
  now: number;
}

export default function BacChart({ checkins, profile, now }: Props) {
  const data = useMemo(() => {
    if (!checkins || checkins.length === 0) return null;

    // Ограничиваем окно графика: не раньше 24ч назад, не позже now + 4ч
    const windowStart = now - CHART_WINDOW_BACK_MS;
    const windowEnd = now + CHART_WINDOW_FORWARD_MS;

    const recentCheckins = checkins.filter((c) => c.timestamp >= windowStart);
    if (recentCheckins.length === 0) return null;

    const firstTime = Math.min(...recentCheckins.map((c) => c.timestamp));
    const startTime = Math.max(firstTime, windowStart);
    const endTime = windowEnd;

    // Адаптивный шаг: базовый 2 минуты, но увеличиваем, если точек слишком много
    const rawStep = CHART_BASE_STEP_MS;
    const rawPoints = Math.ceil((endTime - startTime) / rawStep);
    const step =
      rawPoints > CHART_MAX_POINTS
        ? (endTime - startTime) / CHART_MAX_POINTS
        : rawStep;

    const samples: { t: number; v: number }[] = [];
    for (let t = startTime; t <= endTime; t += step) {
      samples.push({ t, v: calculateBac(recentCheckins, profile, t) });
    }

    if (samples.length === 0) return null;

    const maxBac = Math.max(BAC_LIMIT * 1.3, ...samples.map((s) => s.v));
    const chartW = WIDTH - PADDING * 2;
    const chartH = HEIGHT - PADDING * 2;
    const timeRange = endTime - startTime;

    const toX = (t: number) => PADDING + ((t - startTime) / timeRange) * chartW;
    const toY = (v: number) => PADDING + chartH - (v / maxBac) * chartH;

    let pathData = `M ${toX(samples[0].t)},${toY(samples[0].v)}`;
    for (let i = 1; i < samples.length; i++) {
      const prevX = toX(samples[i - 1].t);
      const prevY = toY(samples[i - 1].v);
      const currX = toX(samples[i].t);
      const currY = toY(samples[i].v);
      const tension = 0.3;
      pathData += ` C ${prevX + (currX - prevX) * tension},${prevY + (currY - prevY) * tension} ${prevX + (currX - prevX) * (1 - tension)},${prevY + (currY - prevY) * (1 - tension)} ${currX},${currY}`;
    }

    const currentBac = calculateBac(recentCheckins, profile, now);

    return {
      pathData,
      currentPoint: { x: toX(now), y: toY(currentBac) },
      limitY: toY(BAC_LIMIT),
      chartH,
      toY,
      maxBac,
    };
  }, [checkins, profile, now]);

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
        <Path
          d={data.pathData}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={data.currentPoint.x}
          cy={data.currentPoint.y}
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

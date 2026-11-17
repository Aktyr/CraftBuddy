import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { calculateBac } from "../lib/bac";
import { BAC_LIMIT } from "../lib/constants";
import { Checkin, UserProfile } from "../types";

const WIDTH = 320;
const HEIGHT = 160;
const PADDING = 24;

interface Props {
  checkins: Checkin[];
  profile: UserProfile;
  now: number;
}

export default function BacChart({ checkins, profile, now }: Props) {
  const data = useMemo(() => {
    if (checkins.length === 0) return null;

    const firstTime = Math.min(...checkins.map((c) => c.timestamp));
    const endTime = Math.max(
      now + 4 * 60 * 60 * 1000,
      firstTime + 60 * 60 * 1000,
    );
    const step = 10 * 60 * 1000;

    const samples: { t: number; v: number }[] = [];
    for (let t = firstTime; t <= endTime; t += step) {
      samples.push({ t, v: calculateBac(checkins, profile, t) });
    }

    const maxBac = Math.max(BAC_LIMIT * 1.1, ...samples.map((s) => s.v));
    const chartW = WIDTH - PADDING * 2;
    const chartH = HEIGHT - PADDING * 2;
    const timeRange = endTime - firstTime;

    const toX = (t: number) => PADDING + ((t - firstTime) / timeRange) * chartW;
    const toY = (v: number) => PADDING + chartH - (v / maxBac) * chartH;

    const points = samples.map((s) => `${toX(s.t)},${toY(s.v)}`).join(" ");
    const currentBac = calculateBac(checkins, profile, now);
    const currentPoint = { x: toX(now), y: toY(currentBac) };
    const limitY = toY(BAC_LIMIT);

    return { points, currentPoint, limitY };
  }, [checkins, profile, now]);

  if (!data) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Динамика BAC</Text>
      <Svg width={WIDTH} height={HEIGHT}>
        {/* оси */}
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
        {/* порог 0.8 */}
        <Line
          x1={PADDING}
          y1={data.limitY}
          x2={WIDTH - PADDING}
          y2={data.limitY}
          stroke="#EF4444"
          strokeDasharray="4,4"
        />
        {/* кривая BAC */}
        <Polyline
          points={data.points}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
        />
        {/* текущая точка */}
        <Circle
          cx={data.currentPoint.x}
          cy={data.currentPoint.y}
          r={4}
          fill="#F59E0B"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, alignItems: "center" },
  title: { fontSize: 12, color: "#92400E", marginBottom: 4, fontWeight: "600" },
});

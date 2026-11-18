import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../../lib/theme";

interface Props {
  color?: string;
  size?: number;
}

export default function QrIcon({
  color = colors.textPrimary,
  size = 24,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Rect
        x="12"
        y="12"
        width="48"
        height="48"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="16"
        y="16"
        width="12"
        height="12"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="20"
        y="20"
        width="4"
        height="4"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="16"
        y="44"
        width="12"
        height="12"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="20"
        y="48"
        width="4"
        height="4"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="44"
        y="16"
        width="12"
        height="12"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Rect
        x="48"
        y="20"
        width="4"
        height="4"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Circle cx="18" cy="40" r="1" fill={color} />
      <Circle cx="16" cy="38" r="1" fill={color} />
      <Circle cx="20" cy="38" r="1" fill={color} />
      <Circle cx="34" cy="46" r="1" fill={color} />
      <Circle cx="40" cy="38" r="1" fill={color} />
      <Circle cx="40" cy="28" r="1" fill={color} />
      <Circle cx="32" cy="16" r="1" fill={color} />
      <Circle cx="46" cy="32" r="1" fill={color} />
      <Circle cx="52" cy="32" r="1" fill={color} />
      <Circle cx="52" cy="44" r="1" fill={color} />
      <Circle cx="54" cy="48" r="1" fill={color} />
      <Circle cx="56" cy="56" r="1" fill={color} />
      <Circle cx="32" cy="56" r="1" fill={color} />
      <Circle cx="44" cy="56" r="1" fill={color} />
      <Circle cx="46" cy="54" r="1" fill={color} />
      <Circle cx="44" cy="52" r="1" fill={color} />
      <Circle cx="16" cy="32" r="1" fill={color} />
      <Circle cx="40" cy="54" r="1" fill={color} />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18 36V34H26"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 34V32"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M24 34V40"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M24 38H26"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M38 32V30"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M56 34H54"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M42 42H44V40"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M28 32H30"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M34 32H40"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M38 16V20H36V28"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M36 26H32V28"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M36 20H32"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M36 22H34V18"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M28 36H36"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M30 36V40H28"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M34 36V38"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M32 44V42H38V48H42V46H50V56"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M36 40V44H42M46 40H42V48H44"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M48 34V38H50V42H48V46"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M50 38V36H52"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M52 50H48V52"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M32 52H34V54H36V50"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M56 32V38H54"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M44 36V34"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M56 42V44"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M54 52H56"
      />
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M40 22V24"
      />
    </Svg>
  );
}

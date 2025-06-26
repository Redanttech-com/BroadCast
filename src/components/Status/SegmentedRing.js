// components/SegmentedRing.js
import React from "react";
import { Svg, Circle } from "react-native-svg";

const SegmentedRing = ({
  size = 60,
  strokeWidth = 3,
  gapAngle = 5,
  seenArray = [], // 👈 array of booleans
}) => {
  const segments = seenArray.length;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapRadians = (gapAngle / 360) * circumference;
  const arcLength = (circumference - segments * gapRadians) / segments;

  return (
    <Svg width={size} height={size}>
      {seenArray.map((seen, index) => {
        const dashOffset = index * (arcLength + gapRadians);
        return (
          <Circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={seen ? "gray" : "#3b82f6"} // gray if seen
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength},${gapRadians}`}
            strokeDashoffset={-dashOffset}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
};

export default SegmentedRing;

import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useDrawerProgress } from "@react-navigation/drawer";

// Custom animated screen wrapper
function AnimatedScreenWrapper({ children }) {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, 0.85],
      Extrapolate.CLAMP
    );
    const borderRadius = interpolate(
      progress.value,
      [0, 1],
      [0, 20],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      borderRadius,
    };
  });

  return (
    <Animated.View style={[{ flex: 1, overflow: "hidden" }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

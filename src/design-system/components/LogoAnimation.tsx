import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../tokens";
import { logoVectorMedia } from "@/config";

const AnimatedG = Animated.createAnimatedComponent(G);
const POTRACE_TRANSFORM =
  `translate(0, ${logoVectorMedia.viewBox}) scale(0.1, -0.1)`;
const EASE = Easing.bezier(0.33, 0, 0.2, 1);

type LogoAnimationProps = {
  size?: number;
  autoPlay?: boolean;
  onAnimationEnd?: () => void;
  style?: StyleProp<ViewStyle>;
};

export type LogoAnimationHandle = { play: () => void };

function pivotTransform(
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  scale: number,
  rotateDeg: number,
) {
  "worklet";
  return [
    { translateX: dx },
    { translateY: dy },
    { translateX: cx },
    { translateY: cy },
    { rotate: `${rotateDeg}deg` },
    { scale },
    { translateX: -cx },
    { translateY: -cy },
  ];
}

export const LogoAnimation = forwardRef<
  LogoAnimationHandle,
  LogoAnimationProps
>(function LogoAnimation(
  { size = 220, autoPlay = true, onAnimationEnd, style },
  ref,
) {
  const aX = useSharedValue(106);
  const aY = useSharedValue(-18.5);
  const aScale = useSharedValue(0);
  const aOpacity = useSharedValue(0);
  const lX = useSharedValue(-106);
  const lY = useSharedValue(18.5);
  const lScale = useSharedValue(0);
  const lOpacity = useSharedValue(0);
  const chevronRotate = useSharedValue(190);
  const chevronScale = useSharedValue(0);
  const chevronOpacity = useSharedValue(0);

  const play = useCallback(() => {
    aX.value = 106;
    aY.value = -18.5;
    aScale.value = 0;
    aOpacity.value = 0;
    lX.value = -106;
    lY.value = 18.5;
    lScale.value = 0;
    lOpacity.value = 0;
    chevronRotate.value = 190;
    chevronScale.value = 0;
    chevronOpacity.value = 0;

    aOpacity.value = withTiming(1, { duration: 95, easing: EASE });
    aX.value = withSequence(
      withTiming(26, { duration: 771, easing: EASE }),
      withTiming(0, { duration: 237, easing: EASE }),
      withTiming(0, { duration: 95, easing: EASE }),
      withTiming(0, { duration: 83, easing: EASE }),
    );
    aY.value = withSequence(
      withTiming(-4.5, { duration: 771, easing: EASE }),
      withTiming(0, { duration: 237, easing: EASE }),
      withTiming(0, { duration: 95, easing: EASE }),
      withTiming(0, { duration: 83, easing: EASE }),
    );
    aScale.value = withSequence(
      withTiming(0.88, { duration: 771, easing: EASE }),
      withTiming(1.14, { duration: 237, easing: EASE }),
      withTiming(0.97, { duration: 95, easing: EASE }),
      withTiming(1, { duration: 83, easing: EASE }),
    );

    lOpacity.value = withDelay(
      77,
      withTiming(1, { duration: 95, easing: EASE }),
    );
    lX.value = withDelay(
      77,
      withSequence(
        withTiming(-26, { duration: 771, easing: EASE }),
        withTiming(0, { duration: 237, easing: EASE }),
        withTiming(0, { duration: 95, easing: EASE }),
        withTiming(0, { duration: 83, easing: EASE }),
      ),
    );
    lY.value = withDelay(
      77,
      withSequence(
        withTiming(4.5, { duration: 771, easing: EASE }),
        withTiming(0, { duration: 237, easing: EASE }),
        withTiming(0, { duration: 95, easing: EASE }),
        withTiming(0, { duration: 83, easing: EASE }),
      ),
    );
    lScale.value = withDelay(
      77,
      withSequence(
        withTiming(0.88, { duration: 771, easing: EASE }),
        withTiming(1.14, { duration: 237, easing: EASE }),
        withTiming(0.97, { duration: 95, easing: EASE }),
        withTiming(1, { duration: 83, easing: EASE }),
      ),
    );

    chevronOpacity.value = withDelay(
      49,
      withTiming(1, { duration: 127, easing: EASE }),
    );
    chevronRotate.value = withDelay(
      49,
      withSequence(
        withTiming(60, { duration: 796, easing: EASE }),
        withTiming(32, { duration: 127, easing: EASE }),
        withTiming(85, { duration: 127, easing: EASE }),
        withTiming(-25, { duration: 159, easing: EASE }),
        withTiming(22, { duration: 191, easing: EASE }),
        withTiming(-8, { duration: 127, easing: EASE }),
        withTiming(0, { duration: 64, easing: EASE }, (finished) => {
          if (finished && onAnimationEnd) runOnJS(onAnimationEnd)();
        }),
      ),
    );
    chevronScale.value = withDelay(
      49,
      withSequence(
        withTiming(0.5, { duration: 796, easing: EASE }),
        withTiming(0.68, { duration: 127, easing: EASE }),
        withTiming(0.6, { duration: 127, easing: EASE }),
        withTiming(0.95, { duration: 159, easing: EASE }),
        withTiming(1.45, { duration: 191, easing: EASE }),
        withTiming(0.82, { duration: 127, easing: EASE }),
        withTiming(1, { duration: 64, easing: EASE }),
      ),
    );
  }, [
    aOpacity,
    aScale,
    aX,
    aY,
    chevronOpacity,
    chevronRotate,
    chevronScale,
    lOpacity,
    lScale,
    lX,
    lY,
    onAnimationEnd,
  ]);

  useImperativeHandle(ref, () => ({ play }), [play]);
  useEffect(() => {
    if (autoPlay) play();
  }, [autoPlay, play]);

  const aProps = useAnimatedProps(() => ({
    transform: pivotTransform(
      logoVectorMedia.centers.a.x,
      logoVectorMedia.centers.a.y,
      aX.value,
      aY.value,
      aScale.value,
      0,
    ),
    opacity: aOpacity.value,
  }));
  const lProps = useAnimatedProps(() => ({
    transform: pivotTransform(
      logoVectorMedia.centers.l.x,
      logoVectorMedia.centers.l.y,
      lX.value,
      lY.value,
      lScale.value,
      0,
    ),
    opacity: lOpacity.value,
  }));
  const chevronProps = useAnimatedProps(() => ({
    transform: pivotTransform(
      logoVectorMedia.centers.chevron.x,
      logoVectorMedia.centers.chevron.y,
      0,
      0,
      chevronScale.value,
      chevronRotate.value,
    ),
    opacity: chevronOpacity.value,
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${logoVectorMedia.viewBox} ${logoVectorMedia.viewBox}`}
      >
        <AnimatedG animatedProps={aProps}>
          <G transform={POTRACE_TRANSFORM} fill={colors.logoForeground}>
            <Path d={logoVectorMedia.pathA} />
          </G>
        </AnimatedG>
        <AnimatedG animatedProps={lProps}>
          <G transform={POTRACE_TRANSFORM} fill={colors.logoForeground}>
            <Path d={logoVectorMedia.pathL} />
          </G>
        </AnimatedG>
        <AnimatedG animatedProps={chevronProps}>
          <G transform={POTRACE_TRANSFORM} fill={colors.primary}>
            <Path d={logoVectorMedia.pathChevron} />
          </G>
        </AnimatedG>
      </Svg>
    </View>
  );
});

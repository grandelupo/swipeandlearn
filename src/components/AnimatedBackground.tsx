import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  variant?: 'default' | 'auth';
}

const AnimatedBackground = React.memo(({ variant = 'default' }: Props) => {
  const circle1 = useRef(new Animated.ValueXY({ x: -80, y: -60 })).current;
  const circle2 = useRef(new Animated.ValueXY(
    variant === 'auth' 
      ? { x: 180, y: 0 }
      : { x: width * 0.4, y: width * 0.2 }
  )).current;
  const circle3 = useRef(new Animated.ValueXY(
    variant === 'auth'
      ? { x: 120, y: 600 }
      : { x: width * 0.1, y: width * 0.9 }
  )).current;

  const createAnimation = useCallback((
    animatedValue: Animated.ValueXY,
    start: { x: number; y: number },
    end: { x: number; y: number },
    duration: number
  ) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: end,
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(animatedValue, {
        toValue: start,
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad)
      })
    ]);
  }, []);

  useEffect(() => {
    const animations = [
      Animated.loop(
        createAnimation(
          circle1,
          { x: -80, y: -60 },
          { x: -60, y: -40 },
          12000
        )
      ),
      Animated.loop(
        createAnimation(
          circle2,
          variant === 'auth' 
            ? { x: 180, y: 0 }
            : { x: width * 0.4, y: width * 0.2 },
          variant === 'auth'
            ? { x: 200, y: 20 }
            : { x: width * 0.45, y: width * 0.25 },
          15000
        )
      ),
      Animated.loop(
        createAnimation(
          circle3,
          variant === 'auth'
            ? { x: 120, y: 600 }
            : { x: width * 0.1, y: width * 0.9 },
          variant === 'auth'
            ? { x: 140, y: 620 }
            : { x: width * 0.12, y: width * 0.92 },
          18000
        )
      )
    ];

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [createAnimation, variant]);

  return (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle1.x },
              { translateY: circle1.y }
            ],
            backgroundColor: COLORS.accent,
            opacity: variant === 'auth' ? 0.9 : 0.18,
            ...(variant === 'auth' && styles.authShape1)
          }
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle2.x },
              { translateY: circle2.y }
            ],
            backgroundColor: COLORS.bright,
            opacity: variant === 'auth' ? 0.9 : 0.13
          }
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle3.x },
              { translateY: circle3.y }
            ],
            backgroundColor: variant === 'auth' ? COLORS.brighter : COLORS.bright,
            opacity: variant === 'auth' ? 0.9 : 0.10
          }
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  authShape1: {
    width: 260,
    height: 180,
    borderBottomRightRadius: 180,
    borderBottomLeftRadius: 120,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 80,
  },
});

export default AnimatedBackground; 
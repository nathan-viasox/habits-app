import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  type?: 'complete' | 'challenge';
  onDone?: () => void;
}

/** Burst of emoji dots that scatter and fade on completion. */
export function CelebrationOverlay({ visible, type = 'complete', onDone }: Props) {
  const dots = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      translate: new Animated.ValueXY({ x: 0, y: 0 }),
    })),
  ).current;

  useEffect(() => {
    if (!visible) return;

    const animations = dots.map((dot, i) => {
      const angle = (i / dots.length) * 2 * Math.PI;
      const radius = type === 'challenge' ? 60 : 40;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;

      dot.opacity.setValue(1);
      dot.translate.setValue({ x: 0, y: 0 });

      return Animated.parallel([
        Animated.timing(dot.translate, {
          toValue: { x: tx, y: ty },
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dot.opacity, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(dot.opacity, {
            toValue: 0,
            duration: 450,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => onDone?.());
  }, [visible, type]);

  if (!visible) return null;

  const dotEmojis = type === 'challenge'
    ? ['🏆', '⭐', '🎉', '✨', '🌟', '🎊', '💫', '🔥']
    : ['✨', '⭐', '💚', '🌟', '✅', '💫', '🎉', '✨'];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.opacity,
              transform: [
                { translateX: dot.translate.x },
                { translateY: dot.translate.y },
              ],
            },
          ]}
        >
          <Text style={styles.dotText}>{dotEmojis[i]}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

/** A floating "+1" label that rises and fades. */
export function FloatingLabel({ visible, label = '+1', onDone }: { visible: boolean; label?: string; onDone?: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(1);
    translateY.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -40,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]),
    ]).start(() => onDone?.());
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.floatingLabel, { opacity, transform: [{ translateY }] }]}
    >
      <Text style={styles.floatingLabelText}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  dotText: {
    fontSize: 16,
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingLabelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34C759',
  },
});

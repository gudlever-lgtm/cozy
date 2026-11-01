import React, { forwardRef, useRef, useState } from "react";
import {
  Animated,
  View,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
} from "react-native";
/** Persistent, high-contrast overflow indicator; gesture offset updates Animated, not React state. */
export const StrongScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function StrongScrollView(
    { style, onLayout, onContentSizeChange, onScroll, children, ...props },
    ref,
  ) {
    const [viewport, setViewport] = useState(0),
      [content, setContent] = useState(0);
    const offset = useRef(new Animated.Value(0)).current;
    const overflow = content > viewport + 2 && viewport > 0;
    const track = Math.max(0, viewport - 8),
      thumb = Math.min(
        track,
        Math.max(28, (track * viewport) / Math.max(content, 1)),
      );
    return (
      <View style={[styles.container, style]}>
        <Animated.ScrollView
          {...props}
          ref={ref}
          style={styles.scroll}
          nestedScrollEnabled
          persistentScrollbar
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={(event) => {
            setViewport(event.nativeEvent.layout.height);
            onLayout?.(event);
          }}
          onContentSizeChange={(w, h) => {
            setContent(h);
            onContentSizeChange?.(w, h);
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: offset } } }],
            { useNativeDriver: false, listener: onScroll },
          )}
        >
          {children}
        </Animated.ScrollView>
        {overflow && (
          <View
            testID="strong-scroll-track"
            pointerEvents="none"
            style={[styles.track, { height: track }]}
          >
            <Animated.View
              style={[
                styles.thumb,
                {
                  height: thumb,
                  transform: [
                    {
                      translateY: offset.interpolate({
                        inputRange: [0, Math.max(1, content - viewport)],
                        outputRange: [0, Math.max(0, track - thumb)],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  },
);
const styles = StyleSheet.create({
  container: { flexGrow: 1, flexShrink: 1, minHeight: 0 },
  scroll: { flex: 1, minHeight: 0 },
  track: {
    position: "absolute",
    right: 1,
    top: 4,
    width: 8,
    borderRadius: 5,
    backgroundColor: "#35594466",
  },
  thumb: {
    width: 8,
    borderRadius: 5,
    backgroundColor: "#efc765",
    borderWidth: 1,
    borderColor: "#6c5427",
  },
});

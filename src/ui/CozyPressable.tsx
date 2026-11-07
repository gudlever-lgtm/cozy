import React from "react";
import { Pressable, type PressableProps } from "react-native";
import { Timber } from "./CozyButton";
import { cozy } from "./theme";

/** Shared material surface for icon actions and controls with custom contents. */
export function CozyPressable({
  children,
  style,
  variant = "paper",
  ...props
}: PressableProps & { variant?: "paper" | "wood" }) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        {
          minWidth: 44,
          minHeight: 44,
          borderRadius: 13,
          ...cozy.shadow,
          shadowOpacity: 0.14,
          shadowRadius: 3,
          elevation: 2,
        },
        typeof style === "function" ? style(state) : style,
        state.pressed &&
          !props.disabled && { transform: [{ translateY: 1 }], opacity: 0.9 },
        props.disabled && { opacity: 0.5 },
      ]}
    >
      {(state) => (
        <>
          <Timber
            paper={variant === "paper"}
            green={props.accessibilityState?.selected === true}
            muted={!!props.disabled}
          />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Pressable>
  );
}

import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const hide = () => {
      void NavigationBar.setVisibilityAsync("hidden");
    };
    hide();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") hide();
    });
    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

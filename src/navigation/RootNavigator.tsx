import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NavTabKey } from "../ui/components/CozyBottomNavigation";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { MainScreen } from "../screens/MainScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Main: { tab?: NavTabKey } | undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "Settings" }} />
    </Stack.Navigator>
  );
}

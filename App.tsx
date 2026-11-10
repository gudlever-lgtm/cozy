import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LocaleProvider } from "./src/i18n/LocaleContext";
import { PreferencesProvider } from "./src/ui/providers/PreferencesContext";
import { RewardLedgerProvider } from "./src/ui/providers/RewardLedgerContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <PreferencesProvider>
            <RewardLedgerProvider>
              <StatusBar style="dark" />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </RewardLedgerProvider>
          </PreferencesProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

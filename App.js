import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import CameraScreen from "./src/screens/CameraScreen";
import ResultScreen from "./src/screens/ResultScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import TextTranslateScreen from "./src/screens/TextTranslateScreen";
import SpeechScreen from "./src/screens/SpeechScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Scan & Translate" }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: "Scan Tekst" }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Oversættelse" }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "Oversættelseshistorik" }}
        />
        <Stack.Screen
          name="TextTranslate"
          component={TextTranslateScreen}
          options={{ title: "Oversæt Tekst" }}
        />
        <Stack.Screen
          name="Speech"
          component={SpeechScreen}
          options={{ title: "Oversæt tale" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

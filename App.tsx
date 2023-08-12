import { StatusBar } from "expo-status-bar";
import React, { Suspense } from "react";
import { StyleSheet, Text, View } from "react-native";
import MainScreen from "./src/components/MainScreen";
import { THREE } from "expo-three";
global.THREE = global.THREE || THREE;

export default function App() {
  return (
    <Suspense fallback={null}>
      <MainScreen />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

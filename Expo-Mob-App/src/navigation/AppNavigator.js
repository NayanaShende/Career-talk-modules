import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchExpertsScreen from "../screens/expert/SearchExpertsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SearchExperts"
          component={SearchExpertsScreen}
          options={{ title: "Search Experts" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

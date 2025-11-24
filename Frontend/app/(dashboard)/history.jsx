import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constant/Colors";

export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-gray-100 pt-14 px-5 items-center justify-center">
      {/* Icon */}
      <View className="bg-white p-6 rounded-3xl shadow-lg mb-5">
        <Ionicons name="time-outline" size={50} color="#6B7280" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900">
        History Coming Soon
      </Text>

      {/* Subtitle */}
      <Text className="text-center text-gray-500 text-sm mt-2 px-10">
        You’ll soon be able to view your past scans and product safety results here.
      </Text>

      {/* Optional small button */}
      <TouchableOpacity
        className="mt-6  px-6 py-3 rounded-xl"
        style={{backgroundColor:Colors.primary}}
        onPress={() => console.log("Feature coming soon")}
      >
        <Text className="text-white text-sm font-semibold">
          Feature in Progress 🚧
        </Text>
      </TouchableOpacity>
    </View>
  );
}

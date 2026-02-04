import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

const myIp = process.env.EXPO_PUBLIC_MY_IP_ADDRESS;
const API_BASE_URL = `http://${myIp}:5000/api`; // change this Prateek

// words we don't want anywhere in labels / category
const BLOCKED_SUBSTRINGS = ["kosher", "halal", "plant based", "plant-based"];

function isBlockedText(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return BLOCKED_SUBSTRINGS.some((b) => lower.includes(b));
}

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigation = useNavigation();

  const firstName = user?.firstName || "User";

  const [healthyFoods, setHealthyFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [foodsError, setFoodsError] = useState(null);

  // for bottom sheet
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleFoodPress = (item) => {
    setSelectedFood(item);
    setDetailVisible(true);
  };

  useEffect(() => {
    const fetchHealthyFoods = async () => {
      try {
        setLoadingFoods(true);
        setFoodsError(null);

        const token = await getToken({ template: "backend" });
        const res = await fetch(`${API_BASE_URL}/recommendations/healthy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setFoodsError(data.message || "Failed to load healthy foods");
        } else {
          setHealthyFoods(data.items || []);
        }
      } catch (err) {
        console.error("Healthy foods error:", err);
        setFoodsError("Something went wrong");
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchHealthyFoods();
  }, []);

  return (
    <View className="flex-1 bg-gray-100 pt-14 px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-[34px] font-extrabold text-[#15803d] leading-9">
          Nutri<Text className="text-[#F59E0B]">Scan</Text>
        </Text>
        <Text className="text-xl font-semibold text-gray-900 mt-2">
          Hey {firstName} 👋
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Scan food labels, avoid risky ingredients, and discover safe options.
        </Text>

        {/* Main Scan Block */}
        <TouchableOpacity
          className="bg-gray-900 mt-6 p-5 rounded-2xl"
          onPress={() => navigation.navigate("scan")}
        >
          <Text className="text-white font-bold text-lg">Start Scanning</Text>
          <Text className="text-gray-300 text-sm mt-1">
            Detect harmful or unknown ingredients instantly.
          </Text>
          <Text className="text-indigo-300 mt-3 text-sm font-semibold">
            Tap to scan →
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          Quick actions
        </Text>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow w-[32%]"
            onPress={() => navigation.navigate("scan")}
          >
            <Text className="font-semibold text-gray-800 text-sm">Scan</Text>
            <Text className="text-gray-500 text-[11px] mt-1">New label</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow w-[32%]"
            onPress={() => navigation.navigate("history")}
          >
            <Text className="font-semibold text-gray-800 text-sm">History</Text>
            <Text className="text-gray-500 text-[11px] mt-1">Past scans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow w-[32%]"
            onPress={() => navigation.navigate("profile")}
          >
            <Text className="font-semibold text-gray-800 text-sm">Profile</Text>
            <Text className="text-gray-500 text-[11px] mt-1">Your info</Text>
          </TouchableOpacity>
        </View>

        {/* Healthy Foods Section */}
        <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
          Healthy for you 🥗
        </Text>
        <Text className="text-gray-500 text-xs mb-3">
          Foods that don&apos;t contain your saved allergies.
        </Text>

        {loadingFoods && <ActivityIndicator className="mt-2" />}

        {foodsError && (
          <Text className="text-red-500 text-xs mb-2">{foodsError}</Text>
        )}

        {!loadingFoods && healthyFoods.length === 0 && !foodsError && (
          <Text className="text-gray-400 text-xs">
            No suggestions yet. Add your allergies in profile and try again.
          </Text>
        )}

        {/* 2-column vertical grid */}
        {!loadingFoods && healthyFoods.length > 0 && (
          <View className="flex-row flex-wrap justify-between mb-6">
            {healthyFoods.map((item) => {
              // Filter labels by blocked substrings
              const labels = Array.isArray(item.labels)
                ? item.labels.filter((l) => !isBlockedText(l))
                : [];

              // Clean category (hide if contains blocked words)
              const category =
                item.category && !isBlockedText(item.category)
                  ? item.category
                  : null;

              return (
                <TouchableOpacity
                  key={item.id || item._id}
                  className="bg-white rounded-2xl mb-4 p-3 w-[48%] shadow"
                  activeOpacity={0.9}
                  onPress={() => handleFoodPress(item)}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-24 rounded-xl mb-2"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-sm font-semibold text-gray-900"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  {/* Category */}
                  {category && (
                    <Text
                      className="text-[10px] text-amber-700 mt-1"
                      numberOfLines={1}
                    >
                      {category}
                    </Text>
                  )}

                  {/* Description */}
                  <Text
                    className="text-[11px] text-gray-500 mt-1"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>

                  {/* Chips row */}
                  <View className="mt-2 flex-row flex-wrap items-center">
                    {/* NutriScore chip */}
                    {item.nutriScore && (
                      <View className="px-2 py-0.5 rounded-full bg-emerald-50 mr-1 mb-1">
                        <Text className="text-[10px] text-emerald-700">
                          NutriScore:{" "}
                          {String(item.nutriScore).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* label chips */}
                    {labels.slice(0, 2).map((label, idx) => (
                      <View
                        key={`label-${idx}`}
                        className="px-2 py-0.5 rounded-full bg-blue-50 mr-1 mb-1"
                      >
                        <Text className="text-[10px] text-blue-700">
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text className="text-[10px] text-emerald-600 mt-1">
                    ✅ Safe based on your allergies
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom-sheet style detail modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        {/* Full screen container: overlay on top, sheet at bottom */}
        <View className="flex-1 justify-end">
          {/* Dark overlay - tap here to close */}
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View className="flex-1 bg-black/40" />
          </TouchableWithoutFeedback>

          {/* Bottom sheet */}
          <View className="bg-white rounded-t-3xl px-5 pt-4 pb-6">
            {/* drag handle */}
            <View className="items-center mb-3">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {selectedFood && (
              <>
                {/* top row */}
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: selectedFood.imageUrl }}
                    className="w-16 h-16 rounded-2xl mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">
                      {selectedFood.name}
                    </Text>
                    {/* Clean category in modal too */}
                    {selectedFood.category &&
                      !isBlockedText(selectedFood.category) && (
                        <Text className="text-xs text-amber-700 mt-1">
                          {selectedFood.category}
                        </Text>
                      )}
                  </View>
                </View>

                {/* description */}
                <Text className="text-xs text-gray-600 mb-3">
                  {selectedFood.description ||
                    "No additional description available for this product."}
                </Text>

                {/* chips in modal */}
                <View className="flex-row flex-wrap mb-2">
                  <View className="px-3 py-1 rounded-full bg-emerald-50 mr-2 mb-2">
                    <Text className="text-[11px] text-emerald-700">
                      ✅ Allergy-safe for you
                    </Text>
                  </View>

                  {selectedFood.nutriScore && (
                    <View className="px-3 py-1 rounded-full bg-blue-50 mr-2 mb-2">
                      <Text className="text-[11px] text-blue-700">
                        NutriScore:{" "}
                        {String(selectedFood.nutriScore).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {Array.isArray(selectedFood.labels) &&
                    selectedFood.labels
                      .filter((l) => !isBlockedText(l))
                      .slice(0, 4)
                      .map((label, idx) => (
                        <View
                          key={`modal-label-${idx}`}
                          className="px-3 py-1 rounded-full bg-amber-50 mr-2 mb-2"
                        >
                          <Text className="text-[11px] text-amber-700">
                            {label}
                          </Text>
                        </View>
                      ))}
                </View>

                {/* close button */}
                <TouchableOpacity
                  onPress={() => setDetailVisible(false)}
                  className="mt-4 py-2.5 rounded-2xl items-center bg-gray-900"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-sm font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

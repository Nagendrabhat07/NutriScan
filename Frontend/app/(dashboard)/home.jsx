import { useEffect, useState } from "react";
import {View,Text,TouchableOpacity,ScrollView,Image,ActivityIndicator,} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

const myIp = process.env.EXPO_PUBLIC_MY_IP_ADDRESS;
const API_BASE_URL = `http://${myIp}:5000/api`; // change this Prateek

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigation = useNavigation();

  const firstName = user?.firstName || "User";

  const [healthyFoods, setHealthyFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [foodsError, setFoodsError] = useState(null);

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
        <Text className="text-[34px] font-extrabold text-[#15803d]  leading-9">
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
            {healthyFoods.map((item) => (
              <View
                key={item.id || item._id}
                className="bg-white rounded-2xl mb-4 p-3 w-[48%] shadow"
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
                <Text
                  className="text-[11px] text-gray-500 mt-1"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
                <Text className="text-[10px] text-emerald-600 mt-1">
                  ✅ Safe based on your allergies
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}


import {View,Text,Image,TouchableOpacity,Dimensions,Platform,StatusBar,ScrollView,StyleSheet,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";

export default function WellcomeTailwind() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("window");

  // Card constraints 
  const CARD_MAX_WIDTH = Math.min(width * 0.94, 760);
  const CARD_MAX_HEIGHT = Math.min(height * 0.82, 1000);

  // Logo
  const LOGO_SIZE = Math.round(Math.min(CARD_MAX_WIDTH * 0.9, CARD_MAX_HEIGHT * 0.60));

  return (
    <SafeAreaView
      className="flex-1"
      
    >
      <LinearGradient
        colors={["#d8fcd8", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1 items-center justify-start"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: "100%", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}
        >
          
            

          {/* Glass Card*/}
          <View
            className="rounded-3xl items-center bg-white/80 p-7"
            style={{
              width: CARD_MAX_WIDTH,
              maxHeight: CARD_MAX_HEIGHT,
              // shadow
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              marginTop:80
            }}
          >
            {/* Spacer */}
            <View className="h-2" />

            {/* Logo */}
            <View className="items-center my-3">
              <Image
                source={require("../../assets/new-logo.jpeg")}
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                resizeMode="contain"
                className="mb-3"
              />
            </View>

            {/* Heading */}
            <Text className="text-[34px] font-extrabold text-[#15803d] text-center leading-9">
              Let’s <Text className="text-[#F59E0B]">Get Started</Text>
            </Text>

            {/* Tagline */}
            <Text className="text-gray-500 text-base text-center mt-2 mb-4">
              Scan, Track, Eat Smarter
            </Text>

            {/* Flexible spacer to push CTA toward bottom of card */}
            <View style={{ flexGrow: 1 }} />

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("sign-up")}
              className="w-4/5 items-center py-3 rounded-xl"
              style={{
                backgroundColor: "#F59E0B",
                elevation: 4,
                shadowColor: "#F59E0B",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <Text className="text-gray-800 font-extrabold text-lg">Sign Up</Text>
            </TouchableOpacity>

            {/* Sign in */}
            <View className="flex-row items-center mt-4">
              <Text className="text-black font-semibold">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("sign-in")}>
                <Text className="text-[#F59E0B] font-semibold"> Sign In</Text>
              </TouchableOpacity>
            </View>
            {/* round Background */}
            <View
            style={{
              position:"absolute",
              top: 20,
              width:LOGO_SIZE*1.4,
              height:LOGO_SIZE*1.4,
              borderRadius:(LOGO_SIZE*1.8)/2,
              backgroundColor:"#4EE39A",
              opacity:0.08,
              
            }}
          />
          </View>
          
        </ScrollView>
        
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});

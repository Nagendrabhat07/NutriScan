import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router';


const Wellcome = () => {
  const { height } = Dimensions.get("window");
  const navigation = useNavigation()
 
  const LOGO_SIZE = height * 0.55; 

  return (
    <SafeAreaView className="flex-1 bg-[#d2f5d2] items-center justify-start pt-10">

    <Text className="text-4xl font-extrabold text-gray-900 mt-6"
        style={{ textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 4 }}>
       Let’s <Text className="text-yellow-500">Get Started</Text>
      </Text>

      
      <View className="mt-6 items-center">
        <Image
          source={require("../../assets/Logo.png")}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          className="mb-2"
          resizeMode="contain"
        />
      </View>

      
      <Text className="text-gray-700 text-lg mt-2">
        Scan, Track, Eat Smarter
      </Text>

      
      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-yellow-400 w-4/5 py-3 rounded-xl mt-10 shadow-lg"
        onPress={()=>{navigation.navigate("sign-up")}}
      >
        <Text className="text-xl font-bold text-center text-gray-800">
          Sign Up
        </Text>
      </TouchableOpacity>

      
      <View className="flex-row justify-center mt-4">
        <Text className="font-semibold text-gray-800">Already have an account?</Text>
        <TouchableOpacity onPress={()=>{navigation.navigate("sign-in")}}>
          <Text className="font-semibold text-yellow-500"> Sign In</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default Wellcome;

const styles = StyleSheet.create({});

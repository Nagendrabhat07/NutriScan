
import { StyleSheet, Text, View } from 'react-native'
import '../global.css'
import { Stack } from 'expo-router'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'


const _layout = () => {
  return (
    <ClerkProvider tokenCache={tokenCache} >
        <Stack
          screenOptions={{
            headerShown : false
          }}
        >
          
          <Stack.Screen name='(auth)' options={{headerShown: false}} />
          <Stack.Screen name='(dashboard)' options={{headerShown: false}} />
          <Stack.Screen name="index" options={{ title: "Home" }} />
        </Stack>
    </ClerkProvider>
  )
}

export default _layout

const styles = StyleSheet.create({})
import { Stack, useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useEffect } from 'react'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/home') // Redirect to the home page
    }
  }, [isSignedIn])

  return <Stack
  screenOptions={{
    headerShown : false
  }}
  >
          <Stack.Screen name='wellcome' options={{headerShown: false}} />
          <Stack.Screen name='sign-up' options={{headerShown: false}} />
          <Stack.Screen name="sign-in" options={{ headerShown:false}} />
  </Stack>
}
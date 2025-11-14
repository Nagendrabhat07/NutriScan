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

  return <Stack />
}
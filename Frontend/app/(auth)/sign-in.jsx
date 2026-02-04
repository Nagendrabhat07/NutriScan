import { useSignIn } from '@clerk/clerk-expo'
import { Link, useNavigation, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native'
import React from 'react'
import GoogleSignIn from '../../components/GoogleSignIn'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { Colors } from '../../constant/Colors'
import { navigate } from 'expo-router/build/global-state/routing'

function parseClerkError(err) {
  // Try to extract useful message from Clerk error object
  try {
    return (
      err?.errors?.[0]?.longMessage ||
      err?.errors?.[0]?.message ||
      err?.message ||
      JSON.stringify(err)
    )
  } catch (e) {
    return 'An unexpected error occurred'
  }
}

export default function Page() {
  const navigation = useNavigation()

  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Basic client-side validation
  const validate = () => {
    if (!emailAddress) return 'Please enter your email'
    if (!password) return 'Please enter your password'
    return null
  }

  // Handle the sign-in
  const onSignInPress = async () => {
    // clear previous error
    setErrorMessage('')

    if (!isLoaded) {
      setErrorMessage('Auth system not ready yet, try again shortly.')
      return
    }

    const validationMsg = validate()
    if (validationMsg) {
      setErrorMessage(validationMsg)
      return
    }

    setLoading(true)
    try {
      // Start the sign-in process using the email and password provided
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/') // or your home route
      } else {
        // show message if Clerk returns something incomplete
        setErrorMessage('Sign-in not completed. Please check your email for further steps.')
        console.error('Sign in not complete:', signInAttempt)
      }
    } catch (err) {
      // **CATCH** any Clerk errors and show them in UI 
      const msg = parseClerkError(err)
      setErrorMessage(msg)
      console.error('Clerk sign-in error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.primary }}>
      <SafeAreaView className="flex-1">
        {/* Top header + back + logo */}
        <View className="px-6 pt-4">
          {/* back button */}
          <View className="flex-row justify-start">
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
              className="bg-yellow-400/90 p-2 rounded-tr-2xl rounded-bl-2xl"
            >
              <ArrowLeftIcon size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View className="flex-row justify-center mt-4">
            <Image
              source={require('../../assets/tNew-logo.png')}
              style={{ height: 220, width: 220 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Sign in form card */}
        <View
          className="flex-1 bg-white px-6 pt-6"
          style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36 }}
        >
          <View className="mb-3">
            <Text className="text-xs font-semibold text-gray-400 tracking-[1px] ml-1">
              WELCOME BACK
            </Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1 ml-1">
              Sign in
            </Text>
            <Text className="text-[11px] text-gray-500 mt-1 ml-1">
              Enter your credentials to access your NutriScan account.
            </Text>
          </View>

          {errorMessage !== '' && (
            <Text className="text-xs text-red-600 mb-3 ml-1">
              {errorMessage}
            </Text>
          )}

          {/* Email */}
          <View className="mb-3">
            <Text className="text-[11px] text-gray-500 mb-1 ml-1">
              Email
            </Text>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(email) => setEmailAddress(email)}
              keyboardType="email-address"
              className="p-4 bg-gray-50 text-gray-800 rounded-2xl border border-gray-200 text-sm"
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-[11px] text-gray-500 mb-1 ml-1">
              Password
            </Text>
            <TextInput
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(p) => setPassword(p)}
              className="p-4 bg-gray-50 text-gray-800 rounded-2xl border border-gray-200 text-sm"
            />
          </View>

          {/* (Optional) Forgot password text */}
          <View className="items-end mb-4">
            <Text className="text-[11px] text-gray-500">
              Forgot password? {/* later you can make this a link */}
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity
            onPress={onSignInPress}
            disabled={loading}
            className="py-3.5 rounded-2xl items-center mb-4"
            style={{
              backgroundColor: loading ? '#9fc3ff' : Colors.primary,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">
                Continue
              </Text>
            )}
          </TouchableOpacity>

          {/* Or divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-2 text-[11px] text-gray-400">
              OR CONTINUE WITH
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google Sign In */}
          <View className="mt-3">
            <GoogleSignIn />
          </View>

          {/* Bottom - Sign up link */}
          <View className="flex-row items-center mt-6">
            <Text className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-sm font-semibold" style={{ color: Colors.primary }}>
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

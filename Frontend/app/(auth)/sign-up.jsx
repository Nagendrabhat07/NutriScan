import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useNavigation, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

import { Colors } from '../../constant/Colors'

function parseClerkError(err) {
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

export default function SignUpScreen() {
  const navigation = useNavigation()

  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  //This are states broooooo
  const [username, setUsername] = React.useState('')             
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  // Basic username validation 
  const usernameIsValid = (u) => {
    if (!u) return false
    const re = /^[a-z0-9._-]{3,24}$/
    return re.test(u)
  }

  // basic client-side validation
  const validate = () => {
    if (!username) return 'Please choose a username'           
    if (!usernameIsValid(username)) return 'Username invalid — use 3-24 lowercase letters, numbers or ._-'
    if (!emailAddress) return 'Please enter your email'
    if (!password) return 'Please enter a password'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    setErrorMessage('')

    if (!isLoaded) {
      setErrorMessage('Auth system not ready yet, try again.')
      return
    }

    const v = validate()
    if (v) {
      setErrorMessage(v)
      return
    }

    setLoading(true)
    //creats account
    try {
      await signUp.create({
        emailAddress,
        password,
        username,              
      })

      // Send user an email with verification code 
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // show OTP input
      setPendingVerification(true)
    } catch (err) {
      const msg = parseClerkError(err)
      setErrorMessage(msg)
      console.error('Clerk sign-up error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    setErrorMessage('')
    if (!isLoaded) {
      setErrorMessage('Auth system not ready yet, try again.')
      return
    }
    if (!code) {
      setErrorMessage('Please enter the verification code sent to your email.')
      return
    }

    setVerifyLoading(true)
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        // signUpAttempt.createdSessionId is required to set active session
        await setActive({ session: signUpAttempt.createdSessionId })

        router.replace('/') // redirect to home
      } else {
        setErrorMessage('Verification not complete. Please try again or request a new code.')
        console.error('Verification status:', signUpAttempt)
      }
    } catch (err) {
      const msg = parseClerkError(err)
      setErrorMessage(msg)
      console.error('Clerk verification error:', err)
    } finally {
      setVerifyLoading(false)
    }
  }

  // ------------- PENDING VERIFICATION UI -------------
  if (pendingVerification) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-100"
        style={{ backgroundColor: Colors.primary }}
      >
        <View className="flex-1 px-6 pt-6">
          {/* Back */}
          <View className="flex-row justify-start mb-4">
            <TouchableOpacity
              onPress={() => setPendingVerification(false)}
              className="bg-white/90 p-2 rounded-2xl"
            >
              <ArrowLeftIcon size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-white rounded-3xl px-5 py-6 shadow-lg">
            <Text className="text-xs font-semibold text-gray-400 tracking-[1px]">
              EMAIL VERIFICATION
            </Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">
              Verify your email
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              We&apos;ve sent a 6-digit code to{" "}
              <Text className="font-semibold">
                {emailAddress || "your email"}
              </Text>
              . Enter it below to finish creating your account.
            </Text>

            {errorMessage !== '' && (
              <Text className="text-xs text-red-600 mt-4">
                {errorMessage}
              </Text>
            )}

            <TextInput
              value={code}
              placeholder="Enter your verification code"
              onChangeText={(c) => setCode(c)}
              keyboardType="number-pad"
              className="mt-5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm tracking-[4px]"
            />

            <TouchableOpacity
              onPress={onVerifyPress}
              disabled={verifyLoading}
              className="mt-5 py-3.5 rounded-2xl items-center"
              style={{
                backgroundColor: verifyLoading ? '#9fc3ff' : Colors.primary,
              }}
            >
              {verifyLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">
                  Verify & continue
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-[11px] text-gray-500 mt-4">
              Didn&apos;t get a code? Check your spam folder or try again in a few minutes.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ------------- SIGN UP UI -------------
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
              source={require('../../assets/Logo.png')}
              style={{ width: 220, height: 220 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* sign up form card */}
        <View
          className="flex-1 bg-white px-6 pt-6"
          style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36 }}
        >
          <View className="mb-2">
            <Text className="text-xs font-semibold text-gray-400 tracking-[1px] ml-1">
              CREATE ACCOUNT
            </Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1 ml-1">
              Sign up
            </Text>
          </View>

          {errorMessage !== '' && (
            <Text className="text-xs text-red-600 mb-3 ml-1">
              {errorMessage}
            </Text>
          )}

          {/* Username */}
          <View className="mb-3">
            <Text className="text-[11px] text-gray-500 mb-1 ml-1">
              Username
            </Text>
            <TextInput
              autoCapitalize="none"
              value={username}
              placeholder="Choose a username (3-24 chars)"
              onChangeText={(u) => setUsername(u)}
              className="p-4 bg-gray-50 text-gray-800 rounded-2xl border border-gray-200 text-sm"
            />
          </View>

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
          <View className="mb-4">
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
            <Text className="text-[10px] text-gray-400 mt-1 ml-1">
              Minimum 6 characters.
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={loading}
            className="py-3.5 rounded-2xl items-center mb-3"
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

          {/* Already have account */}
          <View className="flex-row items-center mt-2">
            <Text className="text-sm text-gray-600">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-sm font-semibold" style={{ color: Colors.primary }}>
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

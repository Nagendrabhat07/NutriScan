import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
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

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  // basic client-side validation (adjust to your policy)
  const validate = () => {
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
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code (Clerk)
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

  if (pendingVerification) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>Verify your email</Text>

        {errorMessage !== '' && (
          <Text style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</Text>
        )}

        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(c) => setCode(c)}
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 6 }}
        />

        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={verifyLoading}
          style={{
            backgroundColor: verifyLoading ? '#9fc3ff' : '#007AFF',
            padding: 12,
            alignItems: 'center',
            borderRadius: 8,
          }}
        >
          {verifyLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Verify</Text>}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white" style={{backgroundColor:Colors.primary}}>
        <SafeAreaView>

          {/* back button */}
          <View className="flex-row justify-start">
            <TouchableOpacity
            onPress={()=>{navigation.goBack()}}
              className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
            >
              <ArrowLeftIcon size="20" color="black"/>
            </TouchableOpacity>
          </View>
          
          <View>
            
          </View>

          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 16 }}>Sign up</Text>

            {errorMessage !== '' && <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>}

            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(email) => setEmailAddress(email)}
              keyboardType="email-address"
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 6 }}
            />
            <TextInput
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(p) => setPassword(p)}
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 6 }}
            />

            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9fc3ff' : '#007AFF',
                padding: 12,
                alignItems: 'center',
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Continue</Text>}
            </TouchableOpacity>

            <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
              <Text>Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text style={{ color: '#007AFF' }}>Sign in</Text>
              </Link>
            </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

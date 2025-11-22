
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

          {/* Photo */}
          <View className="flex-row justify-center">
            <Image source={require('../../assets/Logo.png')}
             style={{width:250,height:250}}
            />
          </View>
      </SafeAreaView>

      {/* sign up form */}
      <View className="flex-1 bg-white px-8 pt-8"
        style={{borderTopLeftRadius:50 , borderTopRightRadius:50}}
      >
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 16 }} className="text-red-700 font-bold ml-2">Sign up</Text>

            {errorMessage !== '' && <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>}

            {/* Username */}
            <TextInput
              autoCapitalize="none"
              value={username}
              placeholder="Choose a username (3-24 chars)"
              onChangeText={(u) => setUsername(u)}
              style={{ borderWidth: 1, borderColor: '#ddd', marginBottom: 12 }}
              className="p-5 bg-gray-100 text-gray-700 rounded-2xl"
            />
            
            {/* Email */}
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(email) => setEmailAddress(email)}
              keyboardType="email-address"
              style={{ borderWidth: 1, borderColor: '#ddd',  marginBottom: 12,}}
              className="p-5 bg-gray-100 text-gray-700 rounded-2xl"
            />

            {/* Password */}
            <TextInput
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(p) => setPassword(p)}
              style={{ borderWidth: 1, borderColor: '#ddd', marginBottom: 12, }}
              className="p-5 bg-gray-100 text-gray-700 rounded-2xl"
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
      </View>
    </View>
  )
}

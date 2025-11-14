// app/(auth)/sign-in.jsx
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React from 'react'
import GoogleSignIn from '../../components/GoogleSignIn'

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

  // Handle the submission of the sign-in form
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
      // **CATCH** any Clerk errors and show them in UI (no red overlay)
      const msg = parseClerkError(err)
      setErrorMessage(msg)
      console.error('Clerk sign-in error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>Sign in</Text>

      {errorMessage !== '' && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
      )}

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
        onPress={onSignInPress}
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

      <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        <Link href="/(auth)/sign-up">
          <Text style={{ color: '#007AFF' }}>Sign up</Text>
        </Link>
      </View>

      <View style={{ marginTop: 20 }}>
        <GoogleSignIn />
      </View>
    </View>
  )
}

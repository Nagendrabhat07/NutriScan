
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
    <View className="flex-1 bg-white" style={{backgroundColor:Colors.primary}} >
      <SafeAreaView>

          {/* back button */}
          <View className="flex-row justify-start">
              <TouchableOpacity
              onPress={()=>{navigation.goBack()}}
              className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
              >
                  <ArrowLeftIcon size="20" color="black" />
              </TouchableOpacity>
          </View>

          {/* Photo */}
          <View className="flex-row justify-center">
            <Image source={require('../../assets/Logo.png')} style={{height:250 , width:250}} />
          </View>
      </SafeAreaView>

      {/* Sign in form */}
      <View className="flex-1 bg-white px-8 pt-8"
        style={{borderTopLeftRadius:50 , borderTopRightRadius:50}}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 22, marginBottom: 16 }} className="text-red-700 font-bold" >Sign in</Text>

          {errorMessage !== '' && (
            <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
          )}

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
          keyboardType="email-address"
          style={{ borderWidth: 1, borderColor: '#ddd', marginBottom: 12,  }}
          className="p-5 bg-gray-100 text-gray-700 rounded-2xl"
        />
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(p) => setPassword(p)}
          style={{ borderWidth: 1, borderColor: '#ddd',  marginBottom: 12, }}
          className="p-5 bg-gray-100 text-gray-700 rounded-2xl"
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
          <View style={{ marginTop: 20 }}>
          <GoogleSignIn />
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          <Link href="/(auth)/sign-up">
            <Text style={{ color: '#007AFF' }}>Sign up</Text>
          </Link>
        </View>

        
    </View>
      </View>
    </View>
  )
}

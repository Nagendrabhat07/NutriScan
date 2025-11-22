import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity } from 'react-native'

 const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const handleSignOut = async () => {
    try {
      await signOut()
      // back to wellcome page
      Linking.openURL(Linking.createURL('/wellcome'))
    } catch (err) {

      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text className="text-xl font-bold text-blue-500">Sign out</Text>
    </TouchableOpacity>
  )
}

 export default SignOutButton
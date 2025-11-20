import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import  SignOutButton  from '../../components/SignOutButton'
import { Link } from 'expo-router'
const profile = () => {
  return (
    <View style={{marginTop:100}}>
      <Text className="bg-red-900"  >profile</Text>
      <SignOutButton className="my-4" />
      <Link href='/' >index</Link>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({})
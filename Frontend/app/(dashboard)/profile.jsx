import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import  SignOutButton  from '../../components/SignOutButton'
const profile = () => {
  return (
    <View style={{marginTop:100}}>
      <Text className="bg-slate-100 rounded-xl" >profile</Text>
      <SignOutButton />
    </View>
  )
}

export default profile

const styles = StyleSheet.create({})
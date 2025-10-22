import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { Colors } from '../constant/Colors'

const index = () => {
  return (
    <View style = {styles.containe}>
      <Text>index</Text>
      
      <Link href='/wel' >Wellcome</Link>
      <Link href='/home' >Profile</Link>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    containe : {
        flex : 1,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor : Colors.primary
        
    }
})
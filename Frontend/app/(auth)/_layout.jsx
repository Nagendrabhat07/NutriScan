import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _lauout = () => {
  return (
    
    <Stack 
        screenOptions={{headerShown : false , animation : 'none'}}
    />
  )
}

export default _lauout

const styles = StyleSheet.create({})
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import { Colors } from '../../constant/Colors'

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
        backgroundColor: Colors.tabBar.background, // Light or dark
        height: 80,
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
       
        left: 10,
        right: 10,
        paddingTop:8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8, // for Android shadow
        },
        tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'home' : 'home-outline'}
              color={focused ? Colors.tabBar.activeIcon : Colors.tabBar.inactiveIcon}
            />
          )
        }}
      />
      <Tabs.Screen
        name='scan'
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'qr-code' : 'qr-code-outline'}
              color={focused ? Colors.tabBar.activeIcon : Colors.tabBar.inactiveIcon}
            />
          )
        }}
      />
      <Tabs.Screen
        name='history'
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'time' : 'time-outline'}
              color={focused ? Colors.tabBar.activeIcon : Colors.tabBar.inactiveIcon}
            />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'person' : 'person-outline'}
              color={focused ? Colors.tabBar.activeIcon : Colors.tabBar.inactiveIcon}
            />
          )
        }}
      />
    </Tabs>
  )
}

export default _layout
import 'react-native-url-polyfill/auto'; // <<< COLOQUE AQUI, BEM NO TOPO!
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashFinished(true);
    }, 5000); // Após 5 segundos, a Splash Screen desaparece
    return () => clearTimeout(timer);
  }, []);

  const shouldHideTabBar = (route: { name: any; }) => { const routeName = route.name; return routeName === 'Login'; };


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00008B',
        tabBarInactiveTintColor: '#808080',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          width: '100%',
          zIndex: 1,
          backgroundColor: 'white',
          opacity: isSplashFinished ? 1 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tabs>
  );
}

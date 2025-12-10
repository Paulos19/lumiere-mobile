import { ChefHat, Sparkles, User, Utensils } from '@/components/ui/icons'; // Adicione Sparkles
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C5A028',
        tabBarInactiveTintColor: '#78716c',
        tabBarLabelStyle: {
          fontFamily: 'Geist-Regular',
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atelier',
          tabBarIcon: ({ color }) => <ChefHat color={color} size={24} />,
        }}
      />
      
      {/* ROTA NOVA: DU CHEF (Substituindo Explore) */}
      <Tabs.Screen
        name="du-chef"
        options={{
          title: 'Du Chef',
          tabBarIcon: ({ color }) => <Sparkles color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Utensils color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
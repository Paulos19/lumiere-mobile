import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { signOut, user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-deep-900 justify-center items-center p-6 gap-6">
       <View className="items-center">
         <Text className="text-white font-bold text-xl">{user?.name}</Text>
         <Text className="text-stone-500">{user?.email}</Text>
       </View>
      
      <Button 
        variant="destructive" 
        label="Sair do Atelier" 
        className="w-full"
        onPress={() => signOut()} 
      />
    </SafeAreaView>
  );
}
import { cn } from '@/lib/utils';
import { ResizeMode, Video } from 'expo-av';
import { Play, Volume2, VolumeX } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

interface StepVideoProps {
  videoSource: string; // Pode ser URL normal ou base64 string completa
  className?: string;
}

export function StepVideo({ videoSource, className }: StepVideoProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Função para alternar Play/Pause
  const togglePlay = () => {
    if (status.isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  return (
    <View className={cn("relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg", className)}>
      
      {/* Loading State */}
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-deep-900/50">
          <ActivityIndicator color="#C5A028" size="large" />
        </View>
      )}

      <Video
        ref={videoRef}
        source={{ uri: videoSource }} // Aqui entra o seu base64 direto!
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.COVER}
        isLooping
        useNativeControls={false} // Vamos criar controles customizados minimalistas
        onPlaybackStatusUpdate={(s) => {
          setStatus(s);
          if (s.isLoaded) setLoading(false);
        }}
        onError={(e) => console.log("Erro no vídeo:", e)}
      />

      {/* Overlay de Controles (Toque no vídeo para pausar/tocar) */}
      {!loading && (
        <Pressable 
          onPress={togglePlay}
          className="absolute inset-0 items-center justify-center bg-black/0 active:bg-black/20"
        >
          {/* Botão Play Central (só aparece se estiver pausado) */}
          {!status.isPlaying && (
            <View className="bg-black/40 p-4 rounded-full backdrop-blur-sm border border-white/20">
              <Play fill="white" className="text-white w-8 h-8 ml-1" />
            </View>
          )}
        </Pressable>
      )}

      {/* Badge de Som (Canto inferior) */}
      <Pressable 
        onPress={() => videoRef.current?.setIsMutedAsync(!status.isMuted)}
        className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full backdrop-blur-md"
      >
        {status.isMuted ? (
          <VolumeX className="text-white w-4 h-4" />
        ) : (
          <Volume2 className="text-white w-4 h-4" />
        )}
      </Pressable>

    </View>
  );
}
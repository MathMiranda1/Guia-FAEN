import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../app/(tabs)';
import { StatusBar } from 'expo-status-bar';


const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const videoSource = require('../assets/videos/intro.mp4'); // Substitua pelo caminho do seu vídeo

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    // Navegar para a próxima tela após 3 segundos
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    // Limpar o temporizador ao desmontar
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={() => { /* Não faz nada ao tocar */ }}>
      <View style={styles.container}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={true}
          allowsPictureInPicture={false}
          nativeControls = {false}
        />
        <StatusBar style="dark" />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // Cor de fundo opcional
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
    transform: [
      { scaleX: 1.2 },
      { scaleY: 1.18 },
    ],
  },
});

export default SplashScreen;


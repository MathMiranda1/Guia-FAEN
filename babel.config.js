module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // Adicione aqui outros plugins do Babel se você usar/precisar
        // por exemplo, o plugin do Expo Router pode vir aqui se necessário:
        // require.resolve("expo-router/babel"), 
        
        // O plugin do Reanimated DEVE ser o ÚLTIMO da lista
        'react-native-reanimated/plugin', 
      ],
    };
  };
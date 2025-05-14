import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, Linking } from 'react-native';

const ProjetosScreen: React.FC = () => {
  // Dados dos projetos
  const projetos = [
    {
      descricao: 'QUER CONHECER OS PROJETOS DE ENSINO DA FAEN?',
      image: require('../assets/images/estudantes.png'),
    },
    {
      descricao: 'QUER CONHECER OS PROJETOS DE PESQUISA DA FAEN?',
      image: require('../assets/images/procurando.png'),
    },
    {
      descricao: 'QUER CONHECER OS PROJETOS DE EXTENSÃO DA FAEN?',
      image: require('../assets/images/quebracabeca.png'),
    },
  ];

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <Text style={styles.title}>Ensino, pesquisa e extensão</Text>
          <Text style={styles.description}>
            Clique e conheça o que é o famoso tripé da Universidade.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/watch?v=uOKP8_ij_r0')}>
            <Text style={styles.link}>Clique e assista um vídeo com tudo sobre esse tema!</Text>
          </TouchableOpacity>
        </View>

        {/* Único card com todos os projetos */}
        <View style={styles.allProjectsCard}>
          {projetos.map((projeto, index) => (
            <View key={index} style={styles.projectCard}>
              <Image source={projeto.image} style={styles.cardImage} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectDescription}>{projeto.descricao}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Botão para conhecer todos os projetos da FAEN */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL('https://guiadoestudantefaenuern.my.canva.site/projetos-da-faen-uern')}
        >
          <Text style={styles.buttonText}>Clique aqui e conheça todos os projetos da FAEN</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 4,
    borderColor: '#00008B',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00008B',
    marginRight: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  allProjectsCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 4,
    borderColor: '#00008B',
  },
  projectCard: {
    flexDirection: 'row', // Linha para imagem e descrição ficarem lado a lado
    alignItems: 'center',
    marginBottom: 20,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 15,
  },
  projectInfo: {
    flex: 1,
  },
  projectDescription: {
    fontSize: 16,
    color: '#1E90FF',
    textAlign: 'center', // Ajusta o texto para ficar centralizado
  },
  button: {
    backgroundColor: '#00008B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProjetosScreen;

import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image } from 'react-native';

const SobreScreen: React.FC = () => {
  return (
    <ImageBackground
      source={require('../assets/images/background.png')} // Caminho para a imagem de fundo
      style={styles.background}
    >
      <View style={styles.darkOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sobre</Text>
        <Text style={styles.text}>
          Este Guia do Estudante foi produzido por alunas/os do Projeto de Ensino
          "Desbravando caminhos para uma formação crítica em enfermagem", sob a supervisão
          das professoras Ana Karinne de Moura Saraiva e Maria Carmélia Sales do
          Amaral, e destina-se a você, aluno/aluna da Faen/Uern.

          {'\n\n'}O Projeto "Desbravando caminhos para uma formação crítica em
          enfermagem" ou
          mais conhecido como Desbravadores é um dos três projetos de ensinos da Faen.

          {'\n\n'}Têm como objetivo identificar as dificuldades e necessidades dos alunos
          da FAEN em permanecer no ensino superior e assim construir materiais
          que contribuam para a resolutividade desses problemas, como esse guia!
        </Text>

        <Text style={styles.subtitle}>Autoria:</Text>
        
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>📌 Desenvolvedor do Aplicativo: Matheus Cardoso de Miranda</Text>
          <Text style={styles.listItem}>📌 Idealização: Aparecida Inez Diniz de Morais</Text>
          <Text style={styles.listItem}>📌 Concepção: Anabel Zuleide Marcelino Pereira, Aparecida Inez Diniz de Morais, Hércules Bruno Gomes Silva, Amanda Kelly Jales Ezequiel, Ana Carolina de Lima Sales, Mailton Alves de Mendonça</Text>
          <Text style={styles.listItem}>📌 Orientação e Revisão: Ana Karinne de Moura Saraiva e Maria Carmélia Sales do Amaral</Text>
        </View>

        {/* Adicionando o logo no final */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/faenuern.png')} // Caminho para o logo dos Desbravadores
            style={styles.logo}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#00008B',
    textAlign: 'justify',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  list: {
    fontSize: 16,
    color: '#00008B',
    lineHeight: 22,
  },
  listContainer: {
    marginBottom: -10,
  },
  listItem: {
    fontSize: 16,
    color: '#00008B',
    marginBottom: 10,
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: -50,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default SobreScreen;

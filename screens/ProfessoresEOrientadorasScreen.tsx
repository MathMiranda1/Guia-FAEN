import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ImageBackground, Linking } from 'react-native';

const professors = [
  {
    nome: 'Prof. Dr. Alcivan Nunes Vieira',
    email: 'alcivannunes@uern.br',
    lattes: 'http://lattes.cnpq.br/0862127973452482',
    image: require('../assets/images/alcivan.png'),
  },
  {
    nome: 'Profª. Dra. Amélia Carolina Lopes Fernandes',
    email: 'ameliacarolina@uern.br',
    lattes: 'http://lattes.cnpq.br/4865321912024203',
    image: require('../assets/images/amelia.png'),
  },
  {
    nome: 'Profª. Dra. Ana Karinne de Moura Saraiva',
    email: 'anakarine@uern.br',
    lattes: 'http://lattes.cnpq.br/1352999270307520',
    image: require('../assets/images/ana.png'),
  },
  {
    nome: 'Profª. Ma. Andrezza Graziella Vieira Pontes',
    email: 'andrezzapontes@uern.br',
    lattes: 'http://lattes.cnpq.br/9509913070776821',
    image: require('../assets/images/andrezza.png'),
  },
  {
    nome: 'Profª. Dra. Cíntia Mikaelle Cunha de Santiago Nogueira',
    email: 'cintiamikaelle@uern.br',
    lattes: 'http://lattes.cnpq.br/7143255859685745',
    image: require('../assets/images/cintia.png'),
  },
  {
    nome: 'Profª. Dra. Dayane Pessoa de Araújo',
    email: 'dayanepessoa@uern.br',
    lattes: 'http://lattes.cnpq.br/8733230732935746',
    image: require('../assets/images/dayane.png'),
  },
  {
    nome: 'Prof. Dr. Deivson Wendell da Costa Lima',
    email: 'deivsonwendell@uern.br',
    lattes: 'http://lattes.cnpq.br/3902103384658611',
    image: require('../assets/images/deivson.png'),
  },
  {
    nome: 'Profª. Ma. Erica Louise de Souza Fernandes Bezerra',
    email: 'ericabezerra@uern.br',
    lattes: 'http://lattes.cnpq.br/0599797760497353',
    image: require('../assets/images/erica.png'),
  },
  {
    nome: 'Profª. Dra. Fátima Raquel Rosado Morais',
    email: 'fatimaraquel@uern.br',
    lattes: 'http://lattes.cnpq.br/8086396650395631',
    image: require('../assets/images/fatima.png'),
  },
  {
    nome: 'Profª. Dra. Francisca Patrícia Barreto de Carvalho',
    email: 'patriciabarreto@uern.br',
    lattes: 'http://lattes.cnpq.br/9989448096341620',
    image: require('../assets/images/francisca.png'),
  },
  {
    nome: 'Prof. Dr. Francisco Rafael Ribeiro Soares',
    email: 'rafaelsoares@uern.br',
    lattes: 'http://lattes.cnpq.br/4923844192698870',
    image: require('../assets/images/francisco.png'),
  },
  {
    nome: 'Profª. Dra. Isabel Cristina Amaral de Sousa Rosso Nelson',
    email: 'isabelrosso@uern.br',
    lattes: 'http://lattes.cnpq.br/8370816933569932',
    image: require('../assets/images/isabel.png'),
  },
  {
    nome: 'Prof. Me. Johny Carlos de Queiroz',
    email: 'johnycarlos@uern.br',
    lattes: 'http://lattes.cnpq.br/3050930217882969',
    image: require('../assets/images/johny.png'),
  },
  {
    nome: 'Profª. Dra. Kalídia Felipe de Lima Costa',
    email: 'kalidiafelipe@uern.br',
    lattes: 'http://lattes.cnpq.br/7892686578385569',
    image: require('../assets/images/kalidia.png'),
  },
  {
    nome: 'Profª. Ma. Katamara Medeiros Tavares',
    email: 'katamaratavares@uern.br',
    lattes: 'http://lattes.cnpq.br/4513160515186686',
    image: require('../assets/images/katamara.png'),
  },
  {
    nome: 'Profª. Dra. Kelianny Pinheiro Bezerra',
    email: 'keliannypinheiro@uern.br',
    lattes: 'http://lattes.cnpq.br/5255245680120966',
    image: require('../assets/images/kelianny.png'),
  },
  {
    nome: 'Profª. Dra. Líbne Lidianne da Rocha e Nóbrega',
    email: 'libnenobrega@uern.br',
    lattes: 'http://lattes.cnpq.br/7928033610815036',
    image: require('../assets/images/libne.png'),
  },
  {
    nome: 'Prof. Dr. Lucídio Clébeson de Oliveira',
    email: 'lucidioclebeson@uern.br',
    lattes: 'http://lattes.cnpq.br/3928939831395390',
    image: require('../assets/images/lucidio.png'),
  },
  {
    nome: 'Profª. Dra. Lucineire Lopes de Oliveira',
    email: 'lucineirelopes@uern.br',
    lattes: 'http://lattes.cnpq.br/8045052105819369',
    image: require('../assets/images/lucineire.png'),
  },
  {
    nome: 'Profª. Dra. Magda Fabiana do Amaral Pereira Lima',
    email: 'magdafabiana@uern.br',
    lattes: 'http://lattes.cnpq.br/8518972339620795',
    image: require('../assets/images/magda.png'),
  },
  {
    nome: 'Profª. Esp. Maria Carmélia Sales do Amaral',
    email: 'carmeliasales@uern.br',
    lattes: 'http://lattes.cnpq.br/9462853781169348',
    image: require('../assets/images/carmelia.png'),
  },
  {
    nome: 'Profª. Dra. Renata Janice Morais Lima F. Barros',
    email: 'renatamorais@uern.br',
    lattes: 'http://lattes.cnpq.br/3263032531488642',
    image: require('../assets/images/renata.png'),
  },
  {
    nome: 'Profª. Dra. Suzana Carneiro de Azevedo Fernandes',
    email: 'suzanaazevedo@uern.br',
    lattes: 'http://lattes.cnpq.br/6128746651032614',
    image: require('../assets/images/suzana.png'),
  },
  {
    nome: 'Prof. Me. Wanderley Fernandes da Silva',
    email: 'wanderleyfernandes@uern.br',
    lattes: 'http://lattes.cnpq.br/0412211385288711',
    image: require('../assets/images/wanderley.png'),
  },
];

export default function ProfessoresOrientadoras() {
  return (
    <ImageBackground
      source={require('../assets/images/background.png')} // Caminho para a imagem de fundo
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Professores e Orientadoras</Text>
        {professors.map((professor, index) => (
          <View key={index} style={styles.card}>
            <Image source={professor.image} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{professor.nome}</Text>
              <Text style={styles.email}>E-mail: {professor.email}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(professor.lattes)}>
                <Text style={styles.lattes}>Lattes: {professor.lattes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta a imagem para cobrir a tela inteira
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00008B',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  lattes: {
    fontSize: 14,
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
});

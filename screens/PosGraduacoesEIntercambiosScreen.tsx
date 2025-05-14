import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const PosGraduacoesEIntercambiosScreen: React.FC = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  function openEmail(arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Título Pós-Graduação */}
        <Text style={styles.sectionTitle}>Pós-Graduação</Text>

        {/* Card de Pós-Graduação */}
        <View style={styles.card}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <View style={styles.cardContent}>
            <Image source={require('../assets/images/residencia.png')} style={styles.cardImage} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.title}>CURSO DE PÓS-GRADUAÇÃO:</Text>
              <Text style={styles.subtitle}>RESIDÊNCIA MULTIPROFISSIONAL EM ATENÇÃO BÁSICA/SAÚDE DA FAMÍLIA E COMUNIDADE</Text>
              <Text style={styles.instructor}>Prof. Dr. Lucidio Clebeson de Oliveira</Text>
              <View style={styles.instagramRow}>
                <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openLink('https://www.instagram.com/residenciamultiuern')}>
                  <Text style={styles.link}>@residenciamultiuern</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Cards de Informações */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              É um curso de pós-graduação lato sensu, oferecido pela FAEN e UERN em parceria com a Prefeitura Municipal de Mossoró-PMM.
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              Possui duração de 24 (vinte e quatro) meses, desenvolvendo atividades teóricas, práticas e teórico-práticas.
            </Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.attendanceList}>
              É destinada às profissões da saúde, para graduados em Instituição de Ensino Superior, com situação regular nos Conselhos Profissionais de classe, sob a forma de curso de especialização; {'\n\n'}Caracteriza-se por ensino em serviço, com carga horária de 60 horas semanais, em regime de dedicação exclusiva ao programa, incluindo plantão, com o acompanhamento em serviço de docentes-preceptores.
            </Text>
          </View>
        </View>

        {/* Novo Card com Link */}
        <View style={styles.card}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.title}>EDITAL</Text>
              <TouchableOpacity onPress={() => openLink('https://www.funcitern.org/selecaocoremu')}>
                <Text style={styles.linkCardText}>
                  Gostou? Clique aqui e confira tudo sobre o processo seletivo para essa oportunidade de ouro!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Linha Separadora */}
        <View style={styles.separator} />

        {/* Título Intercâmbio */}
        <Text style={styles.sectionTitle}>Intercâmbio</Text>

        {/* Card de Intercâmbio */}
        <View style={styles.card}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <View style={styles.cardContent}>
            <Image source={require('../assets/images/diri.png')} style={styles.cardImage} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.title}>DIRETORIA DE RELAÇÕES INTERNACIONAIS E INTERINSTITUCIONAIS - DIRI</Text>
              <View style={styles.instagramRow}>
                <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openLink('https://www.instagram.com/diri.uern/')}>
                  <Text style={styles.link}>@residenciamultiuern</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.instagramRow}>
                <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openEmail('diri@uern.br')}>
                  <Text style={styles.link}>diri@uern.br</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Cards de Informações */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              Órgão vinculado à Reitoria, responsável pelo planejamento, execução e avaliação da política institucional de internacionalização da UERN.
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              A DIRI possuí acordos de cooperação 9 países, sendo eles: Portugal, Espanha, Argentina, Chile, Moçambique, Cabo verde, República Checa, Colômbia e China.
            </Text>
          </View>
        </View>

        <View style={styles.ribbonContainer}>
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>SETOR DE MOBILIDADE ACADÊMICA</Text>
          </View>
        </View>

        {/* Cards de Informações */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              Contribui com a formação e o aperfeiçoamento de docentes, discentes e técnicos administrativos, para novas experiências e a interação com outras culturas. {'\n\n'}Oferta mobilidade acadêmica virtual ABRUEM: disciplinas na modalidade de Educação a Distância – EaD.
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.infoText}>
              Além do Programa de Mobilidade Acadêmica Virtual – PILA. Esse programa permite que os alunos da UERN possam cursar disciplinas em universidades estrangeiras vinculadas ao programa e que alunos estrangeiros possam cursar disciplinas na UERN.
            </Text>
          </View>
        </View>

        {/* Novo Card com Link */}
        <View style={styles.card}>
          <View style={styles.infoHeader}>
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
            <View style={styles.infoCircle} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.title}>PROGRAMAS DE BOLSAS DE ESTUDO</Text>
              <TouchableOpacity onPress={() => openLink('https://www.instagram.com/diri.uern/')}>
                <Text style={styles.linkCardText}>
                  Para acompanhar as atualizações sobre as Bolsas de Estudo para Intercâmbio/mobilidade acadêmica, acompanhe a página oficial da DIRI no Instagram clicando AQUI.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
  separator: {
    borderBottomWidth: 6,
    borderBottomColor: '#00008B',
    marginVertical: 20,
  },
  ribbonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  ribbon: {
    backgroundColor: '#b3c7ff',
    position: 'relative',
    padding: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ribbonText: {
    color: '#003366',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderWidth: 2,
    borderColor: '#00008B',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00008B',
    marginRight: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 5,
    textAlign: 'center',
  },
  instructor: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  instagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  icon: {
    marginRight: 10,
  },
  link: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#00008B',
    flex: 1,
    marginHorizontal: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#00008B',
    flex: 1,
    marginHorizontal: 5,
  },
  serviceInfo: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceList: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
  linkCardText: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PosGraduacoesEIntercambiosScreen;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image } from 'react-native';

const HorasComplementaresScreen: React.FC = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Dados das atividades complementares
  const atividades = [
    {
      descricao: 'As atividades complementares são ações que participamos durante todo o curso. Sejam elas: participação em projetos de extensão, pesquisa, seminários, palestras, eventos, monitoria, congressos e muito mais!.',
    },
    {
      descricao: 'O aluno precisa cumprir 150h de atividades complementares durante todo o curso, divididas em pelo menos três (03) atividades diferentes, contemplando o ensino, a pesquisa e a extensão.',
    },
    {
      descricao: 'E, inseri-las no SIGAA para serem contabilizadas pelo orientador acadêmico e a chefia do DEN. Para entender o quanto vale cada atividade que você participa, segue abaixo o Quadro de pontuação de atividades complementares da FAEN.',
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
          <Text style={styles.title}>O que são e como colocar no SIGAA?</Text>
          <Text style={styles.description}>
            As atividades complementares são ações que participamos durante todo o curso. Sejam elas: participação em projetos de extensão, pesquisa, seminários, palestras, eventos, monitoria, congressos e muito mais!
          </Text>
          <TouchableOpacity onPress={() => openLink('https://www.youtube.com/watch?v=x868mbMPpBw')}>
            <Text style={styles.link}>Clique e assista um vídeo com tudo sobre esse tema!</Text>
          </TouchableOpacity>
        </View>

        {/* Renderizando as atividades complementares */}
        {atividades.map((atividade, index) => (
          <View key={index} style={styles.cardWidth}>
            <View style={styles.infoHeader}>
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
              <View style={styles.infoCircle} />
            </View>
            <Text style={styles.description}>{atividade.descricao}</Text>
          </View>
        ))}

        {/* Card com informação sem imagem */}
        <View style={styles.card}>
          <Text style={styles.title}>Quadro de Pontuação de Atividades Complementares</Text>
          <Text style={styles.description}>
            Abaixo você encontrará a tabela de pontuação para diversas atividades complementares, permitindo que você acompanhe e registre suas horas no SIGAA.
          </Text>
        </View>

        {/* Tabela de pontuação */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Quadro de pontuação de atividades de ensino complementares da FAEN</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Relação das Atividades</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH Máximo</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Comprovação</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação como ministrante em cursos acadêmicos com carga horária mínima de 10h.</Text>
              <Text style={styles.tableCell}>Carga horária do curso sob responsabilidade do discente.</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização do curso.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação como palestrante com plano de trabalho com carga horária máxima de 08h.</Text>
              <Text style={styles.tableCell}>Carga horária da palestra</Text>
              <Text style={styles.tableCell}>24 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização da palestra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação como ouvinte em cursos de extensão com carga horária mínima de 20h.</Text>
              <Text style={styles.tableCell}>Carga horária do curso</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Certificado de conclusão do curso.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação como ouvinte em minicurso/oficina com carga horária mínima de 2h.</Text>
              <Text style={styles.tableCell}>Carga horária do minicurso/oficina</Text>
              <Text style={styles.tableCell}>10 horas</Text>
              <Text style={styles.tableCell}>Certificado de conclusão do minicurso/oficina.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em Projetos de Ensino de Graduação institucionalizados, incluindo grupos PET (SESu/MEC), PIM, PIBID, etc.</Text>
              <Text style={styles.tableCell}>15 horas por semestre</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Declaração emitida pela Pró-Reitoria de Ensino de Graduação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Seminário interdisciplinar</Text>
              <Text style={styles.tableCell}>5 horas por evento</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Controle de frequência emitido pelo Departamento de Enfermagem.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Componentes curriculares de curso de graduação em Enfermagem ou área afim, não presentes no currículo do seu curso de graduação, oferecidos pela IES ou em outra instituição.</Text>
              <Text style={styles.tableCell}>15h por componente</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Comprovação de frequência e aprovação emitida por IES responsável pelo curso.</Text>
            </View>
          </View>
        </View>

        {/* Tabela de pontuação */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Quadro de pontuação de atividades de pesquisa complementares da FAEN</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Relação das Atividades</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH Máximo</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Comprovação</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em projetos de pesquisas institucionalizados na UERN, orientada por docentes, por período mínimo de um incluindo semestre, as de e modalidades PIBIC, PIBITI PIBIC-EM, sendo na condição de bolsista ou não- bolsista.</Text>
              <Text style={styles.tableCell}>15 horas por semestre</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Certificado emitido pela Pró-Reitoria de Pesquisa e Pós-Graduação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em grupos de pesquisas cadastrados no CNPq, orientada por docentes, por periodo mínimo de um semestre.</Text>
              <Text style={styles.tableCell}>05 horas por semestre</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Declaração do líder do grupo.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Apresentação de trabalhos em eventos científicos nacionais e internacionais, na condição de relator.</Text>
              <Text style={styles.tableCell}>4 horas por trabalho</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Certificação de apresentação do trabalho.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Apresentação de trabalhos em eventos científicos regionais locais, na condição de relator.</Text>
              <Text style={styles.tableCell}>3 horas por trabalho</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Certificação de apresentação do trabalho.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Resumos simples publicados em anais de eventos científicos internacionais e nacionais.</Text>
              <Text style={styles.tableCell}>4 horas pro trabalho.</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Resumos expandidos publicados em anais de eventos científicos internacionais e nacionais.</Text>
              <Text style={styles.tableCell}>5 horas por trabalho</Text>
              <Text style={styles.tableCell}>25 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Trabalhos completos publicados em anais de eventos científicos internacionais e nacionais.</Text>
              <Text style={styles.tableCell}>6 horas por trabalho</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Resumos simples publicados em anais de eventos científicos regionais e locais.</Text>
              <Text style={styles.tableCell}>3 horas por trabalho</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Resumos expandidos publicados em anais de eventos científicos regionais e locais.</Text>
              <Text style={styles.tableCell}>4 horas por trabalho</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Trabalhos completos publicados em anais de eventos científicos regionais e locais.</Text>
              <Text style={styles.tableCell}>5 horas por trabalho</Text>
              <Text style={styles.tableCell}>25 horas</Text>
              <Text style={styles.tableCell}>Cópia da página do documento em que conste o código de publicação (ISSN ou ISBN); a página do sumário (se houver) em que conste o trabalho e a primeira página em que se encontra publicado o trabalho ou resumo na integra.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Artigos científicos publicados em revistas com Qualis Al e A2 para enfermagem, ou fator de impacto maior que 2,5.</Text>
              <Text style={styles.tableCell}>20 horas por artigo</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Primeira e última páginas do artigo, deixando legíveis os nomes dos autores, nome da revista, DOI, volume, número, ano e paginação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Artigos científicos publicados em revistas com Qualis B1, B2 e B3 para enfermagem, ou fator de impacto entre 0,001 e 1,299.</Text>
              <Text style={styles.tableCell}>10 horas por artigo</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Primeira e última páginas do artigo, deixando legíveis os nomes dos autores, nome da revista, DOI, volume, número, ano e paginação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Artigos científicos publicados em revistas com Qualis CAPES B4 e B5.</Text>
              <Text style={styles.tableCell}>5 horas por artigo</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Primeira e última páginas do artigo, deixando legíveis os nomes dos autores, nome da revista, DOI, volume, número, ano e paginação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Capítulos de livros publicados com DOI ou ISBN.</Text>
              <Text style={styles.tableCell}>5 horas por capítulo</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Cópia da capa; da folha com ficha catalográfica em que conste o código de publicação (ISSN, ISBN etc.); a página do sumário em que conste o capítulo e a primeira e última páginas do capítulo.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Livros publicados com DOI ou ISBN.</Text>
              <Text style={styles.tableCell}>20 horas por livro</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Cópia da capa e da folha com ficha catalográfica em que conste o código de publicação (ISSN, ISBN etc.).</Text>
            </View>
          </View>
        </View>

        {/* Tabela de pontuação */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Quadro de pontuação de atividades de extensão complementares da FAEN</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Relação das Atividades</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>CH Máximo</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Comprovação</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em projetos de extensão institucionalizados, incluindo participação em núcleos de extensão, centros de prestação de serviços e unidades de extensão.</Text>
              <Text style={styles.tableCell}>15 horas por semestre</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Declaração emitida pela Pró-Reitoria de Extensão da UERN.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em ações de extensão institucionalizadas.</Text>
              <Text style={styles.tableCell}>Carga horária da ação, com teto de 10 horas por ação</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Declaração emitida pela Pró-Reitoria de Extensão da UERN ou por docente coordenador do evento/ação.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em eventos na condição de monitor ou membro de comissão organizadora.</Text>
              <Text style={styles.tableCell}>10 horas por evento.</Text>
              <Text style={styles.tableCell}>30 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização do evento.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em diretorias de entidades de movimento estudantil (CA e DCE).</Text>
              <Text style={styles.tableCell}>10 horas por semestre</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Declaração assinada pelo dirigente responsável pela entidade estudantil.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em congressos, fóruns, simpósios ou outros eventos científicos nacionais e internacionais da área de enfermagem ou áreas afins.</Text>
              <Text style={styles.tableCell}>4 horas por evento.</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização do evento.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em congressos, fóruns, simpósios ou outros eventos científicos regionais e locais da área de enfermagem ou áreas afins.</Text>
              <Text style={styles.tableCell}>3 horas por evento.</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização do evento.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação outros em eventos relacionados à sua área de formação</Text>
              <Text style={styles.tableCell}>3 horas por evento</Text>
              <Text style={styles.tableCell}>15 horas</Text>
              <Text style={styles.tableCell}>Certificado expedido pelo órgão responsável pela organização do evento.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Participação em Organizações Não-Governamentais</Text>
              <Text style={styles.tableCell}>10 horas por semestre</Text>
              <Text style={styles.tableCell}>20 horas</Text>
              <Text style={styles.tableCell}>Declaração assinada pelo dirigente responsável da ONG e relatório de atividades.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Estágios extracurriculares, voluntários ou remunerados, na área de enfermagem, em instituições públicas ou privadas, autorizadas pela coordenação de estágio do curso/unidade.</Text>
              <Text style={styles.tableCell}>30 horas por semestre</Text>
              <Text style={styles.tableCell}>60 horas</Text>
              <Text style={styles.tableCell}>Certificação emitida pela instituição concedente do estágio.</Text>
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
  cardWidth: {
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
    textAlign: 'justify',
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00008B',
  },
  cardImage: {
    width: 130,
    height: 200,
    borderRadius: 40,
    marginHorizontal: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 20,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#00008B',
    borderRadius: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    borderColor: '#00008B',
    borderWidth: 1,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: '#f2f2f2',
  },
  tableHeader: {
    backgroundColor: '#00008B',
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HorasComplementaresScreen;
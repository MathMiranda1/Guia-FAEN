import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../app/lib/supabase';

interface SearchResult {
  title: string;
  content: string[];
  screen: string;
}

const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(''); // Termo de busca
  const [results, setResults] = useState<SearchResult[]>([]); // Resultados da busca
  const [dynamicData, setDynamicData] = useState<SearchResult[]>([]); // Dados dinâmicos do Supabase
  const navigation = useNavigation();

  const staticData: SearchResult[] = [
    {
      title: 'Estrutura Curricular',
      content: [
        'Curso: [100930-0] Enfermagem - Bacharelado e Licenciatura',
        'Matriz Curricular: 2015.1 [Válida para ingressantes a partir de 2014.1]',
        'Campus/Cidade: Campus Central - Mossoró',
        'Faculdade: Faculdade de Enfermagem - FAEN',
        'Obrigatórias: 4455 horas',
        'Optativas: 120 horas',
        'Ativ. Complementares: 200 horas',
        'Total a integralizar: 4775 horas',
        'Eletivas: 240 horas',
        'Manual de Trabalhos Acadêmicos da UERN',
        'Quer conhecer o PPC de Enfermagem?',
        'Regimento dos Laboratórios de Ensino da FAEN',
        'Cartilha dos Direitos e Deveres dos Alunos da UERN',
        'Cartilha da Estrutura Curricular Simplificada',
        '1º Semestre: A Universidade e a Produção da Força de Trabalho em Enfermagem', '1º Semestre: Biologia', '1º Semestre: Concepções sobre o Ato de Estudar', '1º Semestre: Fundamentos da Psicologia', '1º Semestre: Fundamentos da Sociologia', '1º Semestre: Fundamentos de Filosofia', '1º Semestre: Língua Brasileira de Sinais', '2º Semestre: Antropologia e Saúde', '2º Semestre: História e Processo de Trabalho em Enfermagem', '2º Semestre: Morfologia', '2º Semestre: Processos Fisiológicos', '2º Semestre: Sociologia da Educação', '3º Semestre: Epidemiologia e Enfermagem', '3º Semestre: Filosofia da Educação', '3º Semestre: Gênero e Enfermagem', '3º Semestre: Processo de Investigação em Enfermagem', '3º Semestre: Processos Patológicos', '4º Semestre: Enfermagem em Saúde Coletiva', '4º Semestre: Processos Terapêuticos', '4º Semestre: Psicologia da Aprendizagem', '4º Semestre: Semiologia e Semiotécnica de Enfermagem no Processo Saúde/Doença do Adulto', '5º Semestre: Educação em Saúde', '5º Semestre: Enfermagem no Processo Saúde/Doença da Criança e do Adolescente', '5º Semestre: Exercício de Enfermagem', '5º Semestre: O Processo Gerenciar da Enfermagem', '5º Semestre: Organização da Educação Brasileira', '5º Semestre: Saúde Ambiental', '5º Semestre: Semiologia e Semiotécnica de Enfermagem no Processo Saúde/Doença da Criança', '6º Semestre: Didática', '6º Semestre: Enfermagem na Saúde/Doença do Processo Produtivo', '6º Semestre: Enfermagem no Processo de Reprodução Humana', '6º Semestre: Estágio em Prática de Ensino I', '6º Semestre: Pesquisa e Enfermagem', '6º Semestre: Temas Avançados em Saúde Coletiva', '7º Semestre: Enfermagem do Processo Saúde/Doença da 3ª Idade', '7º Semestre: Enfermagem no Processo Saúde/Doença do Adulto', '7º Semestre: Estágio em Prática de Ensino II', '7º Semestre: Gestão do Processo Ensinar/Aprender', '8º Semestre: Estágio em Prática de Ensino III', '8º Semestre: Estágio em Serviços de Saúde I', '8º Semestre: Estudos Orientados para Elaboração de Monografia', '9º Semestre: Estágio em Prática de Ensino IV', '9º Semestre: Estágio em Serviços de Saúde II', '9º Semestre: Monografia', 'Outros Componentes: Cultura Brasileira', 'Outros Componentes: Educação de Jovens e Adultos', 'Outros Componentes: Educação Popular em Saúde', 'Outros Componentes: Ética Social', 'Outros Componentes: Família, Parentesco e Ciclos de Vida', 'Outros Componentes: Formação e Cuidado da Pessoa com Deficiência e Transtornos do Desenvolvimento', 'Outros Componentes: Gênero e Sexualidade', 'Outros Componentes: História da Educação', 'Outros Componentes: Informática Aplicada à Enfermagem', 'Outros Componentes: Mecanismos de Agressão e Defesa', 'Outros Componentes: Metodologia da Investigação em Saúde Coletiva', 'Outros Componentes: Pesquisa Clínica e Epidemiológica', 'Outros Componentes: Prática Desportiva I', 'Outros Componentes: Prática Desportiva II', 'Outros Componentes: Práticas Integrativas e os Cuidados Humanescente em Saúde', 'Outros Componentes: Primeiros Socorros',
        'Curso: [100910-0] Enfermagem - Bacharelado',
        'Matriz Curricular: 2021.1 [Válida para ingressantes a partir de 2021.1]',
        'Campus/Cidade: Campus Central - Mossoró',
        'Faculdade: Faculdade de Enfermagem - FAEN',
        'Obrigatórias: 3510 horas',
        'Optativas: 540 horas',
        'Ativ. Complementares: 150 horas',
        'Total a integralizar: 4200 horas',
        'Eletivas: 240 horas',
        '1º Semestre: Atenção e Assistência em Urgência e Emergência - Suporte Básico de Vida', '1º Semestre: Biologia Celular e Molecular', '1º Semestre: Conhecimento científico: leituras e técnicas', '1º Semestre: Embriologia Geral e Histologia', '1º Semestre: Gênero, sociedade e diversidade', '1º Semestre: Necessidades de saúde e enfermagem', '1º Semestre: Sociedade, Estado, Universidade e Enfermagem', '2º Semestre: Antropologia e Saúde', '2º Semestre: Comportamento humano e relações', '2º Semestre: Cultura, Sociedade e Reflexões', '2º Semestre: Fisiologia humana', '2º Semestre: História e processo de trabalho em enfermagem', '2º Semestre: Morfologia', '3º Semestre: Enfermagem em saúde coletiva', '3º Semestre: Estudos científicos: teorias e métodos da pesquisa', '3º Semestre: Ética, bioética e cidadania', '3º Semestre: Fisiopatologia I', '3º Semestre: Mecanismos de Agressão e Defesa', '3º Semestre: Saúde ambiental', '4º Semestre: Epidemiologia e enfermagem', '4º Semestre: Fisiopatologia II', '4º Semestre: Semiologia e Semiotécnica I', '4º Semestre: Sistematização da assistência e o processo de enfermagem', '4º Semestre: Terapias e processos farmacológicos aplicados a enfermagem', '5º Semestre: Educação em saúde', '5º Semestre: Estudos científicos: Natureza e interfaces da pesquisa', '5º Semestre: O processo gerenciar de enfermagem', '5º Semestre: Saúde mental', '5º Semestre: Semiologia e Semiotécnica de Enfermagem II', '6º Semestre: Desenvolvimento Profissional em Enfermagem', '6º Semestre: Enfermagem em Saúde do Trabalhador', '6º Semestre: Enfermagem nas Ações Integradas a Saúde do idoso', '6º Semestre: Enfermagem nas ações integradas a saúde na infância e adolescência', '6º Semestre: Enfermagem nas ações integradas na saúde do adulto', '7º Semestre: Criação de conteúdo, empreendedorismo e tecnologias', '7º Semestre: Enfermagem cirúrgica', '7º Semestre: Enfermagem nas ações integradas materno infantil', '7º Semestre: Trabalho de conclusão de curso I', '8º Semestre: Atenção e Assistência em Urgência e Emergência - Suporte avançado de Vida', '8º Semestre: Enfermagem nas ações integradas ao paciente crítico', '8º Semestre: Trabalho de conclusão de Curso II', '9º Semestre: Estágio em serviços de saúde I', '10º Semestre: Estágio em serviços de saúde II', 'Outros Componentes: Bioestatística', 'Outros Componentes: Bioestatística com o uso de software estatístico', 'Outros Componentes: Educação Popular em Saúde', 'Outros Componentes: Língua Brasileira de Sinais', 'Outros Componentes: Metodologia da Investigação em Saúde Coletiva', 'Outros Componentes: Pesquisa Clínica e Epidemiológica', 'Outros Componentes: Práticas Integrativas e os Cuidados Humanescentes em Saúde', 'Outros Componentes: Princípios da Bioestatística', 'Outros Componentes: UCE I', 'Outros Componentes: UCE II', 'Outros Componentes: UCE III', 'Outros Componentes: UCE IV', 'Outros Componentes: UCE IX', 'Outros Componentes: UCE V', 'Outros Componentes: UCE VI', 'Outros Componentes: UCE VII', 'Outros Componentes: UCE VIII', 'Outros Componentes: UCE X', 'Outros Componentes: UCE XI', 'Outros Componentes: UCE XII', 'Outros Componentes: UCE XIII', 'Outros Componentes: UCE XIV', 'Outros Componentes: UCE XV',
      ],
      screen: 'EstruturaCurricular',
    },
    {
      title: 'Projetos',
      content: [
        'QUER CONHECER OS PROJETOS DE EXTENSÃO DA FAEN?',
        'QUER CONHECER OS PROJETOS DE PESQUISA DA FAEN?',
        'QUER CONHECER OS PROJETOS DE ENSINO DA FAEN?',
        'Ensino, pesquisa e extensão',
      ],
      screen: 'Projetos',
    },
    {
      title: 'Atendimentos e Auxílios',
      content: [
        'Grupo de Ajuda para o Cadastramento Socioeconômico da PRAE',
        'Programa de Apoio ao Estudante (PAE)',
        'Programa de Moradia Universitária',
        'Auxílio Alimentação',
        'Auxílio Inclusão Digital',
        'Programa Auxílio-Creche',
        'Auxílio à participação de estudantes em Atividades Acadêmicas, Científicas e Culturais',
        'Equipe Multiprofissional',
        'Programa de Apoio ao Estágio Não-Obrigatório',
      ],
      screen: 'AtendimentosAuxilios',
    },
    {
      title: 'Horas Complementares',
      content: [
        'O que são e como colocar no SIGAA?',
        'Quadro de Pontuação de atividades complementares',
        'Quadro de pontuação de atividades de ensino complementares da FAEN',
        'Quadro de pontuação de atividades de pesquisa complementares da FAEN',
        'Quadro de pontuação de atividades de extensão complementares da FAEN',
      ],
      screen: 'HorasComplementares',
    },
    {
      title: 'Pós-Graduação e Intercâmbio',
      content: [
        'Residência Multiprofissional em atenção básica/saúde da família e comunidade',
        'Prof. Dr. Lucidio Clebeson de Oliveira',
        'Edital',
        'Diretoria de relações internacionais e interinstitucionais',
        'DIRI',
        'Setor de Mobilidade Acadêmica',
        'Programas de Bolsas de Estudo',
      ],
      screen: 'PosGraduacoesIntercambios',
    },
  ];


  const tableToScreenMap: Record<string, string> = {
    ambulatorio_content: 'Ambulatorio', // Nome correto da rota
    contatos_content: 'ContatosInstitucionais',
    docente_content: 'CorpoDocente',
    faen_content: 'EstruturaFaen',
    orientadoras_content: 'Orientadoras',
    representacao_content: 'RepresentacaoEstudantil',
    uern_content: 'UERN',
  };
  
  const fetchDataFromTables = async () => {
    try {
      const fetchedData: SearchResult[] = [];
      for (const table of Object.keys(tableToScreenMap)) { // Corrigido aqui
        const { data, error } = await supabase.from(table).select('content');
        if (error) {
          console.error(`Erro ao buscar ${table}:`, error.message);
          continue;
        }
  
        const formattedData = (data || []).map((item: any) => {
          const parsedContent = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
  
          // Extrair apenas os valores, ignorando as chaves
          const extractValues = (obj: any): string[] => {
            if (Array.isArray(obj)) {
              return obj.map(extractValues).flat();
            } else if (typeof obj === 'object' && obj !== null) {
              return Object.values(obj).map(extractValues).flat();
            } else if (typeof obj === 'string') {
              return [obj];
            }
            return [];
          };
  
          const contentValues = extractValues(parsedContent).filter((value) => {
            return !value.startsWith('http'); // Ignorar URLs de imagens
          });
  
          return {
            title: table.replace('_content', '').toUpperCase(),
            content: contentValues,
            screen: tableToScreenMap[table], // Atualização para usar o nome correto da rota
          };
        });
  
        fetchedData.push(...formattedData);
      }
  
      setDynamicData(fetchedData);
    } catch (error) {
      console.error('Erro ao buscar dados das tabelas:', error);
    }
  };
  

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };

  useEffect(() => {
    fetchDataFromTables();
  }, []);

  const allData: SearchResult[] = [...staticData, ...dynamicData];

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text === '') {
      setResults([]);
    } else {
      const normalizedSearchTerm = normalizeString(text);
      const filteredResults = allData
        .map((item) => {
          const matchingContent = item.content.filter((value) =>
            normalizeString(value).includes(normalizedSearchTerm)
          );
          if (matchingContent.length > 0) {
            return {
              ...item,
              content: matchingContent,
            };
          }
          return null;
        })
        .filter((item) => item !== null) as SearchResult[];
      setResults(filteredResults);
    }
  };

  const highlightTerm = (text: string, term: string) => {
    const normalizedText = normalizeString(text);
    const normalizedTerm = normalizeString(term);

    const parts = normalizedText.split(new RegExp(`(${normalizedTerm})`, 'gi'));
    let currentIndex = 0;

    return parts.map((part, index) => {
      const originalPart = text.slice(
        currentIndex,
        currentIndex + part.length
      );
      currentIndex += part.length;

      return (
        <Text
          key={index}
          style={normalizeString(part) === normalizedTerm ? styles.highlight : undefined}
        >
          {originalPart}
        </Text>
      );
    });
  };

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite o termo de busca..."
        value={searchTerm}
        onChangeText={handleSearch}
      />
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              {/* Navegação ao clicar no título */}
              <TouchableOpacity onPress={() => navigateToScreen(item.screen)}>
                <Text style={styles.resultTitle}>{item.title}</Text>
              </TouchableOpacity>

              {/* Navegação ao clicar nos conteúdos */}
              <FlatList
                data={item.content}
                keyExtractor={(content, idx) => `${item.title}-${idx}`}
                renderItem={({ item: content }) => (
                  <TouchableOpacity onPress={() => navigateToScreen(item.screen)}>
                    <Text style={styles.resultContent}>
                      {highlightTerm(content, searchTerm)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        />

      ) : (
        searchTerm !== '' && (
          <Text style={styles.noResults}>Nenhum resultado encontrado.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultContent: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10
  },
  highlight: {
    backgroundColor: '#FFFF00', // Cor do destaque
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
});

export default SearchScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Alert, Image, ActivityIndicator, Dimensions, BackHandler } from 'react-native'; // Adicionei BackHandler se não estava
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../app/(tabs)'; // Ajuste o caminho se necessário
import CarouselCards from '../components/CarouselCards'; // Ajuste o caminho se necessário
import { useAdmin } from '@/app/lib/AdminContext';    // Ajuste o caminho se necessário
import { supabase } from '@/app/lib/supabase';       // Ajuste o caminho se necessário
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useFocusEffect } from '@react-navigation/native';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tipo para os dados dos Cards (com route_key)
type CardData = {
  id: number;
  title: string;           // Título original do DB
  formattedTitle: string;  // Título formatado para exibição
  image: string;
  route_key: keyof RootStackParamList; // Chave estável para navegação
  description: string;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]); // Usa o tipo CardData

  // --- ESTADOS DE EDIÇÃO COMBINADOS ---
  // Guarda o ID do card que está ABERTO para edição
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  // Guarda o valor do TÍTULO durante a edição
  const [editedTitle, setEditedTitle] = useState<string>('');
  // Guarda o valor da DESCRIÇÃO durante a edição
  const [editedDescription, setEditedDescription] = useState<string>('');
  // --- FIM DOS ESTADOS DE EDIÇÃO ---

  // Array com as chaves de rota na ordem desejada (mantido)
  const desiredOrderRouteKeys: (keyof RootStackParamList)[] = [
    'UERN', 'EstruturaFaen', 'ContatosInstitucionais', 'EstruturaCurricular',
    'CorpoDocente', 'Orientadoras', 'Biblioteca', 'RepresentacaoEstudantil',
    'Projetos', 'AtendimentosAuxilios', 'HorasComplementares', 'Ambulatorio',
    'PosGraduacoesIntercambios',
  ];

  // Função para formatar títulos (mantida como está)
  const formatTitle = (title: string): string => {
    if (title === 'Estrutura Curricular e Documentos') return 'Estrutura\nCurricular e\nDocumentos';
    if (title === 'Representação Estudantil') return 'Representação\nEstudantil';
    if (title === 'Atendimentos e Auxílios') return 'Atendimentos\ne Auxílios';
    if (title === 'Pós Graduações e Intercâmbios') return 'Pós Graduações\ne Intercâmbios';
    if (title === 'Orientadoras Acadêmicas') return 'Orientadoras\nAcadêmicas';
    if (title === 'Contatos Institucionais') return 'Contatos\nInstitucionais';
    if (title === 'Corpo Docente') return 'Corpo\nDocente';
    if (title === 'Atividades Complementares') return 'Atividades\nComplementares';
    const words = title.split(' ');
    if (words.length === 2) return `${words[0]}\n${words[1]}`;
    if (words.length > 1) {
      const midpoint = Math.ceil(words.length / 2);
      const firstHalf = words.slice(0, midpoint).join(' ');
      const secondHalf = words.slice(midpoint).join(' ');
      return `${firstHalf}\n${secondHalf}`;
    }
    return title;
  };

  // Função fetchCards (mantida como na última correção, usando route_key)
  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cards').select('id, title, image, route_key, description');
      if (error) throw error;
      if (data) {
        const validRouteKeysSet = new Set(desiredOrderRouteKeys);
        const allCardsData = data.map((card): CardData | null => {
          const routeKeyFromDB = card.route_key as string | null | undefined;
          const routeKeyFallback = 'Home' as keyof RootStackParamList;
          let validRouteKey: keyof RootStackParamList = routeKeyFallback;
          if (routeKeyFromDB && typeof routeKeyFromDB === 'string' && validRouteKeysSet.has(routeKeyFromDB as keyof RootStackParamList)) {
            validRouteKey = routeKeyFromDB as keyof RootStackParamList;
          } else if (routeKeyFromDB) {
            console.warn(`Route key inválida ou não mapeada: '${routeKeyFromDB}'...`);
          }
          return {
            id: card.id, title: card.title || '', formattedTitle: formatTitle(card.title || ''),
            image: card.image || '', route_key: validRouteKey, description: card.description || '',
          };
        }).filter((card): card is CardData => card !== null);

        const reorderedData = desiredOrderRouteKeys
          .map(routeKey => allCardsData.find(card => card.route_key === routeKey))
          .filter((card): card is CardData => card !== undefined);

        if (reorderedData.length !== allCardsData.length) {
          console.warn("Alguns cards do banco não foram encontrados...");
        }
        setCards(reorderedData);
      } else { setCards([]); }
    } catch (error: any) {
      console.error('Erro no fetchCards:', error);
      Alert.alert('Erro', `Não foi possível carregar os cards: ${error.message || 'Erro desconhecido'}`);
      setCards([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleEditImage = async (cardId: number) => {
    try {
      // Verificar autenticação do usuário
      console.log('Verificando autenticação...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Erro na sessão ou usuário não autenticado:', sessionError);
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }

      const user = sessionData.session.user;
      console.log('Usuário autenticado:', user);

      console.log('Abrindo ImagePicker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      console.log('Resultado do ImagePicker:', result);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        Alert.alert('Aviso', 'Nenhuma imagem foi selecionada.');
        return;
      }

      const img = result.assets[0];
      console.log('Arquivo selecionado:', img);

      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
      const filePath = `${user.id}/${Date.now()}.${img.uri.split('.').pop() || 'jpeg'}`;
      const contentType = img.mimeType || 'image/jpeg';

      console.log('Iniciando upload para Supabase...');
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        Alert.alert('Erro', 'Erro ao fazer upload da imagem.');
        return;
      }

      console.log('Upload concluído. Obtendo URL pública...');
      // Obter a URL pública da imagem
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);

      if (!data?.publicUrl) {
        console.error('Erro ao obter a URL pública do arquivo.');
        Alert.alert('Erro', 'Não foi possível obter a URL pública do arquivo.');
        return;
      }

      console.log('URL pública obtida:', data.publicUrl);

      console.log('Atualizando a tabela cards...');
      const { error: updateError } = await supabase
        .from('cards')
        .update({ image: data.publicUrl })
        .eq('id', cardId);

      if (updateError) {
        console.error('Erro ao atualizar imagem no banco:', updateError);
        throw updateError;
      }

      setCards((prevCards) =>
        prevCards.map((card) => (card.id === cardId ? { ...card, image: data.publicUrl } : card))
      );

      Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar a imagem:', error);
      if (error instanceof Error) {
        Alert.alert('Erro', `Ocorreu um problema ao atualizar a imagem: ${error.message}`);
      } else {
        Alert.alert('Erro', 'Ocorreu um problema desconhecido ao atualizar a imagem.');
      }
    }
  };

  // --- Função ÚNICA para ENTRAR no modo de edição ---
  const handleEditCard = (cardId: number) => {
    const currentCard = cards.find(card => card.id === cardId);
    if (!currentCard) return; // Segurança

    setEditingCardId(cardId);                   // Define qual card está sendo editado
    setEditedTitle(currentCard.title);         // Define o título ATUAL para o input
    setEditedDescription(currentCard.description); // Define a descrição ATUAL para o input
  };

  // --- Função ÚNICA para SALVAR as alterações ---
  const handleSaveCard = async () => {
    // Verifica se estamos realmente editando e temos o ID
    if (editingCardId === null) {
      console.warn("handleSaveCard chamado sem editingCardId.");
      return;
    }

    // Prepara os dados a serem salvos (título sem quebras de linha)
    const titleToSave = editedTitle.replace(/\n/g, ' ').trim(); // Limpa título
    const updateData = {
      title: titleToSave || cards.find(c => c.id === editingCardId)?.title || 'Título Indefinido', // Usa original se editado estiver vazio
      description: editedDescription || '', // Garante string
    };

    setLoading(true); // Mostra loading
    try {
      const { error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', editingCardId); // Usa o ID guardado

      if (error) throw error; // Joga para o catch

      Alert.alert('Sucesso', 'Card atualizado com sucesso!');

      // Atualiza o estado local 'cards'
      setCards(prevCards => prevCards.map(card =>
        card.id === editingCardId
          ? {
            ...card,
            title: updateData.title,                     // Novo título salvo
            formattedTitle: formatTitle(updateData.title), // Novo título formatado
            description: updateData.description,          // Nova descrição
          }
          : card
      ));

      handleCancelEdit(); // Sai do modo de edição e limpa estados

    } catch (error: any) {
      console.error("Erro ao salvar card:", error);
      if (error.message?.includes('violates row-level security policy')) {
        Alert.alert('Erro de Permissão', 'Você não tem permissão para alterar estes dados.');
      } else {
        Alert.alert("Erro", `Não foi possível salvar as alterações: ${error.message}`);
      }
    } finally {
      setLoading(false); // Esconde loading
    }
  };

  // --- Função para CANCELAR a edição ---
  const handleCancelEdit = () => {
    setEditingCardId(null); // Limpa o ID em edição
    setEditedDescription('');
    setEditedTitle('');
    setLoading(false);      // Garante que loading para
  };

  // --- Navegação (mantida como estava, usando route_key) ---
  const handleCardPress = (routeKey: keyof RootStackParamList | undefined) => {
    if (routeKey) {
      navigation.navigate(routeKey);
    } else { console.warn("Tentativa de navegar para rota indefinida."); }
  };

  // useFocusEffect (mantido como estava)
  useFocusEffect(
    React.useCallback(() => { /* ... sua lógica BackHandler ... */ }, [])
  );

  // --- RETURN ATUALIZADO ---
  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background} resizeMode="cover">
      <View style={styles.darkOverlay} />
      <View style={styles.overlay}>
        {loading && <ActivityIndicator size="large" color="#00008B" />}
        <Image source={require('../assets/images/logouern.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Bem-vindo ao Guia do Estudante</Text>
        {isAdmin && <Text style={{ marginBottom: 5, fontStyle: 'italic', color: '#555' }}>Você está logado como Administrador!</Text>}
        <CarouselCards
          data={cards} // Os dados com 'route_key'
          onCardPress={handleCardPress}   // Navegação
          onEditImage={handleEditImage}  // Edição de imagem
          onEditCard={handleEditCard}    // <<< NOVA FUNÇÃO para entrar na edição
          onSaveCard={handleSaveCard}    // <<< NOVA FUNÇÃO para salvar
          onCancelEdit={handleCancelEdit} // Função de cancelar
          editingCardId={editingCardId}  // <<< NOVO ESTADO de controle
          // Passa os valores e setters para os inputs
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
        />
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  logo: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.13,
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
    color: '#00008B',
    marginTop: SCREEN_HEIGHT * -0.02,
  },
});

export default HomeScreen;
/*
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Alert, Image, ActivityIndicator, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../app/(tabs)';
import CarouselCards from '../components/CarouselCards';
import { useAdmin } from '@/app/lib/AdminContext';
import { supabase } from '@/app/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);

  const mapping: { [key: string]: keyof RootStackParamList } = {
    UERN: 'UERN',
    FAEN: 'EstruturaFaen',
    'Estrutura Curricular e Documentos': 'EstruturaCurricular',
    'Contatos Institucionais': 'ContatosInstitucionais',
    'Atividades Complementares': 'HorasComplementares',
    Projetos: 'Projetos',
    'Representação Estudantil': 'RepresentacaoEstudantil',
    'Atendimentos e Auxílios': 'AtendimentosAuxilios',
    'Pós Graduações e Intercâmbios': 'PosGraduacoesIntercambios',
    'Corpo Docente': 'CorpoDocente',
    'Orientadoras Acadêmicas': 'Orientadoras',
    Ambulatório: 'Ambulatorio',
  };

  const [cards, setCards] = useState<
    { id: number; title: string; formattedTitle: string; image: string; navigateTo: keyof RootStackParamList; description: string }[]
  >([]);
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editedDescription, setEditedDescription] = useState<string>('');

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('cards').select('*');

      if (error) {
        console.error('Erro ao buscar cards:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados dos cards.');
        return;
      }

      if (data) {
        const formattedData = data.map((card) => ({
          id: card.id as number,
          title: card.title as string,
          formattedTitle:
            card.title === 'Representação Estudantil'
              ? 'Representação\nEstudantil'
              : card.title === 'Orientadoras Acadêmicas'
              ? 'Orientadoras\nAcadêmicas'
              : card.title === 'Atividades Complementares'
              ? 'Atividades\nComplementares'
              : card.title === 'Pós Graduações e Intercâmbios'
              ? 'Pós Graduações\ne Intercâmbios'
              : card.title === 'Atendimentos e Auxílios'
              ? 'Atendimentos\ne Auxílios'
              : card.title,

          image: card.image as string,
          navigateTo: mapping[card.title] || 'Home',
          description: card.description as string,
        }));

        const desiredOrder = [
          'UERN',
          'FAEN',
          'Contatos Institucionais',
          'Estrutura Curricular e Documentos',
          'Corpo Docente',
          'Orientadoras Acadêmicas',
          'Representação Estudantil',
          'Projetos',
          'Atendimentos e Auxílios',
          'Atividades Complementares',
          'Ambulatório',
          'Pós Graduações e Intercâmbios',
        ];

        const reorderedData = desiredOrder
          .map((title) => formattedData.find((card) => card.title === title))
          .filter((card): card is NonNullable<typeof card> => card !== undefined);

        setCards(reorderedData);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar cards:', err);
      Alert.alert('Erro', 'Ocorreu um problema ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleEditImage = async (cardId: number) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        Alert.alert('Aviso', 'Nenhuma imagem foi selecionada.');
        return;
      }

      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
      const filePath = ${sessionData.session.user.id}/${Date.now()}.${img.uri.split('.').pop() || 'jpeg'};
      const contentType = img.mimeType || 'image/jpeg';

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, decode(base64), { contentType });

      if (uploadError) {
        Alert.alert('Erro', 'Erro ao fazer upload da imagem.');
        return;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      if (!data?.publicUrl) {
        Alert.alert('Erro', 'Não foi possível obter a URL pública do arquivo.');
        return;
      }

      const { error: updateError } = await supabase.from('cards').update({ image: data.publicUrl }).eq('id', cardId);
      if (updateError) throw updateError;

      setCards((prevCards) =>
        prevCards.map((card) => (card.id === cardId ? { ...card, image: data.publicUrl } : card))
      );

      Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar a imagem:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao atualizar a imagem.');
    }
  };

  const handleCardPress = (navigateTo: keyof RootStackParamList) => {
    navigation.navigate(navigateTo);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditedDescription('');
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background} resizeMode="cover">
      <View style={styles.darkOverlay} />
      <View style={styles.overlay}>
        {loading && <ActivityIndicator size="large" color="#00008B" />}
        <Image source={require('../assets/images/logouern.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Bem-vindo ao Guia do Estudante</Text>
        {isAdmin && <Text>Você está logado como Administrador!</Text>}
        <CarouselCards
          data={cards}
          onCardPress={handleCardPress}
          onEditImage={handleEditImage}
          onEditDescription={(id, desc) => {
            setEditingCard(id);
            setEditedDescription(desc);
          }}
          onSaveDescription={(id) => {
            // lógica de salvar descrição
          }}
          onCancelEdit={handleCancelEdit}
          editingCard={editingCard}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  logo: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.13,
    marginBottom: SCREEN_HEIGHT * (-0.02),
  },
  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
    color: '#00008B',
  },
});

export default HomeScreen;

*/
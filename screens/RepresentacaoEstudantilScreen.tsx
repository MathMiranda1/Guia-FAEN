import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert, } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

interface Representante {
  titulo: string;
  email: string;
  instagram: string;
  link: string;
  image: string;
}

interface RepresentacaoContent {
  id: number;
  content: {
    representantes: Representante[];
  };
}

// Adicione ou ajuste este tipo para representar a linha INTEIRA da tabela
type RepresentacaoEntry = {
  id: number; // Ou string, ou o tipo da sua coluna ID
  titulo: string; // O título principal da linha ('CA 8 de Julho', 'Atletica Cabulosa')
  content: {
    representantes?: { // A chave DENTRO do JSON (mantendo 'representantes')
      titulo: string; // O nome INTERNO (CA 8 de Julho, Atlética...)
      email: string;
      instagram: string;
      link: string | null; // Permitir nulo
      image: string;
    }[]; // Indica que é um array desses objetos
  };
  // Adicione created_at, updated_at se você selecionar e usar
};

// Tipo para os dados DO ITEM quando estiverem no estado de edição
type EditingItemData = {
  titulo: string;
  email: string;
  instagram: string;
  link: string | null;
  image: string;
};

const informacoes = [
  'É a entidade máxima de representação dos estudantes da FAEN/UERN.',
  'É uma associação civil livre e independente, sem fins lucrativos, sem filiação político-partidária ou religiosa.',
];

const novosCards = [
  { descricao: 'São membros do CA8J todos os estudantes matriculados regularmente na FAEN.' },
  { descricao: 'Possui mandato de um ano de duração, havendo possibilidade única de recondução.' },
  { descricao: 'Diretorias: Coordenação Geral e Secretaria Geral; Direção de Esporte, Cultura e Eventos; Direção de Assuntos Políticos e Curriculares; Direção de Assuntos Estudantis; Direção de Finanças; Direção de Comunicação; Direção de Artes Diversidade e Inclusão Social; Direção de Extensão e Pesquisa.', isFullWidth: true },
  { descricao: 'Representar os estudantes judicial ou extrajudicialmente, defendendo seus interesses.' },
  { descricao: 'Organizar, auxiliar e incentivar promoções de caráter público, cultural, científico e social na FAEN.' },
  { descricao: 'Promover a aproximação entre os corpos discente, docente e técnico-administrativo, preservando sua autonomia.' },
  { descricao: 'Lutar pela democratização do acesso e pela implementação de políticas que facilitem a permanência dos estudantes na instituição.' },
  { descricao: 'Acatar e construir as deliberações da Assembleia Geral dos Estudantes da FAEN.' },
  { descricao: 'Defender a democracia, liberdade, paz e a justiça social, lutando contra todas as formas de opressão dentro e fora da Universidade.' },
  { descricao: 'Eleições: As inscrições são sob a forma de chapas completas, com pelo menos 1 (um) integrantes em cada direção e por mediação de uma Comissão Eleitoral; Pode votar e ser votado todo e qualquer estudante regularmente matriculado.', isFullWidth: true },
];

type AtleticaCard = {
  descricao: string;
  isFullWidth?: boolean;
};

const CardsAtletica: AtleticaCard[] = [
  { descricao: 'É uma associação formada por alunos do curso de enfermagem da UERN.' },
  { descricao: 'Tem como objetivo promover o esporte dentro da FAEN.' },
  { descricao: 'Atua em conjunto com o CA na organização dos eventos.' },
  { descricao: 'Organizada em: presidência, secretaria, tesouraria, marketing, esportes e eventos.' },
];

const RepresentacaoEstudantilScreen: React.FC = () => {
  const [representacaoData, setRepresentacaoData] = useState<RepresentacaoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Representante | null>(null);
  // Guarda TODAS as representações buscadas
  const [representacoes, setRepresentacoes] = useState<RepresentacaoEntry[]>([]);
  // Guarda o ID da LINHA sendo editada
  const [editingId, setEditingId] = useState<number | null>(null);
  // Guarda os dados DO ITEM dentro dessa linha que está sendo editado
  const [editingItemData, setEditingItemData] = useState<EditingItemData | null>(null);

  const { isAdmin } = useAdmin();

  const openLink = (url: string) => Linking.openURL(url);
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const openInstagram = (instagram: string) => Linking.openURL(`https://www.instagram.com/${instagram}`);

  const fetchRepresentacoes = async () => { // Renomeado
    setLoading(true);
    // Tira o filtro .eq('id', 1) e .single()
    const { data, error } = await supabase
      .from('representacao_content')
      .select('*')
      .order('created_at', { ascending: true }); // Ordem opcional

    if (error || !data) {
      console.error('Erro ao buscar representações:', error?.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
      setRepresentacoes([]); // Define array vazio
    } else {
      // Garante a estrutura content.representantes (importante!)
      const processedData = data.map(entry => ({
        ...entry,
        content: {
          representantes: Array.isArray(entry.content?.representantes) ? entry.content.representantes : []
        }
      }));
      setRepresentacoes(processedData as RepresentacaoEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRepresentacoes(); // Chama a função correta
  }, []);

  const handleSave = async () => {
    if (!editingId || !editingItemData) return; // Usa os estados corretos

    const newContent = { representantes: [editingItemData] }; // Prepara o novo JSON

    setLoading(true);
    const { error } = await supabase
      .from('representacao_content')
      .update({ content: newContent })
      .eq('id', editingId); // Usa o ID da linha guardado
    setLoading(false);

    if (error) {
      /* ... tratamento de erro ... */
    } else {
      Alert.alert('Sucesso', 'Alterações salvas!');
      // Atualiza a representação específica no estado 'representacoes'
      setRepresentacoes(prev => prev.map(rep =>
        rep.id === editingId ? { ...rep, content: newContent } : rep
      ));
      handleDiscardChanges(); // Sai da edição
    }
  };

  // --- Função handleImageChange COMPLETA e ATUALIZADA ---
  const handleImageChange = async () => {
    // 1. Verifica se estamos no modo de edição de um item
    if (!editingItemData || editingId === null) {
      Alert.alert("Atenção", "Nenhum representante selecionado para editar a imagem.");
      return;
    }

    try {
      // 2. Abre a biblioteca de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Opcional: Forçar corte quadrado
        quality: 0.8,    // Opcional: Reduzir qualidade para upload mais rápido
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        // Usuário cancelou, não faz nada (sem alerta)
        return;
      }

      // 3. Prepara para upload
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
      const fileExtension = img.uri.split('.').pop()?.toLowerCase() || 'jpg'; // Pega extensão
      const contentType = img.mimeType || `image/${fileExtension}`; // Usa mimeType ou deduz
      // Cria nome de arquivo único usando ID da representação e timestamp
      const filePath = `representantes/${editingId}-${Date.now()}.${fileExtension}`;

      // 4. Faz o upload para o Supabase Storage
      setLoading(true); // Indica loading
      const { error: uploadError } = await supabase.storage
        .from('images') // <<< VERIFIQUE SE 'images' é o nome correto do seu bucket
        .upload(filePath, decode(base64), { contentType: contentType }); // Passa contentType

      if (uploadError) {
        setLoading(false);
        console.error("Erro no upload para Supabase Storage:", uploadError);
        Alert.alert('Erro', 'Erro ao fazer upload da imagem.');
        return;
      }

      // 5. Obtém a URL pública da imagem recém-upada
      const { data: urlData } = supabase.storage
        .from('images') // <<< VERIFIQUE SE 'images' é o nome correto do seu bucket
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        setLoading(false);
        Alert.alert('Erro', 'Não foi possível obter a URL pública da imagem após o upload.');
        // Você pode querer deletar o arquivo do storage aqui se a URL falhar
        return;
      }
      setLoading(false); // Fim do loading

      // 6. Atualiza APENAS o estado de 'editingItemData' com a nova URL
      setEditingItemData(prevData => {
        if (!prevData) return null; // Segurança
        return { ...prevData, image: publicUrl }; // Retorna novo objeto com imagem atualizada
      });

      // Não salva no banco aqui, o usuário precisa clicar em "Salvar" depois
      // Alert.alert("Imagem Alterada", "Clique em Salvar para confirmar a mudança."); // Feedback opcional

    } catch (error: any) {
      setLoading(false); // Garante que loading para em erro
      console.error('Erro durante handleImageChange:', error);
      // Verifica se é erro de permissão do ImagePicker
      if (error.code === 'E_MISSING_PERMISSION') {
        Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar sua galeria.');
      } else {
        Alert.alert('Erro', 'Ocorreu um problema ao tentar alterar a imagem.');
      }
    }
  };

  const handleEdit = (representacao: RepresentacaoEntry) => {
    // Pega o primeiro item representante (se existir)
    const itemParaEditar = representacao.content?.representantes?.[0];
    if (itemParaEditar) {
      // Cria cópia profunda segura
      setEditingItemData(JSON.parse(JSON.stringify(itemParaEditar)));
      setEditingId(representacao.id); // Define o ID da linha em edição
    } else {
      // Opcional: permitir criar um se não houver?
      console.warn("Tentativa de editar representação sem item.", representacao.titulo);
      // Exemplo de como criar um vazio (se fizer sentido)
      // setEditingItemData({ titulo: representacao.titulo || '', email: '', instagram: '', link: null, image: '' });
      // setEditingId(representacao.id);
    }
  };

  const handleDiscardChanges = () => {
    setEditingId(null);
    setEditingItemData(null);
  };

  // Componentes para renderizar o card CA
  const renderCAContent = () => {
    const representacaoCA = representacoes.find(r => r.titulo === 'Representação Estudantil');
    const representanteCA = representacaoCA?.content?.representantes?.[0];

    if (!representacaoCA || !representanteCA) {
      return <Text style={styles.loadingText}>Dados CA não encontrados.</Text>;
    }

    return (
      <View key={representacaoCA.id}>
        {editingId === representacaoCA.id ? (
          <View style={styles.editableCard}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Editando: {representacaoCA.titulo}</Text>
            <TextInput
              style={styles.textInput}
              value={editingItemData?.titulo || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, titulo: text })}
              placeholder="Título"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.email || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, email: text })}
              placeholder="E-mail"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.instagram || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, instagram: text })}
              placeholder="Instagram"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.link || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, link: text })}
              placeholder="Link"
            />
            {editingItemData?.image && (
              <Image source={{ uri: editingItemData.image }} style={styles.cardImagePreview} />
            )}
            <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
              <Text style={styles.buttonText}>Alterar Imagem</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleDiscardChanges}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.representanteCard}>
            <Image source={{ uri: representanteCA.image }} style={styles.cardImage} />
            <View style={styles.representanteInfo}>
              <Text style={styles.representanteTitle}>{representanteCA.titulo}</Text>
              <View style={styles.contactRow}>
                <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openEmail(representanteCA.email)}>
                  <Text style={styles.link}>{representanteCA.email}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.contactRow}>
                <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openInstagram(representanteCA.instagram)}>
                  <Text style={styles.link}>@{representanteCA.instagram}</Text>
                </TouchableOpacity>
              </View>
              {representanteCA.link && (
                <TouchableOpacity onPress={() => representanteCA.link && openLink(representanteCA.link)}>
                  <Text style={styles.externalLink}>Estatuto na íntegra (clique aqui)</Text>
                </TouchableOpacity>
              )}
            </View>
            {isAdmin && (
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEdit(representacaoCA)}>
                <FontAwesome name="pencil" size={24} color="#00008B" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Componentes para renderizar o card Atlética
  const renderAtleticaContent = () => {
    const representacaoAtletica = representacoes.find(r => r.titulo === 'Atlética Cabulosa');
    const representanteAtletica = representacaoAtletica?.content?.representantes?.[0];

    if (!representacaoAtletica || !representanteAtletica) {
      return <Text style={styles.loadingText}>Dados Atlética não encontrados.</Text>;
    }

    return (
      <View key={representacaoAtletica.id}>
        {editingId === representacaoAtletica.id ? (
          <View style={styles.editableCard}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Editando: {representacaoAtletica.titulo}</Text>
            <TextInput
              style={styles.textInput}
              value={editingItemData?.titulo || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, titulo: text })}
              placeholder="Título"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.email || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, email: text })}
              placeholder="E-mail"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.instagram || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, instagram: text })}
              placeholder="Link Completo Instagram"
              keyboardType="url"
            />
            <TextInput
              style={styles.textInput}
              value={editingItemData?.link || ''}
              onChangeText={(text) => setEditingItemData((prev) => prev && { ...prev, link: text })}
              placeholder="Outro Link"
            />
            {editingItemData?.image && (
              <Image source={{ uri: editingItemData.image }} style={styles.cardImagePreview} />
            )}
            <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
              <Text style={styles.buttonText}>Alterar Imagem</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleDiscardChanges}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.representanteCard}>
            <Image source={{ uri: representanteAtletica.image }} style={styles.cardImage} />
            <View style={styles.representanteInfo}>
              <Text style={styles.representanteTitle}>{representanteAtletica.titulo}</Text>
              <View style={styles.contactRow}>
                <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openEmail(representanteAtletica.email)}>
                  <Text style={styles.link}>{representanteAtletica.email}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.contactRow}>
                <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                <TouchableOpacity onPress={() => openLink(representanteAtletica.instagram)}>
                  <Text style={styles.link}>Instagram</Text>
                </TouchableOpacity>
              </View>
              {representanteAtletica.link && (
                <TouchableOpacity onPress={() => representanteAtletica.link && openLink(representanteAtletica.link)}>
                  <Text style={styles.externalLink}>Link Adicional</Text>
                </TouchableOpacity>
              )}
            </View>
            {isAdmin && (
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEdit(representacaoAtletica)}>
                <FontAwesome name="pencil" size={24} color="#00008B" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
      <View style={styles.darkOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Entidades Estudantis</Text>

        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          <>
            {/* Card CA 8 de Julho */}
            {renderCAContent()}

            {/* Conteúdo estático */}
            <View style={styles.informacaoContainer}>
              {informacoes.map((info, idx) => (
                <View key={`info-${idx}`} style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                  </View>
                  <Text style={styles.infoText}>{info}</Text>
                </View>
              ))}
            </View>

            <View style={styles.informacaoContainer}>
              {novosCards.map((card, idx) => (
                <View key={`newcard-${idx}`} style={[styles.infoCard, card.isFullWidth && styles.fullWidthCard]}>
                  <View style={styles.infoHeader}>
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                  </View>
                  <Text style={styles.infoText}>{card.descricao}</Text>
                </View>
              ))}
            </View>

            {/* Linha Separadora */}
            <View style={styles.separator} />

            {/* Card Atlética Cabulosa */}
            {renderAtleticaContent()}

            {/* ======> NOVA SEÇÃO: CARDS ESTÁTICOS DA ATLÉTICA <====== */}
            {/* Container Opcional (pode usar informacaoContainer se quiser o layout lado-a-lado) */}
            <View style={styles.informacaoContainer} >
              {/* Mapeia o novo array CardsAtletica */}
              {CardsAtletica.map((card, idx) => (
                // Usa o mesmo estilo dos outros cards estáticos
                <View key={`atletica-card-${idx}`} style={[styles.infoCard, card.isFullWidth && styles.fullWidthCard]}>
                  <View style={styles.infoHeader}>
                    <View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} />
                  </View>
                  <Text style={styles.infoText}>{card.descricao}</Text>
                  {/* Adicionar link aqui se precisar, como nos outros cards estáticos */}
                  {/* {card.link && <TouchableOpacity onPress={()=>openLink(card.link)}><Text>Link</Text></TouchableOpacity>} */}
                </View>
              ))}
            </View>
            {/* ======> FIM SEÇÃO ESTÁTICA DA ATLÉTICA <====== */}
          </>
        )}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00008B',
  },
  representanteCard: {
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
    borderWidth: 2,
    borderColor: '#00008B',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  representanteInfo: {
    flex: 1,
  },
  representanteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 5,
  },
  contactRow: {
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
  },
  externalLink: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    marginTop: 10,
  },
  editableCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    borderColor: '#00008B',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    color: '#333',
  },
  changeImageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  informacaoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#00008B',
  },
  fullWidthCard: {
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  editIcon: {
    marginLeft: 10,
  },
  separator: {
    borderBottomWidth: 6,
    borderBottomColor: '#00008B',
    marginVertical: 20,
  },
  cardImagePreview: {
    width: 100,          // Largura desejada para o preview
    height: 100,         // Altura desejada
    borderRadius: 50,    // Metade da largura/altura para ser CÍRCULO (ajuste se quiser quadrado com borderRadius: 8)
    alignSelf: 'center', // Centraliza a imagem dentro do editableCard
    marginBottom: 10,   // Espaço abaixo do preview antes do botão "Alterar Imagem"
    borderWidth: 1,     // Borda sutil opcional
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',           // Alinha os botões lado a lado
    justifyContent: 'space-around', // Espaça os botões uniformemente (ou use 'space-between')
    marginTop: 25,              // Mais espaço acima dos botões
  },
});

export default RepresentacaoEstudantilScreen;
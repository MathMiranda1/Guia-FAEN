import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground, TextInput, Alert, Linking } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

// No início do arquivo UERNScreen.tsx
type Item = {
  name: string; // Usaremos este campo para o nome
  role: string | null; // Mantém, pode ser null/vazio para Pró-Reitorias
  email: string | null; // Mantém, pode ser null/vazio para Pró-Reitorias
  image: string;      // Mantém, será string vazia para Pró-Reitorias
  // --- CAMPOS ADICIONAIS PARA PRÓ-REITORIAS ---
  descricao?: string | null; // Campo opcional
  link?: string | null;     // Campo opcional
};

// O tipo SectionContent pode continuar como estava:
type SectionContent = {
  text?: string;
  items?: Item[]; // Agora só precisa deste
};

type Section = {
  section: string;
  content: SectionContent;
};

// Remova os tipos ProReitoriaItem e os Type Guards isItem/isProReitoriaItem se ainda existirem


const UERNScreen: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedItem, setEditedItem] = useState<Item | null>(null);
  const [expandedProReitoriaIndex, setExpandedProReitoriaIndex] = useState<number | null>(null);

  const { isAdmin } = useAdmin();

  // --- Função fetchContent ATUALIZADA ---
  const fetchContent = async () => {
    setLoading(true); // Usar o estado de loading único
    try {
      const { data, error } = await supabase
        .from('uern_content')
        .select('section, content')
        .order('created_at', { ascending: true }); // Mantida ordem de inserção

      if (error) {
        console.error('Erro ao buscar conteúdo:', error.message);
        Alert.alert('Erro', 'Não foi possível carregar o conteúdo.');
        return;
      }

      if (data) {
        const processedData = data.map((section: Section) => { // Usar o tipo Section aqui

          // ----> MODIFICAÇÃO CHAVE <----
          // Processar a URL da imagem APENAS se a seção for 'Reitoria'
          // E se ela tiver itens definidos
          if (section.section === 'Reitoria' && section.content.items) {
            section.content.items = section.content.items.map((item: Item) => { // Aqui os itens SÃO do tipo Item

              // Verifica se a propriedade 'image' existe e é uma string válida
              if (typeof item.image !== 'string' || item.image.trim() === '') {
                console.warn("Item na seção Reitoria sem 'image' válida ou ausente:", item);
                // Retorna o item como está se a imagem for inválida/ausente
                return { ...item, image: '' }; // Define uma string vazia ou outra imagem padrão se preferir
              }

              // Processa a URL da imagem somente se for uma string válida
              const imageUrl = item.image.startsWith('http')
                ? item.image // Já é uma URL pública
                : supabase.storage.from('images').getPublicUrl(item.image).data.publicUrl || ''; // Tenta obter URL pública

              return { ...item, image: imageUrl }; // Retorna o item com a URL processada
            });
          }
          return section; // Retorna a seção (modificada ou não)
        });

        // Reorganize as seções (como você já fazia)
        const reorderedSections = processedData.sort((a, b) => {
          if (a.section === 'História') return -1;
          if (b.section === 'História') return 1;
          if (a.section === 'Reitoria' && b.section !== 'História') return -1; // Ordem Reitoria
          if (b.section === 'Reitoria' && a.section !== 'História') return 1;
          if (a.section === 'Pró-Reitorias' && b.section !== 'História' && b.section !== 'Reitoria') return -1; // Ordem Pró-Reitorias
          if (b.section === 'Pró-Reitorias' && a.section !== 'História' && a.section !== 'Reitoria') return 1;
          return 0; // Mantém ordem original para outras
        });

        setSections(reorderedSections);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar conteúdo:', err);
      Alert.alert('Erro', 'Ocorreu um problema ao carregar o conteúdo.');
    } finally {
      setLoading(false); // Usa o estado de loading único
    }
  };
  // --- Fim da Função fetchContent ATUALIZADA ---

  const handleEditImage = async (sectionIndex: number, itemIndex: number) => {
    try {
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
      const filePath = `${Date.now()}-${img.uri.split('/').pop()}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, decode(base64), { contentType: img.type });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        Alert.alert('Erro', 'Erro ao fazer upload da imagem.');
        return;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl || '';

      if (!publicUrl) {
        Alert.alert('Erro', 'Não foi possível obter a URL da imagem.');
        return;
      }

      const updatedSections = [...sections];
      if (updatedSections[sectionIndex].content.items) {
        updatedSections[sectionIndex].content.items[itemIndex].image = publicUrl;
      }
      setSections(updatedSections);

      const updatedContent = {
        ...updatedSections[sectionIndex].content,
        items: updatedSections[sectionIndex].content.items?.map((item) => ({
          ...item,
          image: item.image,
        })),
      };

      const { error } = await supabase
        .from('uern_content')
        .update({ content: updatedContent })
        .eq('section', updatedSections[sectionIndex].section);

      if (error) {
        console.error('Erro ao atualizar conteúdo no banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível salvar as alterações no banco de dados.');
        return;
      }

      Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao editar a imagem.');
    }
  };

  const handleEditText = (sectionIndex: number) => {
    setEditingSection(sectionIndex);
    setEditedContent(sections[sectionIndex].content.text || '');
  };

  const toggleProReitoriaExpand = (index: number) => {
    setExpandedProReitoriaIndex(currentIndex =>
      currentIndex === index ? null : index
    );
  };

  // Função para abrir links externos
  const openLink = async (url: string | null) => {
    if (!url) return;
    // Adicione o import: import { Linking } from 'react-native'; no topo do arquivo
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Não foi possível abrir este URL: ${url}`);
      }
    } catch (error) {
      console.error("Erro ao abrir link:", error);
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    }
  };

  const handleEditItem = (sectionIndex: number, itemIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.content.items?.[itemIndex] as Item | undefined; // Afirma como Item (com campos opcionais)

    if (!item) {
      console.error("Tentativa de editar item inválido.");
      return;
    }

    setEditingSection(sectionIndex);
    setEditingItemIndex(itemIndex);
    setEditedContent(''); // Limpa edição de texto

    // Define o item completo no estado de edição (cópia profunda!)
    setEditedItem(JSON.parse(JSON.stringify(item)));
  };


  const handleSave = async () => {
    if (editingSection === null) return;

    const currentSection = sections[editingSection];
    // Cria cópia profunda do content inteiro
    const contentToUpdate = JSON.parse(JSON.stringify(currentSection.content));
    let dataChanged = false; // Flag para saber se algo mudou

    // --- Atualizando um ITEM da lista ('Reitoria' ou 'Pró-Reitorias') ---
    if (editingItemIndex !== null && editedItem) {
      // Verifica se o array e o índice são válidos
      if (Array.isArray(contentToUpdate.items) && contentToUpdate.items[editingItemIndex]) {
        // Atualiza o item na cópia usando os dados de 'editedItem'
        contentToUpdate.items[editingItemIndex] = editedItem;
        dataChanged = true; // Marcamos que houve alteração
      } else {
        console.error("Erro ao tentar salvar item: índice ou array inválido.");
        handleCancel(); // Cancela se estrutura estiver errada
        return;
      }
    }
    // --- Atualizando TEXTO ('História') ---
    else if (editingItemIndex === null && currentSection.section === 'História') {
      // Atualiza o texto se for diferente do original (opcional)
      if (currentSection.content.text !== editedContent) {
        contentToUpdate.text = editedContent;
        dataChanged = true;
      }
    }

    // Se nada mudou (ou tipo de seção não tratado), apenas cancela
    if (!dataChanged) {
      console.log("Nenhuma alteração detectada para salvar.");
      handleCancel();
      return;
    }

    // --- Envia a atualização para o Supabase ---
    setLoading(true);
    const { error } = await supabase
      .from('uern_content')
      .update({ content: contentToUpdate }) // Envia o objeto 'content' completo atualizado
      .eq('section', currentSection.section);
    setLoading(false);

    if (error) {
      console.error('Erro ao salvar no banco:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      // Não atualiza estado local em caso de erro
    } else {
      // Atualiza estado local SOMENTE no sucesso
      const updatedSectionsState = [...sections];
      updatedSectionsState[editingSection].content = contentToUpdate;
      setSections(updatedSectionsState);

      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      handleCancel(); // Limpa estados de edição
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditingItemIndex(null);
    setEditedItem(null);
    setEditedContent('');
  };

  const openEmail = (email: string | null) => { // Permite receber null
    if (!email) {
      console.warn("Tentativa de abrir email nulo ou indefinido.");
      Alert.alert("Erro", "Endereço de e-mail não disponível.");
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // --- Bloco return ATUALIZADO (com wrappers e null returns) ---
  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background}>
      <View style={styles.darkOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>UERN</Text>

        {loading ? (<Text style={styles.loadingText}>Carregando...</Text>) : (
          sections.map((sectionData, sectionIndex) => {
            // Decide se ESTA seção está sendo editada
            const isEditingThisSectionText = editingSection === sectionIndex && editingItemIndex === null && sectionData.section === 'História';
            const isEditingThisSectionItem = editingSection === sectionIndex && editingItemIndex !== null;

            // Container geral para a seção (título + conteúdo)
            return (
              <View key={`section-wrapper-${sectionIndex}`}>
                {/* Título da Seção */}
                <Text style={styles.subtitle}>{sectionData.section}</Text>

                {/* --- Seção de TEXTO (História) --- */}
                {sectionData.section === 'História' && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoHeader}><View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} /></View>
                    {isEditingThisSectionText ? (
                      <View>
                        <TextInput style={styles.editInput} value={editedContent} onChangeText={setEditedContent} multiline textAlignVertical="top" />
                        <View style={styles.buttonContainer}><TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity><TouchableOpacity style={styles.cancelButton} onPress={handleCancel}><Text style={styles.buttonText}>Descartar</Text></TouchableOpacity></View>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.infoText}>{sectionData.content?.text || ' '}</Text>{/* Adicionado espaço como fallback */}
                        {isAdmin && (<TouchableOpacity style={[styles.editIcon, styles.editIconRight]} onPress={() => handleEditText(sectionIndex)}><FontAwesome name="pencil" size={24} color="#00008B" /></TouchableOpacity>)}
                      </>
                    )}
                  </View>
                )}

                {/* --- Seção de ITENS (Reitoria ou Pró-Reitorias) --- */}
                {Array.isArray(sectionData.content?.items) && (sectionData.section === 'Reitoria' || sectionData.section === 'Pró-Reitorias') && (
                  // Mapeia os itens DENTRO desta seção
                  sectionData.content.items.map((item: Item, itemIndex) => {
                    // Decide se ESTE ITEM específico está sendo editado
                    const isEditingThisSpecificItem = isEditingThisSectionItem && editingItemIndex === itemIndex;

                    return (
                      <View key={`${sectionData.section}-item-${itemIndex}`} style={sectionData.section === 'Pró-Reitorias' ? styles.proReitoriaCard : styles.infoCard}>

                        {/* Renderiza formulário ou visualização baseado na seção e estado */}
                        {isEditingThisSpecificItem ? (
                          // === Formulário de Edição do ITEM ===
                          <View style={styles.editContainer}>
                            <Text style={styles.editLabel}>Editar {sectionData.section === 'Reitoria' ? 'Membro' : 'Pró-Reitoria'}</Text>
                            {sectionData.section === 'Reitoria' ? (
                              <>
                                <TextInput style={styles.editInput} value={editedItem?.name || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, name: text } : null)} placeholder="Nome" />
                                <TextInput style={styles.editInput} value={editedItem?.role || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, role: text } : null)} placeholder="Cargo" />
                                <TextInput style={styles.editInput} value={editedItem?.email || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, email: text } : null)} placeholder="Email" />
                              </>
                            ) : ( // Formulário Pró-Reitoria
                              <>
                                <TextInput style={styles.editInput} value={editedItem?.name || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, name: text } : null)} placeholder="Nome" />
                                <TextInput style={[styles.editInput, styles.textArea]} value={editedItem?.descricao || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, descricao: text } : null)} placeholder="Descrição" multiline />
                                <TextInput style={styles.editInput} value={editedItem?.link || ''} onChangeText={(text) => setEditedItem(prev => prev ? { ...prev, link: text ?? null } : null)} placeholder="Link (Opcional)" />
                              </>
                            )}
                            <View style={styles.buttonContainer}><TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity><TouchableOpacity style={styles.cancelButton} onPress={handleCancel}><Text style={styles.buttonText}>Descartar</Text></TouchableOpacity></View>
                          </View>
                        ) : (
                          // === Visualização do ITEM ===
                          <>
                            {sectionData.section === 'Reitoria' ? (
                              <View style={styles.tech}>
                                <Image source={{ uri: item.image }} style={styles.techImage} />
                                <View style={styles.techInfo}>
                                  <Text style={styles.techName}>{item.name}</Text>
                                  <Text style={styles.techRole}>{item.role ?? ''}</Text>
                                  <TouchableOpacity onPress={() => item.email && openEmail(item.email)}><Text style={styles.techEmail}>{item.email ?? ''}</Text></TouchableOpacity>
                                </View>
                                {isAdmin && (
                                  <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity style={styles.editIcon} onPress={() => handleEditImage(sectionIndex, itemIndex)}><Ionicons name="camera-outline" size={24} color="#00008B" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.editIcon} onPress={() => handleEditItem(sectionIndex, itemIndex)}><FontAwesome name="pencil" size={24} color="#00008B" /></TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            ) : ( // Visualização Pró-Reitoria
                              <>
                                <TouchableOpacity style={styles.proReitoriaHeader} onPress={() => toggleProReitoriaExpand(itemIndex)} activeOpacity={0.7}>
                                  <Text style={styles.proReitoriaCardTitle}>{item.name}</Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {isAdmin && (<TouchableOpacity style={{ marginRight: 15 }} onPress={() => handleEditItem(sectionIndex, itemIndex)}><FontAwesome name="pencil" size={22} color="#00008B" /></TouchableOpacity>)}
                                    <Ionicons name={expandedProReitoriaIndex === itemIndex ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#00008B" />
                                  </View>
                                </TouchableOpacity>
                                {expandedProReitoriaIndex === itemIndex && (
                                  <View style={styles.proReitoriaContent}>
                                    <Text style={styles.proReitoriaDescription}>{item.descricao ?? 'Sem descrição.'}</Text>
                                    {item.link && (<TouchableOpacity style={styles.linkContainer} onPress={() => openLink(item.link ?? null)}><Ionicons name="open-outline" size={20} color="#1E90FF" style={styles.icon} /><Text style={styles.linkText}>Acessar Site</Text></TouchableOpacity>)}
                                  </View>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </View> // Fim do card do item
                    ); // Fim do return dentro do map de items
                  }) // Fim do map de items
                )}
                {/* --- Fim Seção de ITENS --- */}

              </View> // Fim do container da seção
            ); // Fim do return do map de sections
          }) // Fim do map de sections
        )}
      </ScrollView>
    </ImageBackground>
  );
  // --- Fim do return ---
};


const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fafafa80' },
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#00008B' },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: '#00008B' },
  infoCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00008B',
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 },
  infoCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00008B', marginRight: 5 },
  infoText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
    fontWeight: 'bold',
  },
  tech: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  techImage: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
  techInfo: { flex: 1, marginHorizontal: 10 },
  techName: { fontSize: 16, fontWeight: 'bold' },
  techRole: { fontSize: 14, fontWeight: 'bold' },
  techEmail: { fontSize: 14, color: '#1E90FF', fontWeight: 'bold' },
  editIcon: { marginLeft: 10 },
  loadingText: { fontSize: 16, color: '#333', textAlign: 'center' },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f8ff', // Adicionado fundo branco
    color: '#000', // Garante que o texto é visível
    minHeight: 60, // Define uma altura mínima
    textAlignVertical: 'top', // Alinha o texto ao topo
  },
  editIconRight: {
    position: 'absolute',
    right: 10,
    top: 10, // Ajuste conforme necessário para posicionar o ícone mais abaixo
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#fff',
    fontWeight: 'bold',
  },
  // --- Estilos NOVOS para Pró-Reitorias (Adicionar dentro de StyleSheet.create) ---
  proReitoriaCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 5, // Menos padding vertical inicial
    borderWidth: 2,
    borderColor: '#00008B',
    overflow: 'hidden', // Para o conteúdo não vazar antes de expandir
  },
  proReitoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Adiciona padding vertical aqui para tornar clicável
  },
  proReitoriaCardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00008B', // Um azul mais escuro para o título
    flex: 1, // Ocupa espaço disponível para que o ícone fique na direita
    marginRight: 10,
  },
  proReitoriaContent: {
    paddingTop: 10, // Espaço entre header e conteúdo
    paddingBottom: 15, // Espaço no final do conteúdo
  },
  proReitoriaDescription: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center', // Justificado se preferir
    marginBottom: 15,
    lineHeight: 22, // Melhora a legibilidade
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0efff', // Fundo leve para o link
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start', // Para não ocupar a largura toda
    marginTop: 5, // Espaço acima do link
  },
  icon: { // Estilo genérico para ícones nos links (reutilizado)
    marginRight: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#1E90FF', // Azul para link
    fontWeight: 'bold',
  },
  editContainer: { // Um container para o formulário de edição
    paddingVertical: 15, // Espaçamento interno
  },
  editLabel: { // Um rótulo opcional para o formulário
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,       // Altura mínima para permitir múltiplas linhas
    textAlignVertical: 'top', // Começa a digitar do topo
  },
  // Você já deve ter: editInput, buttonContainer, saveButton, cancelButton, buttonText
});

export default UERNScreen;
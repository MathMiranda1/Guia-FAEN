import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground, Alert, Linking, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/app/lib/supabase';
import { MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

type GrupoImportanteItem = {
  nome: string;
  link: string;
  // id?: string | number; // Opcional
};

const EstruturaFaenScreen: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAdmin();

  const handleDiscardChanges = () => {
    setEditing(null);
    setEditingContent(null);
  };

  // --- Função fetchContent CORRIGIDA ---
  const fetchContent = async () => {
    setLoading(true);
    try {
      // Busca TODOS os dados da tabela
      const { data, error } = await supabase
        .from('faen_content')
        .select('*') // Seleciona tudo para pegar todas as seções
        .order('created_at', { ascending: true }); // Ordem opcional

      if (error) {
        console.error('Erro ao buscar conteúdo:', error.message);
        Alert.alert('Erro', 'Não foi possível carregar o conteúdo.');
        return;
      }

      if (data) {
        // Encontra a seção das imagens da estrutura separadamente
        const estruturaSection = data.find((s: any) => s.section === 'Estrutura da Faen');
        setImages(estruturaSection?.content?.map((item: { url: string }) => item.url) || []);

        // Define as seções que queremos exibir e sua ordem
        const sectionNamesInOrder = ['História', 'Informação Importante', 'Equipe', 'Grupos_Importantes'];

        // Mapeia os dados encontrados, garantindo estrutura padrão e aplicando processamento
        const processedSections = sectionNamesInOrder.map(name => {
          const foundSection = data.find((s: any) => s.section === name);
          let content = foundSection?.content; // Pega o conteúdo encontrado

          // --- Garante a estrutura correta para cada tipo de seção ---
          if (name === 'Equipe' || name === 'Grupos_Importantes') {
            // Se for 'Equipe' ou 'Grupos', espera { items: [] }
            if (!content || !Array.isArray(content.items)) {
              console.warn(`Seção '${name}' sem 'content.items' válidos, definindo padrão.`);
              content = { items: [] }; // Garante que 'content' é um objeto com 'items' (mesmo vazio)
            }
            // Processa imagens SOMENTE para a seção 'Equipe'
            if (name === 'Equipe' && Array.isArray(content.items)) {
              content.items = content.items.map((item: any) => {
                if (typeof item.image !== 'string' || item.image.trim() === '') {
                  return { ...item, image: '' };
                }
                const imageUrl = item.image.startsWith('http') ? item.image : supabase.storage.from('images').getPublicUrl(item.image).data.publicUrl || '';
                return { ...item, image: imageUrl };
              });
            }
          } else if (name === 'História' || name === 'Informação Importante') {
            // Se for seção de texto, espera { text: '...', link?: '...' }
            if (!content || typeof content.text !== 'string') {
              console.warn(`Seção '${name}' sem 'content.text' válido, definindo padrão.`);
              content = { text: '', link: content?.link }; // Garante objeto com 'text'
            }
          } else {
            // Se for uma seção desconhecida, usa o content como está ou um padrão
            content = content || {};
          }

          return { section: name, content: content }; // Retorna a seção formatada
        });

        setSections(processedSections); // Define as seções processadas no estado
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar conteúdo:', err);
      Alert.alert('Erro', 'Ocorreu um problema ao carregar o conteúdo.');
    } finally {
      setLoading(false);
    }
  };


  const handleUploadImage = async (index: number) => {
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

      const updatedImages = [...images];
      updatedImages[index] = publicUrl;
      setImages(updatedImages);

      const { error } = await supabase
        .from('faen_content')
        .update({ content: updatedImages.map((url) => ({ url })) })
        .eq('section', 'Estrutura da Faen');

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

  const handleDeleteImage = async (index: number) => {
    try {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);

      const { error } = await supabase
        .from('faen_content')
        .update({ content: updatedImages.map((url) => ({ url })) })
        .eq('section', 'Estrutura da Faen');

      if (error) {
        console.error('Erro ao deletar imagem no banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível deletar a imagem no banco de dados.');
        return;
      }

      Alert.alert('Sucesso', 'Imagem deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao deletar a imagem.');
    }
  };

  const handleAddImage = async () => {
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

      const updatedImages = [...images, publicUrl];
      setImages(updatedImages);

      const { error } = await supabase
        .from('faen_content')
        .update({ content: updatedImages.map((url) => ({ url })) })
        .eq('section', 'Estrutura da Faen');

      if (error) {
        console.error('Erro ao adicionar imagem no banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível adicionar a imagem no banco de dados.');
        return;
      }

      Alert.alert('Sucesso', 'Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao adicionar a imagem.');
    }
  };

  const handleSaveContent = async (sectionName: string) => {
    // Se não houver conteúdo em edição, apenas cancela
    if (!editingContent) {
      console.warn("Tentativa de salvar sem conteúdo em edição.");
      handleDiscardChanges(); // Limpa os estados de edição
      return;
    }

    try {
      setLoading(true); // Inicia o loading
      const { error } = await supabase
        .from('faen_content')
        .update({ content: editingContent }) // Envia o JSON editado
        .eq('section', sectionName);
      setLoading(false); // Finaliza o loading

      if (error) {
        console.error('Erro ao salvar alterações:', error);
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        // Não atualiza o estado local em caso de erro
      } else {
        // SÓ ATUALIZA O ESTADO LOCAL APÓS SUCESSO NO BANCO
        const updatedSections = sections.map((section) =>
          section.section === sectionName ? { ...section, content: editingContent } : section
        );
        setSections(updatedSections);

        Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
        handleDiscardChanges(); // Sai do modo de edição
      }
    } catch (err) {
      setLoading(false);
      console.error('Erro inesperado ao salvar conteúdo:', err);
      Alert.alert('Erro', 'Ocorreu um problema ao salvar o conteúdo.');
    }
  };

  const openLink = async (url: string | null) => {
    if (!url) return;

    try {
      // Remova o canOpenURL e tente abrir diretamente
      await Linking.openURL(url);
    } catch (error) {
      console.error("Erro ao abrir link:", error);
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background}>
      <View style={styles.darkOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Estrutura da Faen</Text>
        <View style={styles.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((url, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: url }} style={styles.image} />
                {isAdmin && (
                  <>
                    <TouchableOpacity style={styles.cameraIcon} onPress={() => handleUploadImage(index)}>
                      <Icon name="camera-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteImage(index)}>
                      <Icon name="trash-outline" size={24} color="#f00" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
            {/* Nota: Este texto parece errado no seu código original, talvez fosse "Adicionar Imagem"? */}
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        )}
        <>{/* Fragment Principal */}
          {/* --- Mapeamento das Seções do Banco --- */}
          {sections.map((section, index) => (<View key={index}>{/* Container da Seção */}
            <Text style={styles.subtitle}>{section.section}</Text>
            <View style={styles.infoCard}>{/* Card da Seção */}
              <View style={styles.infoHeader}><View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} /></View>
              {/* ----- CONDIÇÃO: MODO EDIÇÃO ou VISUALIZAÇÃO ----- */}
              {editing === section.section ? (<>{/* Início Modo Edição */}
                {/* Form Edição Equipe */}
                {section.section === 'Equipe' && Array.isArray(editingContent?.items) && (<>
                  <Text style={styles.editLabel}>Editar {section.section}</Text>
                  {editingContent.items.map((member: any, idx: number) => (<View key={`edit-member-${idx}`} style={styles.editableMember}>
                    <TextInput style={styles.textInput} value={member.name} onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, items: prev.items.map((m: any, i: number) => i === idx ? { ...m, name: text } : m) }))} placeholder="Nome" />
                    <TextInput style={styles.textInput} value={member.role} onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, items: prev.items.map((m: any, i: number) => i === idx ? { ...m, role: text } : m) }))} placeholder="Cargo" />
                    <TextInput style={styles.textInput} value={member.email} onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, items: prev.items.map((m: any, i: number) => i === idx ? { ...m, email: text } : m) }))} placeholder="Email" />
                    <TouchableOpacity style={styles.editImageButton} onPress={async () => { /* Sua lógica */ }}><Text style={styles.editImageText}>Alterar Imagem</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => setEditingContent((prev: any) => ({ ...prev, items: prev.items.filter((_: any, i: number) => i !== idx) }))}><Text style={styles.deleteButtonText}>Excluir Membro</Text></TouchableOpacity>
                  </View>))}
                  <TouchableOpacity style={styles.addButton} onPress={() => setEditingContent((prev: any) => ({ ...prev, items: [...(prev.items || []), { name: '', role: '', email: '', image: '' }] }))}><Text style={styles.addButtonText}>Adicionar Membro</Text></TouchableOpacity>
                </>)}
                {/* Form Edição Grupos */}
                {section.section === 'Grupos_Importantes' && Array.isArray(editingContent?.items) && (<>
                  <Text style={styles.editLabel}>Editar {section.section}</Text>
                  {editingContent.items.map((group: GrupoImportanteItem, idx: number) => (<View key={`edit-group-${idx}`} style={styles.editableItemContainer}>
                    <TextInput style={styles.textInput} value={group.nome} placeholder="Nome do Grupo" onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, items: prev.items.map((g: any, i: number) => i === idx ? { ...g, nome: text } : g) }))} />
                    <TextInput style={styles.textInput} value={group.link} placeholder="Link do Grupo (WhatsApp)" keyboardType="url" onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, items: prev.items.map((g: any, i: number) => i === idx ? { ...g, link: text } : g) }))} />
                    <TouchableOpacity style={styles.deleteButton} onPress={() => setEditingContent((prev: any) => ({ ...prev, items: prev.items.filter((_: any, i: number) => i !== idx) }))}><Text style={styles.deleteButtonText}>Excluir Grupo</Text></TouchableOpacity>
                  </View>))}
                  <TouchableOpacity style={styles.addButton} onPress={() => setEditingContent((prev: any) => ({ ...prev, items: [...(prev.items || []), { nome: '', link: '' }] }))}><Text style={styles.addButtonText}>Adicionar Grupo</Text></TouchableOpacity>
                </>)}
                {/* Form Edição Texto */}
                {section.section !== 'Equipe' && section.section !== 'Grupos_Importantes' && (<>
                  <Text style={styles.editLabel}>Editar {section.section}</Text>
                  <TextInput style={[styles.textInput, styles.textArea]} value={editingContent?.text || ''} multiline textAlignVertical="top" onChangeText={(text) => setEditingContent((prev: any) => ({ ...prev, text }))} placeholder="Digite o novo conteúdo" />
                  {section.section === 'História' && (<TextInput style={styles.textInput} value={editingContent?.link || ''} onChangeText={(link) => setEditingContent((prev: any) => ({ ...prev, link }))} placeholder="Digite o novo link" />)}
                </>)}
                {/* Botões Salvar/Cancelar Comuns */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveContent(section.section)}><Text style={styles.saveButtonText}>Salvar Alterações</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleDiscardChanges}><Text style={styles.cancelButtonText}>Descartar</Text></TouchableOpacity>
                </View>
              </> // Fim do Fragment Modo Edição
              ) : ( // ~~~~~ MODO DE VISUALIZAÇÃO ~~~~~
                <View>{/* Container Visualização + Lápis */}
                  {Array.isArray(section.content?.items) ? (<>{/* É Array de Itens */}
                    {section.section === 'Equipe' && section.content.items.map((member: any, idx: number) => (<View key={`view-member-${idx}`} style={styles.tech}>
                      <Image source={{ uri: member.image }} style={styles.techImage} />
                      <View style={styles.techInfo}><Text style={styles.techName}>{member.name}</Text><Text style={styles.techRole}>{member.role}</Text><TouchableOpacity onPress={() => openLink(`mailto:${member.email}`)}><Text style={styles.techEmail}>{member.email}</Text></TouchableOpacity></View>
                    </View>))}
                    {section.section === 'Grupos_Importantes' && section.content.items.map((group: any, idx: number) => (<TouchableOpacity key={`view-group-${idx}`} style={styles.groupLinkContainer} onPress={() => openLink(group.link ?? null)}><Icon name="logo-whatsapp" size={24} color="#25D366" style={styles.groupIcon} /><Text style={styles.groupLinkText}>{group.nome}</Text></TouchableOpacity>))}
                    {section.section !== 'Equipe' && section.section !== 'Grupos_Importantes' && section.content.items.map((item: any, idx: number) => (<Text key={`gen-item-${idx}`} style={styles.infoText}>{item.text || `Item ${idx + 1} sem texto`}</Text>))}
                  </>) : (<>{/* NÃO é Array de Itens (Assume Texto) */}
                    <Text style={styles.infoText}>{section.content?.text || `Conteúdo '${section.section}' indisponível.`}</Text>
                    {section.section === 'História' && section.content?.link && (<TouchableOpacity onPress={() => openLink(section.content.link)}><Text style={styles.link}>saiba mais</Text></TouchableOpacity>)}
                  </>)}
                  {isAdmin && (<TouchableOpacity style={styles.editIcon} onPress={() => { setEditing(section.section); setEditingContent(JSON.parse(JSON.stringify(section.content || {}))); }}><FontAwesome name="pencil" size={24} color="#00008B" /></TouchableOpacity>)}
                </View> // Fim Container Visualização + Lápis
              )}
            </View>
          </View>
          ))}
        </>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  editableMember: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  editImageButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  editImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  textInput: {
    borderColor: '#00008B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editIcon: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#00008B',
  },
  link: {
    fontSize: 16,
    color: '#000',
    textDecorationLine: 'underline',
    textAlign: 'left',
    marginTop: 10,
    fontWeight: 'bold',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00008B',
    marginRight: 5,
  },
  card: {
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
  tech: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  techImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  techInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  techName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00008B',
  },
  techRole: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  techEmail: {
    fontSize: 14,
    color: '#1E90FF',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 250,
    height: 300,
    borderRadius: 10,
  },
  cameraIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 15,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 7,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 60,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#00008B',
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#00008B',
  },
  infoText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  groupLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  groupIcon: {
    marginRight: 12,
  },
  groupLinkText: {
    fontSize: 16,
    color: '#00008B',
    fontWeight: 'bold',
    flex: 1,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editableItemContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default EstruturaFaenScreen;
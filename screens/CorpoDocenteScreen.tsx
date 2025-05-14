import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { FontAwesome } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

interface Professor {
  nome: string;
  email: string;
  lattes: string;
  image: string;
}

interface Docente {
  id: number;
  content: Professor[];
}

const CorpoDocenteScreen: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocenteId, setEditingDocenteId] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<Professor | null>(null);

  const { isAdmin } = useAdmin(); // Controle de administrador, substitua conforme necessário.

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Buscar dados do Supabase
  const fetchDocentes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('docente_content')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao buscar docentes:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os docentes.');
    } else {
      setDocentes(data || []);
    }
    setLoading(false);
  };

  // Salvar alterações
  const handleSave = async () => {
    if (editingDocenteId === null || editingIndex === null || editingContent === null) return;

    const updatedDocentes = docentes.map((docente) => {
      if (docente.id === editingDocenteId) {
        const updatedContent = docente.content.map((professor, idx) =>
          idx === editingIndex ? editingContent : professor
        );
        return { ...docente, content: updatedContent };
      }
      return docente;
    });

    const { error } = await supabase
      .from('docente_content')
      .update({ content: updatedDocentes.find((d) => d.id === editingDocenteId)?.content })
      .eq('id', editingDocenteId);

    if (error) {
      console.error('Erro ao salvar alterações:', error.message);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } else {
      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      setEditingDocenteId(null);
      setEditingIndex(null);
      setEditingContent(null);
      fetchDocentes();
    }
  };

  const handleDelete = async (docenteId: number, professorIndex: number) => {
    const docente = docentes.find((d) => d.id === docenteId);
    if (!docente) {
      Alert.alert('Erro', 'Docente não encontrado.');
      return;
    }

    const updatedContent = docente.content.filter((_, idx) => idx !== professorIndex);

    const { error } = await supabase
      .from('docente_content')
      .update({ content: updatedContent })
      .eq('id', docenteId);

    if (error) {
      console.error('Erro ao deletar professor:', error.message);
      Alert.alert('Erro', 'Não foi possível deletar o professor.');
    } else {
      Alert.alert('Sucesso', 'Professor deletado com sucesso!');
      setEditingDocenteId(null); // Reseta a edição ativa
      setEditingIndex(null); // Reseta o índice de edição ativo
      setEditingContent(null); // Reseta o conteúdo em edição
      fetchDocentes(); // Atualiza a lista de docentes
    }
  };


  // Alterar imagem
  const handleImageChange = async () => {
    if (editingContent === null) return;

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
        Alert.alert('Erro', 'Erro ao fazer upload da imagem.');
        return;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl || '';

      if (!publicUrl) {
        Alert.alert('Erro', 'Não foi possível obter a URL da imagem.');
        return;
      }

      setEditingContent({ ...editingContent, image: publicUrl });
    } catch (error) {
      console.error('Erro ao alterar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao alterar a imagem.');
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setEditingDocenteId(null);
    setEditingIndex(null);
    setEditingContent(null);
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />

      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Corpo Docente</Text>

          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            docentes.map((docente) =>
              docente.content.map((professor, idx) => (
                <View key={`${docente.id}-${idx}`} style={styles.card}>
                  {editingDocenteId === docente.id && editingIndex === idx ? (
                    <View style={styles.editableCard}>
                      <TextInput
                        style={styles.textInput}
                        value={editingContent?.nome || ''}
                        onChangeText={(text) =>
                          setEditingContent((prev) =>
                            prev ? { ...prev, nome: text } : null
                          )
                        }
                        placeholder="Nome"
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editingContent?.email || ''}
                        onChangeText={(text) =>
                          setEditingContent((prev) =>
                            prev ? { ...prev, email: text } : null
                          )
                        }
                        placeholder="E-mail"
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editingContent?.lattes || ''}
                        onChangeText={(text) =>
                          setEditingContent((prev) =>
                            prev ? { ...prev, lattes: text } : null
                          )
                        }
                        placeholder="Lattes"
                      />
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={handleImageChange}
                      >
                        <Text style={styles.buttonText}>Alterar Imagem</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(docente.id, idx)}
                      >
                        <Text style={styles.buttonText}>Deletar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.buttonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Image source={{ uri: professor.image }} style={styles.cardImage} />
                      <View style={styles.infoContainer}>
                        <Text style={styles.name}>{professor.nome}</Text>
                        <Text style={styles.email}>E-mail: {professor.email}</Text>
                        <TouchableOpacity onPress={() => openLink(professor.lattes)}>
                          <Text style={styles.lattes}>Lattes</Text>
                        </TouchableOpacity>
                      </View>
                      {isAdmin && (
                        <TouchableOpacity
                          style={styles.editIcon}
                          onPress={() => {
                            setEditingDocenteId(docente.id);
                            setEditingIndex(idx);
                            setEditingContent(professor);
                          }}
                        >
                          <FontAwesome name="pencil" size={24} color="#00008B" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              ))
            )
          )}
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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00008B',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
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
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00008B',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  lattes: {
    fontSize: 14,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  editIcon: {
    marginLeft: 10,
  },
  editableCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
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
    fontSize: 14, // Define um tamanho fixo para o texto
    height: 40, // Altura fixa para evitar o crescimento/redução
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
  deleteButton: {
    backgroundColor: '#f44336',
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
  loadingText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CorpoDocenteScreen;

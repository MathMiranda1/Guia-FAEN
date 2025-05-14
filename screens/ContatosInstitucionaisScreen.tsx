import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert } from 'react-native';
import { MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';
import { useAdmin } from '@/app/lib/AdminContext';

const ContatosInstitucionaisScreen: React.FC = () => {
  const [contatos, setContatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);

  const { isAdmin } = useAdmin();

  // Função para abrir links
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Buscar dados do Supabase
  const fetchContatos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contatos_content')
      .select('*')
      .order('id', { ascending: true }); // Ordena pelo ID em ordem crescente

    if (error) {
      console.error('Erro ao buscar contatos:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os contatos.');
    } else {
      setContatos(data || []);
    }
    setLoading(false);
  };

  // Salvar alterações
  const handleSave = async (id: number) => {
    const { error } = await supabase
      .from('contatos_content')
      .update({ content: editingContent })
      .eq('id', id);

    if (error) {
      console.error('Erro ao salvar alterações:', error.message);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } else {
      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      setEditing(null);
      fetchContatos();
    }
  };

  // Cancelar ediç
  const handleCancel = () => {
    setEditing(null);
    setEditingContent(null);
  };

  useEffect(() => {
    fetchContatos();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />

      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Contatos Institucionais</Text>

          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            contatos.map((contato, index) => (
              <View key={contato.id} style={styles.contactCard}>
                <View style={styles.contactCardHeader}>
                  <View style={styles.infoHeader}>
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                    <View style={styles.infoCircle} />
                    <Text style={styles.contactTitle}>{contato.titulo}</Text>
                  </View>
                </View>

                {editing === contato.id ? (
                  <View>
                    <TextInput
                      style={styles.textInput}
                      value={editingContent?.descricao || ''}
                      onChangeText={(text) =>
                        setEditingContent((prev: any) => ({ ...prev, descricao: text }))
                      }
                      placeholder="Descrição"
                    />
                    <TextInput
                      style={styles.textInput}
                      value={editingContent?.telefone1 || ''}
                      onChangeText={(text) =>
                        setEditingContent((prev: any) => ({ ...prev, telefone1: text }))
                      }
                      placeholder="Telefone 1"
                    />
                    <TextInput
                      style={styles.textInput}
                      value={editingContent?.telefone2 || ''}
                      onChangeText={(text) =>
                        setEditingContent((prev: any) => ({ ...prev, telefone2: text }))
                      }
                      placeholder="Telefone 2"
                    />
                    <TextInput
                      style={styles.textInput}
                      value={editingContent?.instagram || ''}
                      onChangeText={(text) =>
                        setEditingContent((prev: any) => ({ ...prev, instagram: text }))
                      }
                      placeholder="Instagram"
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave(contato.id)}
                    >
                      <Text style={styles.buttonText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.contactCardContent}>
                    <Image
                      source={{ uri: contato.content.image }}
                      style={styles.cardImage}
                    />
                    <View style={styles.contactInfo}>
                      <Text style={styles.descriptionText}>
                        {contato.content.descricao}
                      </Text>
                      {contato.content.telefone1 && (
                        <View style={styles.contactRow}>
                          <FontAwesome name="phone" size={20} color="#00008B" style={styles.icon} />
                          <Text style={styles.contactText}>{contato.content.telefone1}</Text>
                        </View>
                      )}
                      {contato.content.telefone2 && (
                        <View style={styles.contactRow}>
                          <FontAwesome name="phone" size={20} color="#00008B" style={styles.icon} />
                          <Text style={styles.contactText}>{contato.content.telefone2}</Text>
                        </View>
                      )}
                      {contato.content.emails.map((email: string, i: number) => (
                        <TouchableOpacity key={i} onPress={() => openLink(`mailto:${email}`)}>
                          <View style={styles.contactRow}>
                            <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                            <Text style={styles.link}>{email}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      {contato.content.instagram && (
                        <TouchableOpacity onPress={() => openLink(contato.content.instagram)}>
                          <View style={styles.contactRow}>
                            <FontAwesome5 name="instagram" size={20} color="#00008B" style={styles.icon} />
                            <Text style={styles.link}>{contato.content.instagram}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                {isAdmin && editing !== contato.id && (
                  <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => {
                      setEditing(contato.id);
                      setEditingContent(contato.content);
                    }}
                  >
                    <FontAwesome name="pencil" size={24} color="#00008B" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Estilos permanecem iguais, apenas adicionei estilos para os botões de salvar e cancelar
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
  textInput: {
    borderColor: '#00008B',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    color: '#333',
  },
  editIcon: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00008B',
  },
  contactCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#00008B',
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  contactCardContent: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00008B',
    marginLeft: 5,
  },
  contactDetails: {
    marginTop: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 7,
  },
  icon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#00008B',
    marginTop: 10,
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'justify',
  },
  visitLink: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

export default ContatosInstitucionaisScreen;
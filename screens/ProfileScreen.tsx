import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/(tabs)';
import { supabase } from '../app/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const [userData, setUserData] = useState<{ email: string; name: string | null }>({
    email: '',
    name: null,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar edição
  const [editedName, setEditedName] = useState<string | null>(null); // Nome editado

  // Função para buscar os dados do usuário autenticado
  // Função para buscar os dados do usuário autenticado diretamente da tabela "users"
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;

      // Busca os dados do usuário na tabela "users" usando o ID
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      setUserData({
        email: user?.email || '',
        name: userData.name || 'Nome não disponível',
      });
      setEditedName(userData.name || ''); // Atualiza o nome editável
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao carregar dados do usuário: ' + error.message);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };


  // Função para atualizar o nome do usuário
  const updateUserName = async () => {
    if (!editedName) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;

      // Atualiza o campo "name" diretamente na tabela "users"
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: editedName })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Atualiza os metadados do usuário
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: editedName },
      });

      if (metadataError) throw metadataError;

      setUserData((prev) => ({ ...prev, name: editedName })); // Atualiza localmente o nome
      setIsEditing(false); // Sai do modo de edição
      Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao atualizar o nome: ' + error.message);
      console.log(error.message);
    }
  };



  // Função para realizar logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Falha ao sair: ' + error.message);
      console.log('Logout falhou:', error.message);
    } else {
      console.log('Logout bem-sucedido');
      navigation.navigate('Login');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#6A5ACD" />
        ) : (
          <>
            {/* Foto de Perfil */}
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: 'https://beta.apps.uern.br/wp-content/uploads/2021/10/UERNselocircular.jpg' }}
                style={styles.profileImageContent}
                resizeMode="cover"
              />
            </View>

            {/* Card com Nome e Email */}
            <View style={styles.card}>
              <View style={styles.nameContainer}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.nameInput}
                      value={editedName || ''}
                      onChangeText={(text) => setEditedName(text)}
                      placeholder="Digite seu nome"
                      maxLength={40} // Opcional: limita caracteres para ajudar no controle
                    />
                    <TouchableOpacity onPress={updateUserName}>
                      <Ionicons name="checkmark-circle" size={24} color="green" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.userName} numberOfLines={3}>{userData.name}</Text>
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                      <FontAwesome name="pencil" size={24} color="#00008B" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>

            {/* Botão de Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00008B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContent: {
    width: '110%',
    height: '110%',
    transform: [{ translateX: -2.3 }, { translateY: 2 }],
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  card: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    width: '90%',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    maxWidth: SCREEN_WIDTH * 0.6, // 60% da largura da tela
    flexShrink: 1, // Permite que o texto encolha e quebre linha
    textAlign: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#00008B',
    marginRight: 10,
    padding: 5,
    maxWidth: SCREEN_WIDTH * 0.5, // Reduzido para 50% para dar espaço ao ícone
    flexShrink: 1,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#DC143C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '60%',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

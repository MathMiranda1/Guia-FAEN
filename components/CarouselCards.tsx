import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Image, Text, View, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '@/app/(tabs)';
import { ImageSourcePropType } from 'react-native';
import { useAdmin } from '@/app/lib/AdminContext';
import { FontAwesome } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Proporções dinâmicas
const CARD_WIDTH = SCREEN_WIDTH * 0.85; // 85% da largura da tela
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% da altura da tela
const IMAGE_HEIGHT = CARD_HEIGHT * 0.6; // 60% da altura do card

//const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window'); // Movido para styles se precisar

// Tipo para os dados individuais do card, igual ao de HomeScreen
type CardData = {
  id: number;
  title: string;
  formattedTitle: string;
  image: string | ImageSourcePropType; // Usa ImageSourcePropType para imagens locais
  route_key: keyof RootStackParamList;
  description: string;
};

// --- PROPS ATUALIZADAS ---
type CarouselCardsProps = {
  data: CardData[]; // Array de cards com a estrutura atualizada
  onCardPress: (routeKey: keyof RootStackParamList) => void; // Recebe route_key
  onEditImage: (cardId: number) => void; // Para editar imagem
  onEditCard: (cardId: number) => void;  // <-- NOVA: Para INICIAR a edição do card
  onSaveCard: () => void;              // <-- NOVA: Para SALVAR as alterações
  onCancelEdit: () => void;             // Para cancelar a edição
  editingCardId: number | null;        // <-- NOVO: ID do card em edição
  // Props para controlar os inputs de edição
  editedTitle: string;
  setEditedTitle: (text: string) => void;
  editedDescription: string;
  setEditedDescription: (text: string) => void;
  // Remover props antigas: onEditDescription, onSaveDescription, editingCard,
  // onEditTitle, onSaveTitle, editingTitleCard
};

const CarouselCards: React.FC<CarouselCardsProps> = ({
  data,
  onCardPress,
  onEditImage,
  onEditCard,   // <-- Recebe a nova prop
  onSaveCard,   // <-- Recebe a nova prop
  onCancelEdit,
  editingCardId,// <-- Recebe a nova prop
  editedTitle,
  setEditedTitle,
  editedDescription,
  setEditedDescription,
}) => {

  const { isAdmin } = useAdmin();

  // Função para renderizar cada card individualmente

  const renderItem = ({ item }: { item: CardData }) => {
    const isEditing = editingCardId === item.id;

    // ---- renderItem COMPACTADO ---
    return (
      <View style={styles.cardContainer}>{/* Container do Card (Sem espaços aqui) */}
        <TouchableOpacity style={styles.card} onPress={() => !isEditing && onCardPress(item.route_key)} activeOpacity={1} disabled={isEditing}>{/* Card Clicável (Sem espaços aqui) */}
          <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.cardImage} resizeMode="cover" />
          {isAdmin && (<TouchableOpacity style={styles.editIconImage} onPress={() => onEditImage(item.id)}><Ionicons name="camera-outline" size={24} color="#00008B" /></TouchableOpacity>)}{/* Ícone Câmera (Sem espaços aqui) */}
          {/* ----- CONDIÇÃO EDIÇÃO / VISUALIZAÇÃO ----- */}
          {isEditing ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 10 }} style={{ flex: 1 }}>
                <View style={styles.editableCardContent}>
                  {/* Label removido para teste */}
                  <TextInput style={[styles.input, styles.titleInput]} value={editedTitle} onChangeText={setEditedTitle} placeholder="Editar título" />
                  <TextInput style={[styles.input, styles.descriptionInput]} value={editedDescription} onChangeText={setEditedDescription} placeholder="Editar descrição" multiline scrollEnabled={false} />
                </View>
              </ScrollView>
              <View style={styles.editActionContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={onSaveCard}><FontAwesome name="save" size={20} color="#00008B" /><Text style={styles.actionButtonText}>Salvar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.cancelAction]} onPress={onCancelEdit}><FontAwesome name="times" size={20} color="#FF4500" /><Text style={[styles.actionButtonText, styles.cancelText]}>Descartar</Text></TouchableOpacity>
              </View>
            </KeyboardAvoidingView> // Fim KAV
          ) : (<>{/* Fragment Visualização */}
            <View style={styles.contentContainer}>
              <Text style={styles.cardText} numberOfLines={3} adjustsFontSizeToFit={true} minimumFontScale={0.7}>{item.formattedTitle}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            {isAdmin && (<TouchableOpacity style={styles.editButton} onPress={() => onEditCard(item.id)}><FontAwesome name="pencil" size={20} color="#00008B" /></TouchableOpacity>)}
          </> // Fim Fragment Visualização
          )}{/* ----- FIM CONDIÇÃO ----- */}
        </TouchableOpacity>{/* Fim Card Clicável */}
      </View> // Fim cardContainer
    );
  }; // Fim de renderItem
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      horizontal
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 5,
    overflow: 'hidden',
    marginHorizontal: SCREEN_WIDTH * 0.025,
    position: 'relative',
  },
  keyboardAvoidingContainer: {
    flex: 1, // Ocupa o espaço disponível no card quando editando
  },
  editableCardContent: { // Container para os inputs e botões dentro do ScrollView
    padding: SCREEN_WIDTH * 0.04, // Adiciona padding interno
    // Talvez não precise de background ou borda se KAV já está dentro do card branco
  },
  cardImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  cardText: {
    color: '#00008B',
    fontWeight: 'bold',
    fontSize: Math.min(22, SCREEN_WIDTH * 0.06),
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    flexWrap: 'wrap',     // Permite que o texto quebre linhas
    maxWidth: CARD_WIDTH * 0.70,
    alignSelf: 'center',
  },
  cardDescription: {
    color: '#00008B',
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.003,
  },
  editIconImage: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.03,
  },
  editButton: {
    position: 'absolute',
    top: IMAGE_HEIGHT + SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.03,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 5,
    textAlignVertical: 'top',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
  titleInput: {
    fontSize: Math.min(18, SCREEN_WIDTH * 0.05),
    fontWeight: 'bold',
    color: '#00008B',
    textAlign: 'center',
    maxHeight: CARD_HEIGHT * 0.1,
  },
  descriptionInput: { // <-- ESTILO QUE FALTAVA
    minHeight: CARD_HEIGHT * 0.15, // Dar uma altura mínima maior para descrição
    // Herda os outros estilos de 'input' se você aplicar ambos:
    // style={[styles.input, styles.descriptionInput]}
    // Ou copie os estilos de 'input' para cá se não quiser aplicar os dois
    textAlign: 'left', // Descrição geralmente alinhada à esquerda
  },
  editActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#00008B',
    fontWeight: 'bold',
  },
  cancelAction: {
    backgroundColor: '#fff0f0',
  },
  cancelText: {
    color: '#FF4500',
  },
});

export default CarouselCards;
/*
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Image, Text, View, TextInput, Dimensions, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '@/app/(tabs)';
import { ImageSourcePropType } from 'react-native';
import { useAdmin } from '@/app/lib/AdminContext';
import { FontAwesome } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const IMAGE_HEIGHT = CARD_HEIGHT * 0.6;

type CarouselCardsProps = {
  data: {
    id: number;
    title: string;
    formattedTitle: string;
    image: string | ImageSourcePropType;
    navigateTo: keyof RootStackParamList;
    description: string;
  }[];
  onEditImage: (cardId: number) => void;
  onEditDescription: (cardId: number, description: string) => void;
  onSaveDescription: (cardId: number) => void;
  onCancelEdit: () => void;
  editingCard: number | null;
  editedDescription: string;
  setEditedDescription: (text: string) => void;
  onCardPress: (navigateTo: keyof RootStackParamList) => void;
};

const CarouselCards: React.FC<CarouselCardsProps> = ({
  data,
  onEditImage,
  onEditDescription,
  onSaveDescription,
  onCancelEdit,
  editingCard,
  editedDescription,
  setEditedDescription,
  onCardPress,
}) => {
  const { isAdmin } = useAdmin();

  const renderItem = ({ item }: { item: CarouselCardsProps['data'][number] }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={() => onCardPress(item.navigateTo)}>
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.cardImage} resizeMode="cover" />
        {isAdmin && (
          <TouchableOpacity style={styles.editIconImage} onPress={() => onEditImage(item.id)}>
            <Ionicons name="camera-outline" size={24} color="#00008B" />
          </TouchableOpacity>
        )}
        <Text style={styles.cardText}>{item.formattedTitle}</Text>

        {editingCard === item.id ? (
          <>
            <TextInput
              style={styles.input}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Editar descrição"
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => onSaveDescription(item.id)}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancelEdit}>
                <Text style={styles.buttonText}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.cardDescription}>{item.description}</Text>
            {isAdmin && (
              <TouchableOpacity style={styles.editIconText} onPress={() => onEditDescription(item.id, item.description)}>
                <FontAwesome name="pencil" size={20} color="#00008B" />
              </TouchableOpacity>
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      horizontal
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  cardImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardText: {
    color: '#00008B',
    fontWeight: 'bold',
    fontSize: Math.min(22, SCREEN_WIDTH * 0.06),
    textAlign: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.015,
  },
  cardDescription: {
    color: '#00008B',
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    textAlign: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    flex: 1,
  },
  editIconImage: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.03,
  },
  editIconText: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.22,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: '90%',
    maxHeight: CARD_HEIGHT * 0.2,
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SCREEN_HEIGHT * 0.02,
    width: '90%',
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  button: {
    backgroundColor: '#00008B',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#FF4500',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
  },
});

export default CarouselCards;

*/
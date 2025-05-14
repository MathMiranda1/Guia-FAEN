import { useAdmin } from '@/app/lib/AdminContext';
import { supabase } from '@/app/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, Dimensions } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


// --- NOVOS TIPOS ---
type AuxilioItem = {
  nome: string;
  descricao: string;
  link?: string | null; // O link que virá do JSON
  whatsappLink?: string | null; // Mantenha se quiser diferenciar (ou remova se só usa 'link')
};

type AtendimentosContent = {
  items: AuxilioItem[]; // A coluna 'content' terá um objeto com a chave 'items'
};

type AtendimentosEntry = {
  id: number;
  titulo: string; // O título principal da linha ('Atendimentos e Auxílios')
  content: AtendimentosContent; // O objeto JSONB
  created_at: string;
  updated_at: string;
};


function isAuxilioItem(item: any): item is AuxilioItem {
  // Checa pelas propriedades obrigatórias (nome e descricao)
  return item && typeof item.nome === 'string' && typeof item.descricao === 'string';
}

export default function AtendimentosAuxiliosScreen() {
  // --- ESTADOS ATUALIZADOS ---
  const [atendimentosData, setAtendimentosData] = useState<AtendimentosEntry | null>(null); // Guarda a linha toda do Supabase
  const [fetchedAuxilios, setFetchedAuxilios] = useState<AuxilioItem[]>([]); // Guarda apenas o array de items
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Para controlar modo edição
  const [editingItems, setEditingItems] = useState<AuxilioItem[]>([]); // Guarda a lista durante a edição
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { isAdmin } = useAdmin(); // Você já tem isso


  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('atendimentos_auxilios_content')
        .select('*')
        .eq('titulo', 'Atendimentos e Auxílios') // Busca pela linha específica
        .single(); // Espera apenas um resultado

      if (error) {
        console.error('Erro ao buscar Atendimentos/Auxílios:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } else if (data) {
        setAtendimentosData(data as AtendimentosEntry); // Guarda a linha inteira
        // Garante que pegamos o array 'items', mesmo que 'content' ou 'items' sejam nulos no DB
        setFetchedAuxilios(data.content?.items || []);
      } else {
        // Caso a linha 'Atendimentos e Auxílios' não exista
        setFetchedAuxilios([]); // Define como vazio se não encontrou a linha
        console.warn("Dados para 'Atendimentos e Auxílios' não encontrados no DB.");
      }
    } catch (err) {
      console.error("Erro inesperado em fetchData:", err);
      Alert.alert("Erro Inesperado", "Ocorreu um problema ao buscar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Busca os dados ao carregar a tela
  }, []);


  // --- NOVAS FUNÇÕES DE EDIÇÃO ---

  const handleEdit = () => {
    // Copia os dados atuais para o estado de edição
    setEditingItems(JSON.parse(JSON.stringify(fetchedAuxilios))); // Cópia profunda!
    setIsEditing(true); // Entra no modo de edição
  };

  const handleDiscardChanges = () => {
    setIsEditing(false);
    setEditingItems([]); // Limpa o array de edição
  };

  const handleItemChange = (index: number, field: keyof AuxilioItem, value: string) => {
    // Cria uma cópia do array de items que está sendo editado
    const updatedItems = editingItems.map((item, i) => {
      // Se este é o item que estamos alterando (pelo índice)
      if (i === index) {
        // Cria uma cópia do item específico
        const updatedItem = { ...item };

        // ----> LÓGICA CORRIGIDA POR CAMPO <----
        // Se o campo for 'nome' ou 'descricao', o valor DEVE ser string (ou vazia)
        if (field === 'nome' || field === 'descricao') {
          updatedItem[field] = value ?? ''; // Garante string, usa '' se value for null/undefined
        }
        // Se o campo for 'link' ou 'whatsappLink', o valor PODE ser null se a string for vazia
        else if (field === 'link' || field === 'whatsappLink') {
          updatedItem[field] = value || null; // Se value for "", '', null, ou undefined, salva null
        }

        // Retorna o item atualizado
        return updatedItem;
      }
      // Se não for o item sendo alterado, retorna o item original
      return item;
    });

    // Atualiza o estado 'editingItems' com o novo array modificado
    setEditingItems(updatedItems);
  };


  const handleAddItem = () => {
    setEditingItems([...editingItems, { nome: '', descricao: '', link: null }]); // Adiciona item vazio
  };

  const handleDeleteItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index)); // Remove pelo índice
  };

  const handleSaveChanges = async () => {
    if (!atendimentosData) { // Precisa do ID da linha original
      Alert.alert("Erro", "Não foi possível identificar os dados originais para salvar.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('atendimentos_auxilios_content')
        .update({ content: { items: editingItems } }) // Envia o objeto com a chave 'items'
        .eq('id', atendimentosData.id); // Usa o ID da linha

      if (error) {
        throw error; // Joga o erro para o catch
      }

      // Sucesso: Atualiza o estado principal e sai da edição
      setFetchedAuxilios(editingItems);
      setIsEditing(false);
      setEditingItems([]);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');

    } catch (error: any) {
      console.error('Erro ao salvar atendimentos/auxílios:', error);
      // Checa por erro específico de RLS
      if (error.message?.includes('violates row-level security policy')) {
        Alert.alert('Erro de Permissão', 'Você não tem permissão para alterar estes dados.');
      } else {
        Alert.alert('Erro', `Não foi possível salvar as alterações: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  // --- Fim das Funções de Edição ---

  // --- Bloco return ATUALIZADO ---
  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background}>
      <View style={styles.darkOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Atendimentos e Auxílios</Text>

        {/* Ícone de Lápis GERAL (só aparece para admin, FORA do modo de edição) */}
        {isAdmin && !isEditing && (
          <TouchableOpacity onPress={handleEdit} style={styles.generalEditButton}>
            <FontAwesome name="pencil" size={24} color="#00008B" />
          </TouchableOpacity>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          <>
            {/* --- LÓGICA DE RENDERIZAÇÃO --- */}
            {isEditing ? (
              // ===== MODO DE EDIÇÃO =====
              <View>
                {editingItems.map((item, index) => {
                  // ----> Usa o Type Guard para verificar <----
                  // (Embora em 'editingItems' já deva ser o tipo certo,
                  //  é uma boa prática e ajuda o TS em alguns casos)
                  if (!isAuxilioItem(item)) {
                    console.error("Tentando editar item com formato inválido:", item);
                    return null; // Não renderiza o formulário para este item
                  }

                  // Se passou, 'item' é tratado como AuxilioItem
                  return (
                    <View key={`edit-${index}`} style={styles.editableItemContainer}>
                      <Text style={styles.editLabel}>Item {index + 1}</Text>
                      <TextInput
                        style={styles.textInput}
                        // ----> Usa ?? '' para value <----
                        value={item.nome ?? ''}
                        onChangeText={(text) => handleItemChange(index, 'nome', text)}
                        placeholder="Nome do Auxílio/Atendimento"
                      />
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        // ----> Usa ?? '' para value <----
                        value={item.descricao ?? ''}
                        onChangeText={(text) => handleItemChange(index, 'descricao', text)}
                        placeholder="Descrição"
                        multiline
                      />
                      <TextInput
                        style={styles.textInput}
                        // ----> Usa ?? '' para value <----
                        value={item.link ?? ''}
                        // O handleItemChange já trata 'null' aqui
                        onChangeText={(text) => handleItemChange(index, 'link', text)}
                        placeholder="Link (Opcional - WhatsApp, etc.)"
                        keyboardType="url"
                      />
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(index)}>
                        <Text style={styles.deleteButtonText}>Excluir este Item</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {/* Botão Adicionar Novo Item */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                  <Text style={styles.addButtonText}>Adicionar Novo Item</Text>
                </TouchableOpacity>

                {/* Botões Salvar/Descartar GERAIS */}
                <View style={styles.editActionButtons}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                    <Text style={styles.buttonText}>Salvar Todas Alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleDiscardChanges}>
                    <Text style={styles.buttonText}>Descartar Alterações</Text>
                  </TouchableOpacity>
                </View>
              </View>

            ) : (
              // ===== MODO DE VISUALIZAÇÃO =====
              <>
                {fetchedAuxilios.map((item, index) => {
                  // ----> Usa o Type Guard <----
                  if (!isAuxilioItem(item)) {
                    // Pode logar erro ou retornar null se dados inválidos vierem
                    return null;
                  }
                  // Se passou, 'item' é tratado como AuxilioItem
                  return (
                    <View key={index} style={styles.card}>
                      <TouchableOpacity style={styles.header} onPress={() => toggleExpand(index)}>
                        <Text style={styles.cardTitle}>{item.nome}</Text>
                        <Icon name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
                      </TouchableOpacity>
                      {expandedIndex === index && (
                        <View>
                          <Text style={styles.cardContent}>{item.descricao}</Text>
                          {/* Renderiza botão do WhatsApp/Link se existir */}
                          {/* ----> Usa ?? null para openLink <---- */}
                          {(item.link || item.whatsappLink) && ( // Checa ambos por segurança
                            <TouchableOpacity style={styles.whatsappContainer} onPress={() => {
                              const url = item.link || item.whatsappLink;
                              if (url) openLink(url);
                            }}>
                              <Icon name="logo-whatsapp" size={20} color="#25D366" style={styles.icon} />
                              <Text style={styles.whatsappText}>Acessar Link/Grupo</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Link Linktree Fixo (como estava) */}
                <TouchableOpacity style={styles.linkContainer} onPress={() => openLink('https://linktr.ee/prae.uern')}>
                  <Icon name="library" size={20} color="#1E90FF" style={styles.icon} />
                  <Text style={styles.link}>https://linktr.ee/prae.uern</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
} // Fim do Componente

// --- Estilos NECESSÁRIOS (Adicionar/Ajustar no seu StyleSheet) ---
const styles = StyleSheet.create({
  // Seus estilos existentes (background, container, title, card, header, cardTitle, cardContent, etc...)
  background: { flex: 1, resizeMode: 'cover' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fafafa80' },
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#00008B' },
  loadingText: { fontSize: 16, textAlign: 'center', marginTop: 30, color: '#555' },
  card: { backgroundColor: '#f0f8ff', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 2, borderColor: '#00008B' }, // Ajustado padding
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#00008B', flex: 1, marginRight: 5 }, // flex: 1 para evitar quebrar linha cedo
  cardContent: { fontSize: 16, color: '#333', marginTop: 10, lineHeight: 23, textAlign: 'justify' }, // Leve ajuste na cor e line height
  whatsappContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' }, // Adicionado alignSelf
  icon: { marginRight: 8 }, // Estilo reutilizado para ícones
  whatsappText: { fontSize: 15, color: '#1E90FF', textDecorationLine: 'underline', fontWeight: 'bold' }, // Mudado para azul e nome genérico
  linkContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30, justifyContent: 'center' },
  link: { fontSize: 16, color: '#00008B', textDecorationLine: 'underline', fontWeight: 'bold' },

  // --- NOVOS/AJUSTADOS Estilos de Edição ---
  generalEditButton: { // Botão lápis geral no topo (se admin)
    position: 'absolute',
    top: 15, // Ajuste a posição conforme necessário
    right: 15,
    zIndex: 10,
    padding: 5,
    // backgroundColor: 'rgba(0,0,0,0.1)', // Fundo opcional
    // borderRadius: 20,
  },
  editableItemContainer: { // Container para cada item no modo edição
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600', // Semibold
    color: '#777', // Cinza
    marginBottom: 5,
  },
  textInput: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 15,
  },
  textArea: {
    minHeight: 80, // Altura para descrição
    textAlignVertical: 'top',
  },
  deleteButton: {
    backgroundColor: '#e74c3c', // Vermelho mais suave
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-end', // Botão na direita
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff', // Azul para adicionar
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5, // Espaçamento após a lista
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Ajuste neste container que segura os botões Salvar/Cancelar
  editActionButtons: {
    flexDirection: 'row',      // Mantém lado a lado
    justifyContent: 'space-around', // Ou 'space-between' para mais espaço nas pontas
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    // Remova qualquer width fixo que possa existir aqui
  },

  // Ajuste nos estilos individuais dos botões
  saveButton: {
    backgroundColor: '#2ecc71', // Verde mais suave
    paddingVertical: 12,
    paddingHorizontal: 15, // Reduza o padding horizontal se necessário
    borderRadius: 5,
    alignItems: 'center',
    // Usa flex: 1 para tentar dividir espaço, mas limitado por maxWidth
    flexShrink: 1, // Permite encolher se não couber
    marginHorizontal: 5, // Adiciona pequena margem entre botões
  },
  cancelButton: {
    backgroundColor: '#95a5a6', // Cinza para cancelar
    paddingVertical: 12,
    paddingHorizontal: 15, // Reduza o padding horizontal se necessário
    borderRadius: 5,
    alignItems: 'center',
    // Usa flex: 1 para tentar dividir espaço, mas limitado por maxWidth
    flexShrink: 1, // Permite encolher se não couber
    marginHorizontal: 5, // Adiciona pequena margem entre botões
  },
  buttonText: { // Confirme o estilo do texto, talvez precise ajustar
    color: '#fff',
    fontSize: 15, // Um pouco menor talvez?
    fontWeight: 'bold',
    textAlign: 'center', // Garante centralização se houver quebra de linha
  },
});
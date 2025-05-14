import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert, } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { FontAwesome } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

interface Informacao {
    descricao: string;
}

interface Orientadora {
    nome: string;
    email: string;
    image: string;
    descricao: string;
}

interface OrientadorasContent {
    id: number;
    content: {
        informacoes: Informacao[];
        orientadoras: Orientadora[];
    };
}

const OrientadoresScreen: React.FC = () => {
    const [orientadorasData, setOrientadorasData] = useState<OrientadorasContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingOrientadora, setEditingOrientadora] = useState<Orientadora | null>(null);

    const { isAdmin } = useAdmin();

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    // Buscar dados do Supabase
    const fetchOrientadoras = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orientadoras_content')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Erro ao buscar orientadoras:', error.message);
            Alert.alert('Erro', 'Não foi possível carregar as orientadoras.');
        } else {
            setOrientadorasData(data);
        }
        setLoading(false);
    };

    // Salvar alterações
    const handleAddOrientadora = () => {
        if (!orientadorasData) return;

        const newOrientadora: Orientadora = {
            nome: '',
            email: '',
            image: '',
            descricao: '',
        };

        const updatedContent = {
            ...orientadorasData.content,
            orientadoras: [...orientadorasData.content.orientadoras, newOrientadora],
        };

        setOrientadorasData({
            ...orientadorasData,
            content: updatedContent,
        });

        // Define o índice e ativa o modo de edição
        setEditingIndex(updatedContent.orientadoras.length - 1);
        setEditingOrientadora(newOrientadora);
    };

    const handleCancel = () => {
        if (!orientadorasData || editingIndex === null) return;

        // Se estava editando um item existente, restaura os dados originais
        const updatedOrientadoras = [...orientadorasData.content.orientadoras];

        if (editingIndex === updatedOrientadoras.length - 1 &&
            !editingOrientadora?.nome &&
            !editingOrientadora?.email &&
            !editingOrientadora?.descricao) {
            // Apenas remove se for um novo card vazio
            updatedOrientadoras.pop();
        }

        const updatedContent = {
            ...orientadorasData.content,
            orientadoras: updatedOrientadoras,
        };

        setOrientadorasData({
            ...orientadorasData,
            content: updatedContent,
        });

        // Reseta o estado de edição
        setEditingOrientadora(null);
        setEditingIndex(null);
    };


    const handleSave = async () => {
        if (!editingOrientadora || !orientadorasData) {
            Alert.alert('Erro', 'Não há alterações para salvar.');
            return;
        }

        const updatedOrientadoras = [...orientadorasData.content.orientadoras];

        if (editingIndex !== null) {
            updatedOrientadoras[editingIndex] = editingOrientadora; // Atualiza ou mantém a nova orientadora
        }

        const updatedContent = {
            ...orientadorasData.content,
            orientadoras: updatedOrientadoras,
        };

        const { error } = await supabase
            .from('orientadoras_content')
            .update({ content: updatedContent })
            .eq('id', orientadorasData.id);

        if (error) {
            console.error('Erro ao salvar alterações:', error.message);
            Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        } else {
            Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
            setEditingIndex(null);
            setEditingOrientadora(null);
            fetchOrientadoras(); // Atualiza os dados após salvar
        }
    };

    // Excluir orientadora
    const handleDelete = async (index: number) => {
        if (!orientadorasData) return;

        const updatedOrientadoras = orientadorasData.content.orientadoras.filter(
            (_, idx) => idx !== index
        );

        const updatedContent = {
            ...orientadorasData.content,
            orientadoras: updatedOrientadoras,
        };

        const { error } = await supabase
            .from('orientadoras_content')
            .update({ content: updatedContent })
            .eq('id', orientadorasData.id);

        if (error) {
            console.error('Erro ao excluir orientadora:', error.message);
            Alert.alert('Erro', 'Não foi possível excluir a orientadora.');
        } else {
            Alert.alert('Sucesso', 'Orientadora excluída com sucesso!');
            fetchOrientadoras();
        }
    };

    // Alterar imagem
    const handleImageChange = async () => {
        if (editingOrientadora === null) return;

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

            setEditingOrientadora({ ...editingOrientadora, image: publicUrl });
        } catch (error) {
            console.error('Erro ao alterar imagem:', error);
            Alert.alert('Erro', 'Ocorreu um problema ao alterar a imagem.');
        }
    };

    // Cancelar edição

    useEffect(() => {
        fetchOrientadoras();
    }, []);

    return (
        <ImageBackground
            source={require('../assets/images/background.png')}
            style={styles.backgroundImage}
        >
            <View style={styles.darkOverlay} />

            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Orientadores Acadêmicos</Text>

                    {loading ? (
                        <Text style={styles.loadingText}>Carregando...</Text>
                    ) : (
                        <>
                            {/* Informações */}
                            <View style={styles.gridContainer}>
                                {orientadorasData?.content.informacoes.map((info, idx) => (
                                    <View key={idx} style={styles.infoCard}>
                                        <View style={styles.infoHeader}>
                                            <View style={styles.infoCircle} />
                                            <View style={styles.infoCircle} />
                                            <View style={styles.infoCircle} />
                                        </View>
                                        <Text style={styles.infoDescricao}>{info.descricao}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Orientadoras */}
                            {orientadorasData?.content.orientadoras.map((orientadora, idx) => (
                                <View key={idx} style={styles.card}>
                                    {editingIndex === idx ? (
                                        <View style={styles.editableCard}>
                                            <TextInput
                                                style={styles.textInput}
                                                value={editingOrientadora?.nome || ''}
                                                onChangeText={(text) =>
                                                    setEditingOrientadora((prev) =>
                                                        prev ? { ...prev, nome: text } : null
                                                    )
                                                }
                                                placeholder="Nome"
                                            />
                                            <TextInput
                                                style={styles.textInput}
                                                value={editingOrientadora?.email || ''}
                                                onChangeText={(text) =>
                                                    setEditingOrientadora((prev) =>
                                                        prev ? { ...prev, email: text } : null
                                                    )
                                                }
                                                placeholder="E-mail"
                                            />
                                            <TextInput
                                                style={styles.textInput}
                                                value={editingOrientadora?.descricao || ''}
                                                onChangeText={(text) =>
                                                    setEditingOrientadora((prev) =>
                                                        prev ? { ...prev, descricao: text } : null
                                                    )
                                                }
                                                placeholder="Descrição"
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
                                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                                <Text style={styles.buttonText}>Cancelar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Image source={{ uri: orientadora.image }} style={styles.cardImage} />
                                            <View style={styles.infoContainer}>
                                                <Text style={styles.name}>{orientadora.nome}</Text>
                                                <Text style={styles.email}>E-mail: {orientadora.email}</Text>
                                                <Text style={styles.descricao}>{orientadora.descricao}</Text>
                                            </View>
                                            {isAdmin && (
                                                <View style={styles.actionIcons}>
                                                    <TouchableOpacity
                                                        style={styles.editIcon}
                                                        onPress={() => {
                                                            setEditingIndex(idx);
                                                            setEditingOrientadora(orientadora);
                                                        }}
                                                    >
                                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.deleteIcon}
                                                        onPress={() => handleDelete(idx)}
                                                    >
                                                        <FontAwesome name="trash" size={24} color="#FF0000" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </>
                    )}
                    {isAdmin && (
                        <TouchableOpacity style={styles.addButton} onPress={handleAddOrientadora}>
                            <Text style={styles.buttonText}>Adicionar Orientador</Text>
                        </TouchableOpacity>
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
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 20, // Espaço no topo e na base
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#00008B',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 40,
        width: '48%',
    },
    infoDescricao: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
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
    descricao: {
        fontSize: 14,
        color: '#777',
    },
    editIcon: {
        marginLeft: 10,
    },
    deleteIcon: {
        marginLeft: 15,
    },
    actionIcons: {
        flexDirection: 'row',
    },
    editableCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: "100%",
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
    textInput: {
        borderColor: '#00008B',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        color: '#333',
        fontSize: 14, // Define um tamanho fixo para o texto
        height: 40, // Altura fixa para evitar o crescimento/redução
        width: "100%",
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
    loadingText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default OrientadoresScreen;

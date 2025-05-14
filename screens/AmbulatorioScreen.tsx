import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert, FlatList } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

// Interfaces
interface Contact {
    email: string;
    image: string;
    titulo: string;
    telefone: string;
    instagram: string;
}

interface Coordinator {
    nome: string;
    cargo: string;
    horario: string;
    instagram: string;
    image: string;
}

interface VaccineData {
    lista: string[];
    titulo: string;
    observacao: string;
}

interface LGBTContent {
    titulo: string;
    descricao: string;
    instagram: string;
    image: string;
}

interface AmbulatorioContent {
    id: number;
    content: {
        contato: Contact;
        vacinas: VaccineData;
        secretario: Coordinator;
        coordenadora: Coordinator;
        ambulatório_lgbt: LGBTContent;
    };
}

// Componente principal
const AmbulatorioScreen: React.FC = () => {
    const [ambulatorioData, setAmbulatorioData] = useState<AmbulatorioContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingContent, setEditingContent] = useState<Contact | Coordinator | VaccineData | LGBTContent | null>(null);

    const { isAdmin } = useAdmin();

    const [currentEditing, setCurrentEditing] = useState<string | null>(null);


    // Funções para abrir links, email e Instagram
    const openLink = (url: string) => Linking.openURL(url);
    const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);
    const openInstagram = (instagram: string) => Linking.openURL(`https://www.instagram.com/${instagram}`);

    // Buscar dados do Supabase
    const fetchAmbulatorioData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('ambulatorio_content').select('*').eq('id', 1).single();

        if (error) {
            console.error('Erro ao buscar dados:', error.message);
            Alert.alert('Erro', 'Não foi possível carregar os dados.');
        } else {
            setAmbulatorioData(data);
        }
        setLoading(false);
    };

    // Salvar alterações
    const handleSave = async () => {
        if (!editingContent || !ambulatorioData) return;

        const updatedContent = { ...ambulatorioData.content };

        if ('titulo' in editingContent && 'telefone' in editingContent) {
            updatedContent.contato = editingContent as Contact;
        } else if ('cargo' in editingContent) {
            if ((editingContent as Coordinator).cargo.includes('Secretário')) {
                updatedContent.secretario = editingContent as Coordinator;
            } else {
                updatedContent.coordenadora = editingContent as Coordinator;
            }
        } else if ('lista' in editingContent) {
            updatedContent.vacinas = editingContent as VaccineData;
        } else if ('descricao' in editingContent) {
            updatedContent.ambulatório_lgbt = editingContent as LGBTContent;
        }

        const { error } = await supabase
            .from('ambulatorio_content')
            .update({ content: updatedContent })
            .eq('id', ambulatorioData.id);

        if (error) {
            console.error('Erro ao salvar alterações:', error.message);
            Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        } else {
            Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
            setEditingContent(null);
            fetchAmbulatorioData();
        }
    };

    // Alterar imagem
    const handleImageChange = async () => {
        if (!editingContent || !('image' in editingContent)) return;

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

            setEditingContent((prev) =>
                prev && 'image' in prev ? { ...prev, image: publicUrl } : prev
            );
        } catch (error) {
            console.error('Erro ao alterar imagem:', error);
            Alert.alert('Erro', 'Ocorreu um problema ao alterar a imagem.');
        }
    };


    useEffect(() => {
        fetchAmbulatorioData();
    }, []);

    // Renderização
    return (
        <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
            <View style={styles.darkOverlay} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Ambulatório</Text>

                {loading ? (
                    <Text style={styles.loadingText}>Carregando...</Text>
                ) : (
                    <>
                        {/* Card de Contato */}
                        {editingContent && 'telefone' in editingContent ? (
                            <View style={styles.editableCard}>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.titulo}
                                    onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, titulo: text })}
                                    placeholder="Título"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.telefone}
                                    onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, telefone: text })}
                                    placeholder="Telefone"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.instagram}
                                    onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, instagram: text })}
                                    placeholder="Instagram"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.email}
                                    onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, email: text })}
                                    placeholder="E-mail"
                                />
                                <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
                                    <Text style={styles.buttonText}>Alterar Imagem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingContent(null)}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.contactCard}>
                                <Image source={{ uri: ambulatorioData?.content.contato.image }} style={styles.cardImage} />
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactTitle}>{ambulatorioData?.content.contato.titulo}</Text>
                                    <View style={styles.contactRow}>
                                        <MaterialIcons name="phone" size={20} color="#00008B" style={styles.icon} />
                                        <Text style={styles.contactText}>{ambulatorioData?.content.contato.telefone}</Text>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                                        <TouchableOpacity
                                            onPress={() => openInstagram(ambulatorioData?.content.contato.instagram || '')}>
                                            <Text style={styles.link}>@{ambulatorioData?.content.contato.instagram}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                                        <TouchableOpacity onPress={() => openEmail(ambulatorioData?.content.contato.email || '')}>
                                            <Text style={styles.link}>{ambulatorioData?.content.contato.email}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={styles.editIcon}
                                        onPress={() => setEditingContent(ambulatorioData?.content?.contato || null)}>
                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Coordenadora */}
                        {editingContent && currentEditing === 'coordenadora' && 'cargo' in editingContent ? (
                            <View style={styles.editableCard}>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.nome}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'nome' in prev ? { ...prev, nome: text } : prev
                                        )
                                    }
                                    placeholder="Nome"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.cargo}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'cargo' in prev ? { ...prev, cargo: text } : prev
                                        )
                                    }
                                    placeholder="Cargo"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.horario}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'horario' in prev ? { ...prev, horario: text } : prev
                                        )
                                    }
                                    placeholder="Horário"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.instagram}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'instagram' in prev ? { ...prev, instagram: text } : prev
                                        )
                                    }
                                    placeholder="Instagram"
                                />
                                <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
                                    <Text style={styles.buttonText}>Alterar Imagem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingContent(null);
                                        setCurrentEditing(null);
                                    }}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.coordinatorCard}>
                                <Image source={{ uri: ambulatorioData?.content.coordenadora.image }} style={styles.cardImage} />
                                <View style={styles.coordinatorInfo}>
                                    <Text style={styles.coordinatorTitle}>{ambulatorioData?.content.coordenadora.nome}</Text>
                                    <Text style={styles.coordinatorSubtitle}>{ambulatorioData?.content.coordenadora.cargo}</Text>
                                    <Text style={styles.coordinatorSubtitle}>{ambulatorioData?.content.coordenadora.horario}</Text>
                                    <View style={styles.contactRow}>
                                        <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                                        <TouchableOpacity
                                            onPress={() =>
                                                openInstagram(ambulatorioData?.content.coordenadora.instagram || '')}>
                                            <Text style={styles.link}>@{ambulatorioData?.content.coordenadora.instagram}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={styles.editIcon}
                                        onPress={() => {
                                            setEditingContent(ambulatorioData?.content?.coordenadora || null);
                                            setCurrentEditing('coordenadora');
                                        }}>
                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Secretário */}
                        {editingContent && currentEditing === 'secretario' && 'cargo' in editingContent ? (
                            <View style={styles.editableCard}>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.nome}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'nome' in prev ? { ...prev, nome: text } : prev
                                        )
                                    }
                                    placeholder="Nome"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.cargo}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'cargo' in prev ? { ...prev, cargo: text } : prev
                                        )
                                    }
                                    placeholder="Cargo"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.horario}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'horario' in prev ? { ...prev, horario: text } : prev
                                        )
                                    }
                                    placeholder="Horário"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.instagram}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'instagram' in prev ? { ...prev, instagram: text } : prev
                                        )
                                    }
                                    placeholder="Instagram"
                                />
                                <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
                                    <Text style={styles.buttonText}>Alterar Imagem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingContent(null);
                                        setCurrentEditing(null);
                                    }}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.coordinatorCard}>
                                <Image source={{ uri: ambulatorioData?.content.secretario.image }} style={styles.cardImage} />
                                <View style={styles.coordinatorInfo}>
                                    <Text style={styles.coordinatorTitle}>{ambulatorioData?.content.secretario.nome}</Text>
                                    <Text style={styles.coordinatorSubtitle}>{ambulatorioData?.content.secretario.cargo}</Text>
                                    <Text style={styles.coordinatorSubtitle}>{ambulatorioData?.content.secretario.horario}</Text>
                                    <View style={styles.contactRow}>
                                        <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                                        <TouchableOpacity
                                            onPress={() => openInstagram(ambulatorioData?.content.secretario.instagram || '')}>
                                            <Text style={styles.link}>@{ambulatorioData?.content.secretario.instagram}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={styles.editIcon}
                                        onPress={() => {
                                            setEditingContent(ambulatorioData?.content?.secretario || null);
                                            setCurrentEditing('secretario');
                                        }}>
                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}


                        <View style={styles.serviceRow}>
                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Fomentado pela Residência Multiprofissional em Atenção Básica, Saúde da Família e Comunidade.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Oferece diversos serviços de saúde GRATUITOS para a comunidade.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.infoHeader}>
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceText}>
                                    Atendimentos:
                                    <Text style={styles.attendanceList}>
                                        {'\n\n'}Fisioterapia, nutrição, psicologia, exame preventivo do colo uterino, frenectomia, sala de vacinação, inserção de DIU e práticas integrativas e complementares.
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.serviceRow}>
                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        O que levar: RG, CPF, comprovante de residência e cartão SUS. {'\n\n'}Frenectomia: Certidão de nascimento, comprovante de residência e cartão SUS.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Atendimentos às terças e quintas, a partir das 18h, mediante agendamento pelo telefone ou presencial.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.infoHeader}>
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceText}>
                                    ATENDIMENTO PARA OS ALUNOS:
                                    <Text style={styles.attendanceList}>
                                        {'\n\n'}Ei você, aluno da FAEN, sabia que você pode utilizar esses serviços? Basta entrar em contato com o ambulatório. Todos os serviços são gratuitos, precisou? Usou.
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        {/* Card de Vacinas */}
                        {editingContent && currentEditing === 'vacinas' && 'lista' in editingContent ? (
                            <View style={styles.editableCard}>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.titulo}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) => prev && { ...prev, titulo: text })
                                    }
                                    placeholder="Título"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.observacao}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) => prev && { ...prev, observacao: text })
                                    }
                                    placeholder="Observação"
                                />
                                <Text style={styles.subtitle}>Lista de Vacinas:</Text>
                                {editingContent.lista.map((item, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <TextInput
                                            style={[styles.textInput, styles.listInput]}
                                            value={item}
                                            onChangeText={(text) =>
                                                setEditingContent((prev) => {
                                                    if (prev && 'lista' in prev) {
                                                        const updatedList = [...prev.lista];
                                                        updatedList[index] = text;
                                                        return { ...prev, lista: updatedList };
                                                    }
                                                    return prev;
                                                })
                                            }
                                            placeholder={`Vacina ${index + 1}`}
                                        />
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() =>
                                                setEditingContent((prev) => {
                                                    if (prev && 'lista' in prev) {
                                                        const updatedList = prev.lista.filter((_, i) => i !== index);
                                                        return { ...prev, lista: updatedList };
                                                    }
                                                    return prev;
                                                })
                                            }
                                        >
                                            <Text style={styles.deleteText}>Remover</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() =>
                                        setEditingContent((prev) => {
                                            if (prev && 'lista' in prev) {
                                                const updatedList = [...prev.lista, ''];
                                                return { ...prev, lista: updatedList };
                                            }
                                            return prev;
                                        })
                                    }
                                >
                                    <Text style={styles.buttonText}>Adicionar Vacina</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingContent(null);
                                        setCurrentEditing(null);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.cardContainer}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.title}>{ambulatorioData?.content.vacinas.titulo}</Text>
                                    <FlatList
                                        data={ambulatorioData?.content.vacinas.lista || []}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item }) => (
                                            <View style={styles.vaccineItem}>
                                                <View style={styles.infoCircle}></View>
                                                <Text style={styles.vaccineText}>{item}</Text>
                                            </View>
                                        )}
                                        numColumns={2}
                                        columnWrapperStyle={styles.columnWrapper}
                                        scrollEnabled={false}
                                    />
                                    <Text style={styles.footer}>{ambulatorioData?.content.vacinas.observacao}</Text>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={styles.editIcon}
                                        onPress={() => {
                                            setEditingContent(ambulatorioData?.content?.vacinas || null);
                                            setCurrentEditing('vacinas');
                                        }}
                                    >
                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}


                        {/* Card de Ambulatório LGBT */}
                        {editingContent && currentEditing === 'ambulatório_lgbt' && 'descricao' in editingContent ? (
                            <View style={styles.editableCard}>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.titulo}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'titulo' in prev ? { ...prev, titulo: text } : prev
                                        )
                                    }
                                    placeholder="Título"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.descricao}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'descricao' in prev ? { ...prev, descricao: text } : prev
                                        )
                                    }
                                    placeholder="Descrição"
                                />
                                <TextInput
                                    style={styles.textInput}
                                    value={editingContent.instagram}
                                    onChangeText={(text) =>
                                        setEditingContent((prev) =>
                                            prev && 'instagram' in prev ? { ...prev, instagram: text } : prev
                                        )
                                    }
                                    placeholder="Instagram"
                                />
                                <TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}>
                                    <Text style={styles.buttonText}>Alterar Imagem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingContent(null);
                                        setCurrentEditing(null);
                                    }}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.coordinatorCard}>
                                <Image source={{ uri: ambulatorioData?.content.ambulatório_lgbt.image }} style={styles.cardImage} />
                                <View style={styles.coordinatorInfo}>
                                    <Text style={styles.coordinatorTitle}>{ambulatorioData?.content.ambulatório_lgbt.titulo}</Text>
                                    <Text style={styles.coordinatorSubtitle}>{ambulatorioData?.content.ambulatório_lgbt.descricao}</Text>
                                    <View style={styles.contactRow}>
                                        <FontAwesome name="instagram" size={20} color="#00008B" style={styles.icon} />
                                        <TouchableOpacity
                                            onPress={() =>
                                                openInstagram(ambulatorioData?.content.ambulatório_lgbt.instagram || '')
                                            }>
                                            <Text style={styles.link}>@{ambulatorioData?.content.ambulatório_lgbt.instagram}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={styles.editIcon}
                                        onPress={() => {
                                            setEditingContent(ambulatorioData?.content?.ambulatório_lgbt || null);
                                            setCurrentEditing('ambulatório_lgbt');
                                        }}>
                                        <FontAwesome name="pencil" size={24} color="#00008B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}


                        <View style={styles.serviceRow}>
                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Também conhecido como: Centro de Cuidado e Formação Interprofissional em Saúde da População LGBTI+.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Oferta atendimentos de diversas especialidades de saúde, educação em saúde, formações e eventos culturais voltados ao público LGBTI+.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.serviceRow}>
                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Para primeiro atendimento, levar: RG, CPF, comprovante de residência e cartão SUS.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.serviceCard}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                    <View style={styles.infoCircle} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceText}>
                                        Atendimentos quinzenais, a partir das 18h, por demanda livre.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.infoHeader}>
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                                <View style={styles.infoCircle} />
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceText}>
                                    Atendimentos:
                                    <Text style={styles.attendanceList}>
                                        {'\n\n'}Fisioterapia, nutrição, psicologia, médico, sala de vacinação; enfermagem, serviço social e práticas integrativas e complementares. Além de testes rápidos e coleta de preventivo.
                                    </Text>
                                </Text>
                            </View>
                        </View>
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
    editableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00008B',
        textAlign: 'center',
        marginBottom: 20,
    },
    contactCard: {
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
        position: 'relative',
    },
    coordinatorCard: {
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
        position: 'relative',
    },
    cardContainer: {
        backgroundColor: '#f0f8ff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
        position: 'relative',
    },
    cardContent: {
        position: 'relative',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#00008B',
    },    
    vaccineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        flex: 1,
    },
    vaccineText: {
        fontSize: 16,
        color: '#333',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    footer: {
        marginTop: 20,
        fontSize: 14,
        color: '#00008B',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    listInput: {
        flex: 1,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 5,
        borderRadius: 5,
    },
    deleteText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },    
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
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
    contactText: {
        fontSize: 16,
        color: '#333',
    },
    link: {
        fontSize: 16,
        color: '#1E90FF',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    coordinatorInfo: {
        flex: 1,
    },
    coordinatorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00008B',
        marginBottom: 5,
    },
    coordinatorSubtitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    serviceCard: {
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 2,
        borderColor: '#00008B',
        flex: 1,
        marginHorizontal: 5,
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
        marginRight: 10,
        alignSelf: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    attendanceList: {
        fontWeight: 'bold',
        color: '#00008B',
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
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    loadingText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        marginTop: 20,
    },
});


export default AmbulatorioScreen;
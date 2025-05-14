import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ImageBackground, ScrollView, Image, TextInput, Alert, } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/app/lib/AdminContext';

type BibliotecaContentData = {
    titulo: string | null; // Título interno do conteúdo
    descricao: string | null;
    email: string | null;
    image: string | null; // URL da imagem
    link: string | null;  // Link principal
};

type StaticCardItem = {
    descricao: string;
    link?: string | null;        // Link opcional
    linkText?: string | null;    // Texto do botão do link opcional
    isFullWidth?: boolean | null; // Opcional para largura total
    isSpecialInfo?: boolean | null; // Opcional para estilo de texto especial
    centerContent?: boolean | null; // Opcional para centralizar conteúdo
};

// Descreve a estrutura da linha inteira retornada do Supabase
type BibliotecaEntry = {
    id: number; // Ou o tipo do seu ID
    titulo: string; // O título principal da linha/seção ('Biblioteca Central')
    content: BibliotecaContentData; // O objeto JSONB
    created_at: string;
    updated_at: string;
};


const informacoes: StaticCardItem[] = [

    {
        descricao: 'Cadastre-se no sistema SIB - UERN para ter acesso a livros físicos e virtuais. Nesse link você também pode solicitar o Nada Consta.',
        link: 'https://portal.uern.br/dsib/servicos-online/'
    },
    {
        descricao: 'Empréstimo: Alunos: até 3 (três) títulos, pelo período máximo de 14 (quatorze dias).',
        centerContent: true
    },
];

const novosCards: StaticCardItem[] = [
    { descricao: 'Direito de fazer até 3 (três) reservas. E até 3 (três) renovações do exemplar, desde que não haja reserva.' },
    { descricao: 'Oferece mini cursos de ABNT (agendar pelo e-mail), ferramentas de fichas catalográficas, além de realizar campanhas.' },
    {
        descricao: 'Acesso ao atendimento do sistema integrado de bibliotecas da UERN.',
        link: 'https://portal.uern.br/dsib/atendimento-on-line/',
        linkText: 'Saber Mais',
        centerContent: true
    },
    {
        descricao: 'Nesse link você pode Consultar o Acervo Físico disponível, acessar a Área do usuário, visualizar seus empréstimos e renová-los online.',
        link: 'http://siabi.uern.br/',
        linkText: 'Saber Mais'
    },
    {
        descricao: 'Clique aqui e confira os serviços oferecidos pela UpToDate.\n\nObs: O primeiro acesso (cadastro) deve ser feito em um computador conectado a rede cabeada da UERN e utilizar o e-mail institucional.',
        link: 'https://www.wolterskluwer.com/en/solutions/uptodate',
        linkText: 'Ver Detalhes',
        isFullWidth: true,
        isSpecialInfo: true
    },
    {
        descricao: 'Clique aqui e confira a Biblioteca Virtual da UERN! (Você precisa estar cadastrado no sistema SIB-UERN e após confirmação via e-mail, será informado seu login e senha, depois do primeiro acesso você pode mudá-los).',
        isFullWidth: true,
        link: 'https://plataforma.bvirtual.com.br/Account/Login '
    },
    {
        descricao: "Agora você pode acessar o Portal de Periódicos CAPES e explorar todo o conteúdo da Rede CAFe integralmente.\n📌 Como fazer seu primeiro acesso?\n1️⃣ Acesse: dinf-conta.apps.uern.br\n2️⃣ No campo Login, digite seu e-mail institucional;\n3️⃣ No campo E-mail, repita o mesmo e-mail institucional;\n4️⃣ Siga as instruções enviadas por e-mail para ativar e trocar sua senha;\n5️⃣ Pronto!",
        link: 'https://www.periodicos.capes.gov.br/',
        isFullWidth: true,
        linkText: 'Ver Detalhes no Portal CAPES',
        isSpecialInfo: true
    },
    { descricao: 'Em Breve...', isFullWidth: true },
];

const BibliotecaScreen: React.FC = () => {
    const [bibliotecaData, setBibliotecaData] = useState<BibliotecaEntry | null>(null); // Guarda os dados da biblioteca
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState<BibliotecaContentData | null>(null); // Guarda os dados *durante* a edição

    const { isAdmin } = useAdmin();

    // Dentro do componente BibliotecaScreen

    const openLink = async (url: string | null | undefined) => { // Aceita undefined também
        // ----> MODIFICAÇÃO AQUI <----
        if (typeof url === 'string' && url.trim() !== '') { // Verifica se é string e não vazia
            try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                    await Linking.openURL(url);
                } else {
                    Alert.alert("Erro", `Não foi possível abrir este URL: ${url}`);
                }
            } catch (error) {
                console.error("Erro ao tentar abrir o link:", error);
                Alert.alert("Erro", "Ocorreu um problema ao tentar abrir o link.");
            }
        } else {
            // Opcional: Log ou Alert se o link for inválido ou ausente
            console.warn("Tentativa de abrir link inválido ou ausente:", url);
            // Alert.alert("Aviso", "Nenhum link válido para abrir.");
        }
    };

    const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);
    const openInstagram = (instagram: string) => Linking.openURL(`https://www.instagram.com/${instagram}`);

    // --- FUNÇÃO DE BUSCA ATUALIZADA --
    const fetchBibliotecaData = async () => {
        setLoading(true);
        try {
            // Busca da tabela 'biblioteca_content', especificamente a linha 'Biblioteca Central'
            const { data, error } = await supabase
                .from('biblioteca_content')
                .select('*')
                .eq('titulo', 'Biblioteca Central') // Filtra pela linha correta
                .single(); // Espera apenas um resultado

            if (error) {
                console.error('Erro ao buscar dados da biblioteca:', error.message);
                Alert.alert('Erro', 'Não foi possível carregar os dados da biblioteca.');
            } else if (data) {
                setBibliotecaData(data as BibliotecaEntry); // Define os dados no estado
            } else {
                console.warn("Nenhum dado encontrado para 'Biblioteca Central'");
                // Opcional: Tratar caso a linha não exista
            }
        } catch (err) {
            console.error('Erro inesperado ao buscar dados da biblioteca:', err);
            Alert.alert('Erro', 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // 1. Verifica se estamos editando e se temos dados para salvar
        if (!isEditing || !editingContent || !bibliotecaData) { // Adicionado !isEditing
            console.warn("Tentativa de salvar sem estar em modo de edição ou sem dados válidos.");
            handleDiscardChanges(); // Cancela a edição
            return;
        }

        setLoading(true); // Mostra loading
        try {
            // 2. Envia o UPDATE para o Supabase
            const { error } = await supabase
                .from('biblioteca_content')
                .update({ content: editingContent }) // <- ENVIA O JSON EDITAD
                .eq('id', bibliotecaData.id);     // <- IDENTIFICA A LINHA PELO ID

            setLoading(false); // Esconde loading após a tentativa

            // 3. Verifica se houve erro na operação do Supabase
            if (error) {
                console.error('Erro ao salvar alterações no Supabase:', error.message);
                // Verifica se o erro é de permissão (RLS)
                if (error.message.includes('violates row-level security policy')) {
                    Alert.alert('Erro de Permissão', 'Você não tem permissão para alterar estes dados. Verifique se está logado como admin.');
                } else {
                    Alert.alert('Erro', 'Não foi possível salvar as alterações no banco de dados.');
                }
                // IMPORTANTE: Não atualiza o estado local se deu erro!
            } else {
                // 4. SUCESSO! Atualiza o estado local e avisa o usuário
                Alert.alert('Sucesso', 'Alterações salvas com sucesso!');

                // Atualiza o estado principal 'bibliotecaData' com os dados que foram salvos
                // É crucial fazer isso para a UI refletir o dado persistido
                setBibliotecaData(prevData => prevData ? { ...prevData, content: editingContent } : null);

                // Sai do modo de edição e limpa o estado de edição
                handleDiscardChanges();
            }
        } catch (err) {
            // Erro inesperado na execução do try/catch (ex: problema de rede)
            setLoading(false); // Garante que o loading para
            console.error('Erro inesperado durante o salvamento:', err);
            Alert.alert('Erro Inesperado', 'Ocorreu um problema ao tentar salvar as alterações.');
        }
    };

    // Função handleDiscardChanges (para garantir que está correta)
    const handleDiscardChanges = () => {
        setIsEditing(false);
        setEditingContent(null);
    };

    // --- FUNÇÃO DE MUDAR IMAGEM ATUALIZADA ---
    const handleImageChange = async () => {
        if (!editingContent) return; // Precisa estar editando

        try {
            const result = await ImagePicker.launchImageLibraryAsync({ /* ... opções ... */ });
            if (result.canceled || !result.assets) { return; }

            const img = result.assets[0];
            // --- Lógica de Upload (EXISTENTE - Ok) ---
            const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
            const filePath = `${Date.now()}-${img.uri.split('/').pop()}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, decode(base64), { contentType: img.type });
            if (uploadError) { /* ... handle error ... */ return; }
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            const publicUrl = data?.publicUrl || '';
            if (!publicUrl) { /* ... handle error ... */ return; }
            // --- Fim Lógica de Upload ---

            // Atualiza APENAS o estado de EDIÇÃO
            setEditingContent({ ...editingContent, image: publicUrl });
            // O botão Salvar agora enviará este `editingContent` atualizado para o Supabase

        } catch (error) {
            console.error('Erro ao alterar imagem:', error);
            Alert.alert('Erro', 'Ocorreu um problema ao alterar a imagem.');
        }
    };

    // --- Função para INICIAR a edição --
    const handleEdit = () => {
        if (!bibliotecaData) return; // Não pode editar se não houver dados
        // Cria uma cópia profunda para edição segura
        setEditingContent(JSON.parse(JSON.stringify(bibliotecaData.content || {})));
        setIsEditing(true); // Entra no modo de edição
    };

    useEffect(() => {
        fetchBibliotecaData();
    }, []);

    // --- Bloco return ATUALIZADO (Com Conteúdo Estático Restaurado) ---
    return (
        <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
            <View style={styles.darkOverlay} />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Título da Tela (Puxa do DB ou usa 'Biblioteca') */}
                <Text style={styles.title}>{bibliotecaData?.titulo || 'Biblioteca'}</Text>

                {loading ? (
                    <Text style={styles.loadingText}>Carregando...</Text>
                ) : (
                    <>
                        {/* --- Card Principal da Biblioteca (Dinâmico) --- */}
                        {isEditing ? (
                            // -- MODO EDIÇÃO (Como na última correção, sem espaços extras) --
                            <View style={styles.editableCard}><Text style={styles.editLabel}>Editar Conteúdo da Biblioteca</Text><TextInput style={styles.textInput} value={editingContent?.titulo || ''} onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, titulo: text || null })} placeholder="Título Interno (opcional)" /><TextInput style={[styles.textInput, styles.textArea]} value={editingContent?.descricao || ''} onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, descricao: text || null })} placeholder="Descrição da Biblioteca" multiline={true} /><TextInput style={styles.textInput} value={editingContent?.email || ''} onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, email: text || null })} placeholder="E-mail de Contato" keyboardType="email-address" /><TextInput style={styles.textInput} value={editingContent?.link || ''} onChangeText={(text) => setEditingContent((prev) => prev && { ...prev, link: text || null })} placeholder="Link Principal (Site, etc.)" keyboardType="url" />{editingContent?.image && (<Image source={{ uri: editingContent.image }} style={styles.cardImagePreview} />)}<TouchableOpacity style={styles.changeImageButton} onPress={handleImageChange}><Text style={styles.buttonText}>{editingContent?.image ? 'Alterar' : 'Adicionar'} Imagem</Text></TouchableOpacity><View style={styles.buttonContainer}><TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity><TouchableOpacity style={styles.cancelButton} onPress={handleDiscardChanges}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity></View></View>
                        ) : (
                            // ===== MODO DE VISUALIZAÇÃO (IMAGEM | INFO) - SEM ESPAÇOS EXTRAS =====
                            <>{bibliotecaData ? (<View style={styles.viewCard}>
                                <View style={styles.infoHeader}><View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} /></View>
                                <View style={styles.contentRow}>{/* Início da linha Imagem|Info */}
                                    {bibliotecaData.content.image && (<Image source={{ uri: bibliotecaData.content.image }} style={styles.sideCircularImage} />)}
                                    <View style={styles.infoContainer}>{/* Início container da Info */}
                                        {bibliotecaData.content.titulo && (<Text style={styles.contentTitleSide}>{bibliotecaData.content.titulo}</Text>)}
                                        {bibliotecaData.content.descricao && (<Text style={styles.descriptionTextSide}>{bibliotecaData.content.descricao}</Text>)}
                                        {bibliotecaData.content.email && (
                                            <View style={[styles.contactRow, { alignSelf: 'flex-start' }]}>
                                                <MaterialIcons name="email" size={20} color="#00008B" style={styles.icon} />
                                                <TouchableOpacity onPress={() => openEmail(bibliotecaData.content.email!)}><Text style={styles.link}>{bibliotecaData.content.email}</Text></TouchableOpacity>
                                            </View>
                                        )}
                                        {bibliotecaData.content.link && (
                                            <TouchableOpacity style={[styles.linkButton, { alignSelf: 'flex-start' }]} onPress={() => openLink(bibliotecaData.content.link!)}>
                                                <Ionicons name="open-outline" size={20} color="#FFF" style={styles.icon} />
                                                <Text style={styles.linkButtonText}>Acessar Site</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>{/* Fim container da Info */}
                                </View>{/* Fim da linha Imagem|Info */}
                                {isAdmin && (<TouchableOpacity style={styles.editIconAbsolute} onPress={handleEdit}><FontAwesome name="pencil" size={24} color="#00008B" /></TouchableOpacity>)}
                            </View> // Fim viewCard
                            ) : (<Text style={styles.loadingText}>Dados da biblioteca não encontrados.</Text>)}</> // Fim do fragment de visualização
                        )}
                        {/* --- Fim Card Biblioteca --- */}
                        {/* --- Conteúdo Estático --- */}
                        {/* Título para a primeira seção estática (Opcional, manter comentado) */}
                        {/* Primeira leva de cards estáticos (informacoes) */}
                        <View style={styles.informacaoContainer}>{/* Container Informacoes */}
                            {informacoes.map((infoItem, idx) => (
                                <View key={`info-${idx}`} style={[styles.infoCard, infoItem.isFullWidth && styles.fullWidthCard]}>
                                    <View style={styles.infoHeader}><View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} /></View>
                                    {/* ----> NOVO VIEW INTERNO COM ESTILO CONDICIONAL <---- */}
                                    <View style={[styles.cardContentWrapper, infoItem.centerContent && styles.cardContentCentered]}>
                                        <Text style={infoItem.isSpecialInfo ? styles.specialInfoText : styles.infoText}>
                                            {infoItem.descricao}
                                        </Text>
                                        {infoItem.link && (
                                            <TouchableOpacity
                                                style={[styles.staticLinkButton, { marginTop: 15 }]} // Adiciona mais margem
                                                onPress={() => openLink(infoItem.link)}
                                            >
                                                <Ionicons name="open-outline" size={18} color="#FFF" style={styles.icon} />
                                                <Text style={styles.staticLinkButtonText}>{infoItem.linkText || 'Saber Mais'}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {/* ----> FIM DO NOVO VIEW INTERNO <---- */}
                                </View>
                            ))}
                        </View>{/* Fim Container Informacoes */}
                        {/* Título para a segunda seção estática (Opcional, manter comentado) */}
                        {/* Segunda leva de cards estáticos (novosCards) */}
                        <View style={styles.informacaoContainer}>
                            {novosCards.map((card, idx) => (
                                <View key={`newcard-${idx}`} style={[styles.infoCard, card.isFullWidth && styles.fullWidthCard]}>
                                    <View style={styles.infoHeader}><View style={styles.infoCircle} /><View style={styles.infoCircle} /><View style={styles.infoCircle} /></View>
                                    {/* ----> NOVO VIEW INTERNO COM ESTILO CONDICIONAL <---- */}
                                    <View style={[styles.cardContentWrapper, card.centerContent && styles.cardContentCentered]}>
                                        <Text style={card.isSpecialInfo ? styles.specialInfoText : styles.infoText}>
                                            {card.descricao}
                                        </Text>
                                        {card.link && (
                                            <TouchableOpacity
                                                style={[styles.staticLinkButton, { marginTop: 15 }]}
                                                onPress={() => openLink(card.link)}
                                            >
                                                <Ionicons name="open-outline" size={18} color="#FFF" style={styles.icon} />
                                                <Text style={styles.staticLinkButtonText}>{card.linkText || 'Ver Detalhes'}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {/* ----> FIM DO NOVO VIEW INTERNO <---- */}
                                </View>
                            ))}
                        </View>
                        {/* --- Fim Conteúdo Estático --- */}
                    </> // Fim do Fragment geral após loading
                )}
            </ScrollView>
        </ImageBackground>
    );
}; // Fim do Componente


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
        alignSelf: 'center', // <-- Centraliza esta linha horizontalmente
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
        alignContent: 'center',
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
    // Estilos específicos da Biblioteca
    viewCard: { // Estilo para o card no modo visualização
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 2,
        borderColor: '#00008B',
        position: 'relative', // Para posicionar o ícone de editar
    },
    cardImagePreview: { // Imagem menor no modo edição
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'center',
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center', // Mantém texto centralizado
        lineHeight: 22,
        marginBottom: 20,
        // Não precisa de alignSelf aqui se ocupa a largura toda
    },
    contentTitleSide: { // Título quando está na lateral
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00008B',
        marginBottom: 5, // Menos margem
        textAlign: 'left', // Alinha à esquerda
    },
    descriptionTextSide: { // Descrição quando está na lateral
        fontSize: 16,
        color: '#333',
        textAlign: 'left', // Alinha à esquerda
        lineHeight: 22,
        marginBottom: 10,
    },
    linkButton: { // Botão para o link principal
        flexDirection: 'row',
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    linkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    editLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 3, marginTop: 8 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }, // Espaço entre botões
    editIconAbsolute: { // Ícone de lápis para o card da biblioteca
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        zIndex: 1, // Garante que fique por cima
    },
    // --- NOVOS Estilos para Layout Lado-a-Lado ---
    contentRow: {
        flexDirection: 'row', // Coloca imagem e info lado a lado
        alignItems: 'flex-start', // Alinha itens no topo da linha
    },
    sideImage: { // Estilo para a imagem quando está na lateral
        width: 100,       // Largura desejada
        height: 120,      // Altura desejada
        borderRadius: 8,
        marginRight: 15,   // Espaço entre imagem e texto
        resizeMode: 'cover',
    },
    sideCircularImage: { // Imagem na lateral, circular
        width: 80,          // Tamanho desejado
        height: 80,
        borderRadius: 40,    // Metade da largura/altura
        marginRight: 15,     // Espaço à direita da imagem
        borderWidth: 1,
        borderColor: '#ddd',
    },
    infoContainer: { // Container para toda a informação textual à direita
        flex: 1,          // Ocupa o espaço restante
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00008B',
        textAlign: 'center',
        marginBottom: 10,
        // alignSelf: 'center', // Opcional, adicione se necessário
    },
    centeredCircularImage: { // Estilo para Imagem Redonda e Centralizada
        width: 100,         // Tamanho desejado
        height: 100,
        borderRadius: 50,    // Metade da largura/altura para ser círculo
        marginBottom: 15,   // Espaço abaixo da imagem
        borderWidth: 1,     // Borda opcional
        borderColor: '#ddd',
    },
    contactsContainer: { // Container para alinhar email/link
        width: '100%',       // Ocupa a largura do card
        // alignItems: 'center', // Centraliza os itens se necessário
    },
    // --- Estilos para os Links nos Cards Estáticos ---
    staticLinkButton: { // Estilo similar ao linkButton, mas talvez menor/diferente cor
        flexDirection: 'row',
        backgroundColor: '#6c757d', // Cinza escuro, por exemplo
        paddingVertical: 6,         // Um pouco menor
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',     // Centraliza o botão no card
        marginTop: 12,           // Espaço acima do botão
    },
    staticLinkButtonText: {
        color: '#fff',
        fontSize: 14,           // Fonte um pouco menor
        fontWeight: 'bold',
    },
    specialInfoText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 26,
        paddingBottom: 10,
    },
    cardContentWrapper: {
        flex: 1, // Ocupa o espaço vertical disponível
        justifyContent: 'flex-start', // Alinha o conteúdo (descrição e botão) ao topo por padrão
        // alignItems: 'center', // Descomente se quiser conteúdo textual e botão centralizados horizontalmente
    },
    cardContentCentered: {
        justifyContent: 'center', // Centraliza verticalmente o grupo (texto + botão)
        alignItems: 'center',   // Centraliza horizontalmente o grupo (texto + botão)
    },
});

export default BibliotecaScreen;
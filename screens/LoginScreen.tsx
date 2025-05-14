import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
    Alert,
    BackHandler,
    ToastAndroid,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native'; // Importação para foco na tela
import { RootStackParamList } from '@/app/(tabs)';
import { supabase } from '@/app/lib/supabase';
import { useAdmin } from '@/app/lib/AdminContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

type LoginScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { setIsAdmin } = useAdmin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [backPressedOnce, setBackPressedOnce] = useState(false); // Estado para controlar a primeira pressão no botão "voltar"

    async function handleLogin() {
        if (!email.includes('@')) {
            Alert.alert('Erro', 'Por favor, insira um email válido.');
            return;
        }
        if (password.trim().length < 6) {
            Alert.alert('Erro', 'A senha deve conter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        setLoading(false);
        if (error) {
            Alert.alert('Erro', error.message);
            return;
        }

        const { data: userRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

        setIsAdmin(userRole?.role === 'admin'); // Define o admin no contexto
        setLoading(false);

        navigation.navigate('Home'); // Navega normalmente
    }

    // Função para interceptar o botão "voltar" do celular
    const handleBackPress = () => {
        if (backPressedOnce) {
            BackHandler.exitApp(); // Fecha o aplicativo
        } else {
            setBackPressedOnce(true); // Primeira vez que o botão "voltar" é pressionado
            ToastAndroid.show('Toque novamente para sair', ToastAndroid.SHORT); // Mostra a mensagem
            setTimeout(() => setBackPressedOnce(false), 2000); // Reseta o estado após 2 segundos
        }
        return true; // Intercepta o evento "voltar" padrão
    };

    // Configurar o listener apenas enquanto a tela está focada
    useFocusEffect(
        React.useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => backHandler.remove(); // Remove o listener ao sair da tela
        }, [backPressedOnce])
    );

    return (
        <ImageBackground
            source={require('../assets/images/background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Image
                    source={require('../assets/images/faenuern.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.card}>
                    <Text style={styles.title}>Login</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor="#888"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setPasswordVisible(!passwordVisible)}
                        >
                            <Ionicons
                                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="#888"
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fafafa80',
    },
    logo: {
        width: 300,
        height: 200,
        marginBottom: 20,
        marginLeft: 20,
    },
    card: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        width: '100%',
        maxWidth: 350,
        elevation: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#00008B',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        color: '#333',
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 15,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    button: {
        backgroundColor: '#00008B',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerText: {
        color: '#00008B',
        fontSize: 14,
        marginTop: 15,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;

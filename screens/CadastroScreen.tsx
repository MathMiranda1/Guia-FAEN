import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/(tabs)';
import {supabase} from '../app/lib/supabase'

type CadastroScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Cadastro'>;
};

const CadastroScreen: React.FC<CadastroScreenProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        if (name.trim().length === 0) {
            Alert.alert('Erro', 'Por favor, insira seu nome completo.');
            setLoading(false);
            return;
        }
    
        // Regex para validar o formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erro', 'Por favor, insira um email válido.');
            setLoading(false);
            return;
        }
    
        // Lista de domínios válidos
        const validDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'uol.com.br', 'alu.uern.br', 'uern.br'];

    
        // Verifica o domínio do email
        const emailDomain = email.split('@')[1]; // Obtém o domínio após o "@"
        if (!validDomains.includes(emailDomain)) {
            Alert.alert(
                'Erro',
                `O domínio ${emailDomain} não é permitido. Use um email dos seguintes provedores: ${validDomains.join(
                    ', '
                )}.`
            );
            setLoading(false);
            return;
        }
    
        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }
    
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                },
            },
        });
    
        setLoading(false);
        if (error) {
            if (error.message.includes('User already registered')) {
                Alert.alert('Erro', 'Este email já está em uso. Tente outro.');
            } else {
                Alert.alert('Erro', error.message);
            }
            return;
        }
    
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        navigation.navigate('Login');
    }
    

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ImageBackground
                source={require('../assets/images/background.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView contentContainerStyle={styles.overlay}>
                    <Image
                        source={require('../assets/images/faenuern.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.card}>
                        <Text style={styles.title}>Cadastro</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome Completo"
                            placeholderTextColor="#888"
                            value={name}
                            onChangeText={setName}
                        />
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
                                style={styles.inputPassword}
                                placeholder="Senha"
                                placeholderTextColor="#888"
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setPasswordVisible(!passwordVisible)}
                                style={styles.iconContainer}
                            >
                                <Icon
                                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>Já possui uma conta? Faça Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        marginBottom: 20,
    },
    inputPassword: {
        flex: 1,
        padding: 10,
        color: '#333',
    },
    iconContainer: {
        padding: 10,
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
    loginText: {
        color: '#00008B',
        fontSize: 14,
        marginTop: 15,
    },
});

export default CadastroScreen;

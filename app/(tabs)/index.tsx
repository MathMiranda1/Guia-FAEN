import React from 'react';
import 'react-native-url-polyfill/auto'; // <<< COLOQUE AQUI, BEM NO TOPO!
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '@/screens/HomeScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import EstruturaFaenScreen from '@/screens/EstruturaFaenScreen';
import EstruturaCurricularScreen from '@/screens/EstruturaCurricularScreen';
import ContatosInstitucionaisScreen from '@/screens/ContatosInstitucionaisScreen';
import HorasComplementares from '@/screens/HorasComplementaresScreen';
import Projetos from '@/screens/ProjetosScreen';
import RepresentacaoEstudantil from '@/screens/RepresentacaoEstudantilScreen';
import AtendimentosAuxilios from '@/screens/AtendimentosEAuxiliosScreen';
import PosGraduacoesIntercambios from '@/screens/PosGraduacoesEIntercambiosScreen';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import UERNScreen from '@/screens/UERNScreen';
import CorpoDocente from '@/screens/CorpoDocenteScreen';
import Orientadoras from '@/screens/OrientadoresScreen';
import AmbulatorioScreen from '@/screens/AmbulatorioScreen';
import CadastroScreen from '@/screens/CadastroScreen';
import { AdminProvider } from '@/app/lib/AdminContext';
import SearchScreen from '@/screens/SearchScreen';
import SobreScreen from '@/screens/SobreScreen';
import BibliotecaScreen from '@/screens/BibliotecaScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  HomeTab: undefined; // Nome do Tab Navigator ajustado
  Search: undefined;
  Sobre: undefined;
  Profile: undefined;
  EstruturaFaen: undefined;
  EstruturaCurricular: undefined;
  ContatosInstitucionais: undefined;
  RegimentosSimplificados: undefined;
  CorpoDocente: undefined;
  HorasComplementares: undefined;
  Projetos: undefined;
  RepresentacaoEstudantil: undefined;
  AtendimentosAuxilios: undefined;
  PosGraduacoesIntercambios: undefined;
  UERN: undefined;
  Orientadoras: undefined;
  Ambulatorio: undefined;
  Cadastro: undefined;
  Biblioteca: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Bottom Tab Navigator para Home e Profile
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Sobre') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName!} size={size} color={color} />;
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#00008B',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        tabBarStyle: { backgroundColor: 'white' },
        tabBarActiveTintColor: '#00008B',
        tabBarInactiveTintColor: 'black',
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Início', headerShown: false }}
      />
      <Tab.Screen
        name="Sobre"
        component={SobreScreen}
        options={{ title: 'Sobre' }}

      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Pesquisar' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}


// Stack Navigator principal
export default function App() {
  return (
    <AdminProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#00008B',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      >
        {/* Telas fora da barra inferior */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login', headerShown: false, presentation: 'modal' }}
        />

        {/* Stack chama o Tab Navigator como Home */}
        <Stack.Screen
          name="Home"
          component={HomeTabs} // Nome externo continua Home
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ title: 'Cadastro', headerShown: false, presentation: 'modal' }}
        />

        {/* Telas restantes */}
        <Stack.Screen
          name="EstruturaFaen"
          component={EstruturaFaenScreen}
          options={{ title: 'FAEN' }}
        />
        <Stack.Screen
          name="UERN"
          component={UERNScreen}
          options={{ title: 'UERN' }}
        />
        <Stack.Screen
          name="EstruturaCurricular"
          component={EstruturaCurricularScreen}
          options={{ title: 'Estrutura Curricular e Documentos' }}
        />
        <Stack.Screen
          name="ContatosInstitucionais"
          component={ContatosInstitucionaisScreen}
          options={{ title: 'Contatos Institucionais' }}
        />
        <Stack.Screen
          name="Ambulatorio"
          component={AmbulatorioScreen}
          options={{ title: 'Ambulatório' }}
        />
        <Stack.Screen
          name="CorpoDocente"
          component={CorpoDocente}
          options={{ title: 'Corpo Docente' }}
        />
        <Stack.Screen
          name="Orientadoras"
          component={Orientadoras}
          options={{ title: 'Orientadores Acadêmicos' }}
        />
        <Stack.Screen
          name="Biblioteca"
          component={BibliotecaScreen}
          options={{ title: 'Biblioteca Central' }}
        />
        <Stack.Screen
          name="HorasComplementares"
          component={HorasComplementares}
          options={{ title: 'Atividades Complementares' }}
        />
        <Stack.Screen
          name="Projetos"
          component={Projetos}
          options={{ title: 'Projetos' }}
        />
        <Stack.Screen
          name="RepresentacaoEstudantil"
          component={RepresentacaoEstudantil}
          options={{ title: 'Entidades Estudantis' }}
        />
        <Stack.Screen
          name="AtendimentosAuxilios"
          component={AtendimentosAuxilios}
          options={{ title: 'Atendimentos e Auxílios' }}
        />
        <Stack.Screen
          name="PosGraduacoesIntercambios"
          component={PosGraduacoesIntercambios}
          options={{ title: 'Pós-Graduações e Intercâmbios' }}
        />
      </Stack.Navigator>
    </AdminProvider>
  );
}

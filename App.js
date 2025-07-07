import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { getMessaging, requestPermission, getToken, onMessage } from '@react-native-firebase/messaging';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import { Provider as PaperProvider } from 'react-native-paper';
import PushNotification from 'react-native-push-notification';

import Login from './views/Login';
import CrearCuenta from './views/CrearCuenta';
import CrearMaestraAcc from './views/CrearMaestraAcc';
import LoginMaestra from './views/LoginMaestra';
import Grupos from './views/Grupos';
import AgregarGrupo from './views/AgregarGrupo';
import Grupo from './views/Grupo';
import AgregarTarea from './views/AgregarTarea';
import Tarea from './views/Tarea';
import Entregas from './views/Entregas';
import TareasAlumno from './views/TareasAlumno';
import AgregarArchivo from './views/AgregarArchivo';
import InformacionEntrega from './views/InformacionEntrega';
import PerfilAlumno from './views/PerfilAlumno';
import InfoEntregas from './views/InfoEntregas';
import InfoIndividualEntrega from './views/InfoIndividualEntrega';
import CrearRecordatorio from './views/CrearRecordatorio';
import ActualizarRecordatorio from './views/ActualizarRecordatorio';

PushNotification.createChannel(
  {
    channelId: "recordatorios", // Debe coincidir con el que uses después
    channelName: "Recordatorios",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Canal creado: ${created}`) 
);


const App = () => {
  const messaging = getMessaging();
  useEffect(() => {
    const solicitarPermiso = async () => {
      const status = await requestPermission(messaging);
      if (
        status === 1 || // AUTHORIZED
        status === 2    // PROVISIONAL
      ) {
        const token = await getToken(messaging);
        console.log('Token FCM:', token);
      }
    };
    solicitarPermiso();
  }, []);

  // --- PASO 6: Recibe notificaciones en primer plano ---
  useEffect(() => {
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notificación',
        remoteMessage.notification?.body || 'Tienes una nueva notificación.'
      );
    });
    return unsubscribe;
  }, []);
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name='Login'
            component={Login}
            options={{
              title: "Iniciar Sesión",
              headerShown: false
            }}
          />
          <Stack.Screen
            name='CrearCuenta'
            component={CrearCuenta}
            options={{
              title: "Ingresa tus datos",
              headerStyle: {
                backgroundColor: '#FFA94D'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='CrearMaestraAcc'
            component={CrearMaestraAcc}
            options={{
              title: "Maestro(a), Ingrese sus datos",
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='LoginMaestra'
            component={LoginMaestra}
            options={{
              title: "Altruism Admin",
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='Grupos'
            component={Grupos}
            options={{
              title: "Grupos",
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='AgregarGrupo'
            component={AgregarGrupo}
            options={{
              title: "Nuevo Grupo",
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='Grupo'
            component={Grupo}
            options={({ route }) => ({
              title: route.params.grupo + " " + route.params.nombre,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='AgregarTarea'
            component={AgregarTarea}
            options={({ route }) => ({
              title: "Nueva Tarea",
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='Tarea'
            component={Tarea}
            options={({ route }) => ({
              title: route.params.tarea.titulo,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='Entregas'
            component={Entregas}
            options={({ route }) => ({
              title: route.params.tarea.titulo,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='InformacionEntrega'
            component={InformacionEntrega}
            options={({ route }) => ({
              title: "Entrega de " + route.params.alumnoAutor.nombre,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='InfoEntregas'
            component={InfoEntregas}
            options={({ route }) => ({
              title: "Entregas de " + route.params.alumnoAutor.nombre,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='InfoIndividualEntrega'
            component={InfoIndividualEntrega}
            options={({ route }) => ({
              title: "Entregas de " + route.params.alumnoAutor.nombre,
              headerStyle: {
                backgroundColor: '#AEE9FE'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='TareasAlumno'
            component={TareasAlumno}
            options={{
              title: "Bienvenido",
              headerStyle: {
                backgroundColor: '#FFB86C'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='CrearRecordatorio'
            component={CrearRecordatorio}
            options={{
              title: "Información del recordatorio",
              headerStyle: {
                backgroundColor: '#FFB86C'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='ActualizarRecordatorio'
            component={ActualizarRecordatorio}
            options={{
              title: "Información del recordatorio",
              headerStyle: {
                backgroundColor: '#FFB86C'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }}
          />
          <Stack.Screen
            name='AgregarArchivo'
            component={AgregarArchivo}
            options={({ route }) => ({
              title: route.params.titulo,
              headerStyle: {
                backgroundColor: '#FFB86C'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
          <Stack.Screen
            name='PerfilAlumno'
            component={PerfilAlumno}
            options={() => ({
              title: 'Créditos de creación',
              headerStyle: {
                backgroundColor: '#FFB86C'
              },
              headerTintColor: '#2E2E2E',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App;

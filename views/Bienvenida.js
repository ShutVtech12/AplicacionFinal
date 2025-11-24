import React, { useState, useEffect } from 'react'
import { View, ScrollView } from 'react-native'

/* Usados en NativeBase             |           Equivalencia en RN Paper
 Container                          |           View
 Button                             |           Button
 Text                               |           Text
 H1                                 |           Text variant='titleLarge'
 Input                              |           TextInput
 Form                               |           TextInput
 Item                               |           TextInput
 Toast                              |           Snackbar

 */
import { Text, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '../styles/gradientButton';
import DeviceInfo from 'react-native-device-info';
import { useQuery, gql } from '@apollo/client';

const OBTENER_TESTING = gql`
    query {
        obtenerTesting {
            version
        }
    }
`;



const Bienvenida = () => {
    //React navigation
    const navigation = useNavigation();
    const [showFireworks, setShowFireworks] = useState(true);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showNotification, setNotification] = useState(true);

    // Consulta la versión remota
    const { data } = useQuery(OBTENER_TESTING);

    useEffect(() => {
        if (showFireworks) {
            const timer = setTimeout(() => {
                setShowFireworks(false);
            }, 2500); // 2.5 segundos de animación
            return () => clearTimeout(timer);
        }
    }, [showFireworks]);

    // Función para manejar el click en "Continuar"
    const handleContinuar = () => {
        const versionLocal = DeviceInfo.getVersion();
        const versionRemota = data?.obtenerTesting?.version;
        /*console.log("Version Local: ", versionLocal)
        console.log("Version BD", versionRemota)*/

        if (versionRemota && versionLocal !== versionRemota) {
            setShowUpdate(true); // Muestra alerta y no navega
        } else {
            navigation.replace("Login"); // Navega si la versión es igual
        }
    };

    return (
        <SafeAreaView style={globalStyles.contenedorLoginNuevo}>
            <View style={globalStyles.contenido}>
                <Text style={globalStyles.tituloNuevo}>
                    Bienvenido(a) a Happiness
                </Text>
                <Text style={globalStyles.formal1}>
                    <Text style={{ fontWeight: 'bold' }}>HAPPINESS</Text>
                    {' '}es una aplicación prototipo que busca apoyarte en la gestión de las diferentes actividades extracurriculares que se realizarán en el curso de la profesora Jacqueline Arzate Gordillo.
                </Text>
                <Text style={globalStyles.formal1}>
                    Aquí podrás ver publicadas las correspondientes actividades, su frecuencia, fecha de inicio y termino, registrar la evidencia de ellas, así como programar recordatorios.
                </Text>
                <Text style={globalStyles.formal1}>
                    Esperamos disfrutes usar esta aplicación  y sobre todo, esperamos coadyuvar  en favorecer tu bienestar.
                </Text>
                <Text style={globalStyles.formal1}>
                    Cualquier sugerencia o problema técnico, agradecemos todos tus comentarios sean enviados al siguiente correo jorozcoc1700@alumno.ipn.mx
                </Text>
                <Text style={globalStyles.formal1}>
                    ¡Enhorabuena!
                </Text>
                {showFireworks && (
                    <View style={{
                        position: 'absolute',
                        top: 100, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        flex: 1
                    }}>
                        <LottieView
                            source={require('../assets/blink-emoji-yellow.json')}
                            autoPlay
                            loop={false}
                            style={{ width: 600, height: 400 }}
                        />
                    </View>
                )}
                <GradientButton
                    title="Continuar"
                    onPress={handleContinuar}
                    //Naranja
                    colores={['#A3E4D7', '#4FC3F7']}
                />
                <Snackbar
                    visible={showUpdate}
                    onDismiss={() => setShowUpdate(false)}
                    duration={8000}
                    style={{ backgroundColor: '#FFB75E' }}
                > 
                    Hay una nueva versión disponible. Por favor actualiza la app.
                </Snackbar>
                <Snackbar
                    visible={showNotification}
                    onDismiss={() => setNotification(false)}
                    duration={8000}
                    style={{ backgroundColor: '#FFB75E' }}
                > 
                    IMPORTANTE! En el Drive hay un pdf con un tutorial revisarlo por favor.
                </Snackbar>
            </View>
        </SafeAreaView>
    );
}

export default Bienvenida;
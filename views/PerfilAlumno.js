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
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import LottieView from 'lottie-react-native';

const PerfilAlumno = () => {
    //React navigation
    const navigation = useNavigation();
    const [showFireworks, setShowFireworks] = useState(true);
    useEffect(() => {
        if (showFireworks) {
            const timer = setTimeout(() => {
                setShowFireworks(false);
            }, 2500); // 2.5 segundos de animación
            return () => clearTimeout(timer);
        }
    }, [showFireworks]);
    return (
        <View style={globalStyles.contenedorNormal}>
            <ScrollView>
                <Text style={globalStyles.formal1}>
                    Esta aplicación fue desarrollada con el objetivo de apoyar en la utilidad, manejo y administración de actividades de la Mtra. Jacqueline Arzate Gordillo, dentro de la Escuela Superior de Cómputo (ESCOM).
                </Text>
                <Text style={globalStyles.formal1}>
                    El proyecto fue realizado sin fines de lucro, como parte del servicio social del periodo 2025/2, por el alumno José Emiliano Orozco Cruz.
                </Text>
                <Text style={globalStyles.formal1}>
                    Agradezco profundamente el constante apoyo y comprensión de mi familia, así como el amor y la motivación incondicional de Cristian Ferrer, quienes estuvieron presentes en cada etapa del desarrollo de esta aplicación.
                </Text>
                <Text style={globalStyles.formal1}>
                    Finalizada y entregada el 2 de julio de 2025.
                    Publicada el mismo día.
                </Text>
                <Text style={globalStyles.formal2}>
                    {'     '}"La Técnica al Servicio de la Patria."
                </Text>
                {showFireworks && (
                    <View style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        flex: 1
                    }}>
                        <LottieView
                            source={require('../assets/fireworks.json')}
                            autoPlay
                            loop={false}
                            style={{ width: 300, height: 300 }}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

export default PerfilAlumno;
import React, { useState } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'

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
import { TextInput, Snackbar, Text, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

//APollo
import { gql, useMutation } from '@apollo/client'

const AUTENTICAR_ALUMNO = gql`
    mutation autenticarAlumno($input: AutenticarAlumnoInput){
        autenticarAlumno(input: $input) {
            token
        }
    }
`;

const Login = () => {

    //State del formulario
    const [boleta, setBoleta] = useState('')
    const [password, setPassword] = useState('')

    //Cuando el usuario da click
    //Mutation de apollo
    const [authAlumno] = useMutation(AUTENTICAR_ALUMNO)

    //Para el ToggleSnackBar
    const [mensaje, setMensaje] = useState(null)
    const [snackbarVisible, setsnackbarVisible] = useState(false);
    const [redirigir, setRedirigir] = useState(false);

    //Funciones para mostrar y ocultar el SnackBar
    const onDismissSnackBar = () => {
        setsnackbarVisible(false)
        if (redirigir) {
            setRedirigir(false)
            navigation.navigate('Login')
        }
    };

    //Cuando el usuario presiona en iniciar sesion
    const handleSubmit = async () => {
        //validar
        if (boleta === '' || password === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setsnackbarVisible(true)
            return;
        }
        //verificar password
        if (password.length < 6) {
            //Mostrar un error
            setMensaje('La contraseña no tiene el formato correcto')
            setsnackbarVisible(true)
            return;
        }
        // usuario
        try {
            //data es la respuesta del servidor los return que tenemos en los mutations
            const { data } = await authAlumno({
                variables: {
                    input: {
                        boleta: boleta,
                        password: password
                    }
                }
            })
            const { token } = data.autenticarAlumno
            //Colocar token en storage
            await AsyncStorage.setItem('token', token)
            //Redirecciono a la nueva vista
            navigation.replace("TareasAlumno")
        } catch (error) {
            setMensaje(error.message.replace('GraphQL error', ''))
            //Muestra el mensaje de error y al cerrar el mensaje se redirije al Login
            setsnackbarVisible(true)
        }
    }

    //React navigation
    const navigation = useNavigation();

    return (
        <SafeAreaView style={globalStyles.contenedorLogin}>
            <View style={globalStyles.contenido}>
                <Text style={globalStyles.titulo} onLongPress={() => navigation.navigate("PerfilAlumno")}>
                    HAPPINESS
                </Text>
                <Text style={styles.tituloLogin}>Bienvenido</Text>
                <Text style={globalStyles.subTexto}>Por favor, inicia sesión para continuar</Text>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="card-bulleted-outline"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <TextInput
                            label='Boleta'
                            textColor='black'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            onChangeText={texto => setBoleta(texto)}
                            keyboardType='number-pad'
                            maxLength={10}
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="lock"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <TextInput
                            label='Contraseña'
                            textColor='black'
                            onChangeText={texto => setPassword(texto)}
                            secureTextEntry
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <GradientButton
                    title="Iniciar Sesión"
                    onPress={() => handleSubmit()}
                    onLongPress={() => navigation.replace("LoginMaestra")}
                    //Naranja
                    colores={['#60B0C4', '#A3E4D7']}
                />
                <View style={styles.snackContent}>
                    <Snackbar
                        visible={snackbarVisible}
                        onDismiss={onDismissSnackBar}
                        duration={3000}
                        /*icon="alert-circle"
                        onIconPress={()=> (
                            console.log("Presionado")
                        )}*/
                        style={globalStyles.snackBarWarning}
                        action={{
                            label: '✅',
                            rippleColor: '#FF8700',
                            onPress: () => {
                                // Tal vez limpiar algún estado si quieres
                            },
                        }}
                    >
                        <Text style={{ color: '#212121', fontSize: 15 }}>{mensaje}</Text>
                    </Snackbar>
                </View>
                <View style={styles.register}>
                    <Text style={globalStyles.textNegro}>
                        Nuevo alumno en la clase?
                    </Text>
                    <Text
                        style={styles.nuevoRegistro}
                        onPress={() => navigation.navigate("CrearCuenta")}
                    >Crear cuenta</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    tituloLogin: {
        paddingTop: 40,
        textAlign: 'left',
        fontSize: 40,
        color: '#2E2E2E',
        fontWeight: '500'
    },
    register: {
        paddingTop: 140,
        alignItems: 'center',
        marginTop: 20
    },
    nuevoRegistro: {
        paddingTop: 10,
        textDecorationLine: 'underline',
        color: '#6CBF84'
    },
    snackContent: {
        alignItems: 'center'
    }
});


export default Login;
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
import { TextInput, Snackbar, Text, Icon} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

//APollo
import { gql, useMutation } from '@apollo/client'

const AUTENTICAR_MAESTRA = gql`
    mutation autenticarMaestra($input: AutenticarMaInput){
        autenticarMaestra(input: $input) {
            token
        }
    }
`;

const LoginMaestra = () => {

    //State del formulario
    const [usuario, setUsuario] = useState('')
    const [password, setPassword] = useState('')

    //Cuando el usuario da click
    //Mutation de apollo
    const [authMaestra] = useMutation(AUTENTICAR_MAESTRA)

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
        if (usuario === '' || password === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setsnackbarVisible(true)
            return;
        }
        // usuario
        try {
            //data es la respuesta del servidor los return que tenemos en los mutations
            const { data } = await authMaestra({
                variables: {
                    input: {
                        correo: usuario,
                        password: password
                    }
                }
            })
            const {token}  = data.autenticarMaestra
            //Colocar token en storage
            await AsyncStorage.setItem('token', token)
            //Redirecciono a la nueva vista
            navigation.replace("Grupos")
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
                <Text style={styles.tituloLogin}>Bienvenido(a)</Text>
                <Text style={globalStyles.subTexto}>Por favor, inicie sesión para continuar</Text>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="email-outline"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            label='Correo'
                            onChangeText={texto => setUsuario(texto)}
                            keyboardType='email-address'
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                            textColor='black'
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="lock"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            label='Contraseña'
                            textColor='black'
                            onChangeText={texto => setPassword(texto)}
                            secureTextEntry
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <GradientButton
                    title="Iniciar Sesión"
                    onPress={() => handleSubmit()}
                    //Naranja
                    colores={['#2196F3', '#21DBF3']}
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
                    <View>
                        <Text
                            style={styles.nuevoRegistro}
                            onPress={() => navigation.navigate("CrearMaestraAcc")}
                        >Crear Cuenta</Text>
                    </View>
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
        textDecorationLine: 'underline',
        color: '#FF8C42'
    }
});


export default LoginMaestra;
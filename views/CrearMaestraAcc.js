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
import { TextInput, Button, Snackbar, Text, Icon, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';

//APollo
import { gql, useMutation } from '@apollo/client'

const NUEVA_MAESTRA = gql`
    mutation crearMaestra($input: MaestraInput){
        crearMaestra(input:$input)
    }
`;

const CrearMaestraAcc = () => {
    //State del formulario
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    //Para el ToggleSnackBar

    //React navigation
    const navigation = useNavigation();

    //Mutation de apollo
    const [crearMaestra] = useMutation(NUEVA_MAESTRA)

    //Para el ToggleSnackBar
    const [mensaje, setMensaje] = useState(null)
    const [snackbarVisible, setsnackbarVisible] = useState(false);
    const [redirigir, setRedirigir] = useState(false);

    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);

    //Funciones para mostrar y ocultar el SnackBar
    const onToggleSnackBar = () => setsnackbarVisible(!snackbarVisible);
    const onDismissSnackBar = () => {
        setsnackbarVisible(false)
        if (redirigir) {
            setRedirigir(false)
            navigation.replace('Login')
        }
    };

    //Cuando el usuario presiona en crear cuenta
    const handleSubmit = async () => {
        //validar
        if (nombre === '' || correo === '' || password === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        //pasword al menos 6 caracteres
        if (password.length < 6) {
            //Mostrar un error
            setMensaje('La contraseña debe tener al menos 6 caracteres')
            setVisibleDialog(true)
            return;
        }
        // Validar correo IPN
        if (!correo.endsWith('@ipn.mx')) {
            setMensaje('El correo debe ser institucional (@ipn.mx)')
            setVisibleDialog(true)
            return;
        }
        //guardar usuario
        try {
            //data es la respuesta del servidor los return que tenemos en los mutations
            const { data } = await crearMaestra({
                variables: {
                    input: {
                        nombre: nombre,
                        correo: correo,
                        password: password
                    }
                }
            })
            //Muestra el mensaje y al cerrar el mensaje se redirije al Login
            setMensaje(data.crearMaestra)
            setsnackbarVisible(true)
            setRedirigir(true)
        } catch (error) {
            setMensaje(error.message.replace('GraphQL error', ''))
            //Muestra el mensaje de error y al cerrar el mensaje se redirije al Login
            setsnackbarVisible(true)
            setRedirigir(true)
        }
    }

    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <View style={globalStyles.contenido}>
                <Text style={styles.tituloLogin}>Todos los campos son obligatorios</Text>
                <View style={styles.divi}>
                    <View style={styles.containerLogin}>
                        <Icon
                            source="account"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            label='Nombre Completo'
                            textColor='black'
                            onChangeText={texto => setNombre(texto)}
                            keyboardType='default'
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <View style={styles.divi}>
                    <View style={styles.containerLogin}>
                        <Icon
                            source="email"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            label='Correo'
                            textColor='black'
                            onChangeText={texto => setCorreo(texto)}
                            keyboardType='email-address'
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />
                    </View>
                </View>
                <View style={styles.divi}>
                    <View style={styles.containerLogin}>
                        <Icon
                            source="form-textbox-password"
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
                    title="Crear Cuenta"
                    onPress={() => handleSubmit()}
                    colores={['#2196F3', '#21DBF3']}
                />
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
                <Portal>
                    <Dialog
                        visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}
                        style={globalStyles.snackBarWarning}
                    >
                        <Dialog.Icon icon="alert"
                            color='black'
                            style={globalStyles.snackBarWarning}
                        />
                        <Dialog.Title style={styles.title}>Advertencia</Dialog.Title>
                        <Dialog.Content>
                            <Text style={globalStyles.textNegro} variant="bodyMedium">{mensaje}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button style={globalStyles.textNegro} onPress={() => setVisibleDialog(false)}>Ok</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
    },
    tituloLogin: {
        textAlign: 'center',
        fontSize: 20,
        color: '#2E2E2E'
    },
    subTexto: {
        color: 'gray',
        paddingBottom: 40
    },
    containerLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 16,
    },
    register: {
        paddingTop: 140,
        alignItems: 'center',
        marginTop: 20
    },
    divi: {
        marginBottom: 16
    },
    nuevoRegistro: {
        paddingTop: 10,
        textDecorationLine: 'underline',
        color: '#6CBF84'
    }
});


export default CrearMaestraAcc;
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
import { TextInput, Snackbar, Text, Icon, Dialog, Portal, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';

//APollo
import { gql, useMutation } from '@apollo/client'

const NUEVO_GRUPO = gql`
    mutation nuevoGrupo($input: GrupoInput) {
        nuevoGrupo(input: $input){
            clave        
            grupo
            nombre
            id
        }
    }
`;

//Actualizar el caché
const OBTENER_GRUPOS = gql`
    query obtenerGrupos{
        obtenerGrupos{
            id
            clave
            nombre
            grupo
        }
    }

`

const AgregarGrupo = () => {
    //State del formulario
    const [grupo, setGrupo] = useState('')
    const [name, setName] = useState('')
    const [clave, setClave] = useState('')

    //Apollo Mutation con actualizacion de grpos
    const [nuevoGrupo] = useMutation(NUEVO_GRUPO, {
        update(cache, { data: { nuevoGrupo } }) {
            const { obtenerGrupos } = cache.readQuery({ query: OBTENER_GRUPOS })
            cache.writeQuery({
                query: OBTENER_GRUPOS,
                data: { obtenerGrupos: obtenerGrupos.concat([nuevoGrupo]) }
            })
        }
    })

    //Para el ToggleSnackBar
    const [mensaje, setMensaje] = useState(null)
    const [snackbarVisible, setsnackbarVisible] = useState(false);
    const [redirigir, setRedirigir] = useState(false);

    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);

    //Funciones para mostrar y ocultar el SnackBar
    const onDismissSnackBar = () => {
        setsnackbarVisible(false)
        if (redirigir) {
            setRedirigir(false)
            navigation.goBack()
        }
    }

    const generarClave = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let claveGenerada = '';
        for (let i = 0; i < 5; i++) {
            claveGenerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setClave(claveGenerada);
    }

    const handleSubmit = async () => {
        //validar
        if (grupo === '' || name === '' || clave === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        //Guardamos el grupo 
        try {
            const { data } = await nuevoGrupo({
                variables: {
                    input: {
                        grupo: grupo,
                        nombre: name,
                        clave: clave
                    }
                }
            })
            setMensaje('Grupo creado correctamente')
            setsnackbarVisible(true)
            setRedirigir(true)
        } catch (error) {
            setMensaje(error.message)
            setsnackbarVisible(true)
            setRedirigir(true)
        }

    }
    //React navigation
    const navigation = useNavigation();

    return (
        <SafeAreaView style={globalStyles.contenedorLogin}>
            <View style={globalStyles.contenido}>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="form-textbox"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            onChangeText={texto => setName(texto)}
                            label='Nombre de la materia'
                            textColor='black'
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />

                    </View>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="account-group"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            onChangeText={texto => setGrupo(texto)}
                            label='Grupo'
                            textColor='black'
                            maxLength={5}
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />

                    </View>
                    <View>
                        <Text style={globalStyles.containerLoginText}>Clave de acceso único</Text>
                    </View>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="key-link"
                            color={'#2196F3'}
                            size={40}
                        />
                        <TextInput
                            value={clave}
                            onChangeText={texto => setClave(texto)}
                            label='Clave'
                            textColor='black'
                            maxLength={5}
                            mode='outlined'
                            outlineColor='#21DBF3'
                            activeOutlineColor='#2196F3'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                        />
                        <Button
                            mode="text"
                            buttonColor="#2196F3"
                            textColor='white'
                            onPress={() => {
                                generarClave()
                            }}>
                            Generar clave
                        </Button>
                    </View>
                </View>
                <GradientButton
                    title="Agregar grupo"
                    onPress={() => handleSubmit()}
                    //Naranja
                    colores={['#2196F3', '#21DBF3']}
                />
            </View>
            <View style={globalStyles.snackContent}>
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
    );
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
    },
})

export default AgregarGrupo;
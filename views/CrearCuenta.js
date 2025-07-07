import React, { useState, useEffect } from 'react'
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
import { TextInput, Button, Snackbar, Text, Icon, Menu, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';
import { gql, useMutation, useQuery } from '@apollo/client'

//Obtener las tareas del grupo
const OBTENER_TODOS_GRUPOS = gql`
    query obtenerTodosGrupos{
        obtenerTodosGrupos{
            id
            clave
            nombre
            grupo
        }
    }

`

const NUEVA_ALUMNO = gql`
    mutation crearAlumno($input: AlumnoInput){
        crearAlumno(input:$input)
    }
`;

const SelectorGrupo = ({ grupos, grupoSeleccionado, setGrupoSeleccionado }) => {
    const [visible, setVisible] = useState(false);

    return (
        <SafeAreaView>
            <Menu
                contentStyle={{ backgroundColor: '#FFF7E6' }}
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                    <TextInput
                        label="Grupo"
                        textColor='black'
                        value={grupoSeleccionado ? grupoSeleccionado.nombre : ''}
                        mode='outlined'
                        outlineColor='#FFB75E'
                        activeOutlineColor='#FFB75E'
                        theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                        style={{ marginBottom: 8, backgroundColor: '#FFF7E6' }}
                        right={
                            <TextInput.Icon
                                icon="menu-down"
                                color='black'
                                onPress={() => setVisible(true)}
                            />
                        }
                        editable={false}
                    />
                }
            >
                {grupos.map(grupo => (
                    <Menu.Item
                        key={grupo.id}
                        onPress={() => {
                            setGrupoSeleccionado(grupo);
                            setVisible(false);
                        }}
                        title={grupo.grupo + " " + grupo.nombre}
                    />
                ))}
            </Menu>
        </SafeAreaView>
    );
};

const CrearCuenta = () => {
    //React navigation
    const navigation = useNavigation();

    //Apollo
    //data son los datos de la consulta
    //loading mientras esperas
    //error te muestra el error
    const { data, loading, error } = useQuery(OBTENER_TODOS_GRUPOS)
    //Mutation de apollo
    const [crearAlumno] = useMutation(NUEVA_ALUMNO)

    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    //Para el ToggleSnackBar
    const [mensaje, setMensaje] = useState(null)
    const [snackbarVisible, setsnackbarVisible] = useState(false);
    const [redirigir, setRedirigir] = useState(false);

    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);

    const onDismissSnackBar = () => {
        setsnackbarVisible(false)
        if (redirigir) {
            setRedirigir(false)
            navigation.replace('Login')
        }
    };

    //State del formulario
    const [nombre, setNombre] = useState('')
    const [boleta, setBoleta] = useState('')
    const [password, setPassword] = useState('')
    const [grupo, setGrupo] = useState('')
    const [clave, setClave] = useState('')
    useEffect(() => {
        setGrupo(grupoSeleccionado);
    }, [grupoSeleccionado]);

    //Cuando el usuario presiona en crear cuenta
    const handleSubmit = async () => {
        //validar
        if (nombre === '' || boleta === '' || password === '' || grupo === '' || clave === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }        //pasword al menos 6 caracteres
        if (password.length < 6) {
            //Mostrar un error
            setMensaje('La contraseña debe tener al menos 6 caracteres')
            setVisibleDialog(true)
            return;
        }
        if (boleta.length < 10) {
            //Mostrar un error
            setMensaje('El formato de la boleta no es el correcto')
            setVisibleDialog(true)
            return;
        }
        if (!grupoSeleccionado || clave !== grupoSeleccionado.clave) {
            setMensaje('La clave de acceso del grupo es incorrecta')
            setVisibleDialog(true)
            return;
        }
        //guardar usuario
        try {
            //data es la respuesta del servidor los return que tenemos en los mutations
            const { data } = await crearAlumno({
                variables: {
                    input: {
                        nombre: nombre,
                        boleta: boleta,
                        password: password,
                        grupo: grupo.id
                    }
                }
            })
            //Muestra el mensaje y al cerrar el mensaje se redirije al Login
            setMensaje(data.crearAlumno)
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
        <View style={globalStyles.contenedorNormal}>
            <View style={globalStyles.contenido}>
                <Text style={globalStyles.tituloLogin}>Todos los campos son obligatorios</Text>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="account"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <TextInput
                            label='Nombre Completo'
                            textColor='black'
                            keyboardType='default'
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                            onChangeText={texto => setNombre(texto)}
                        />
                    </View>
                </View>
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
                            keyboardType='number-pad'
                            maxLength={10}
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                            onChangeText={texto => setBoleta(texto)}
                        />
                    </View>
                </View>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="form-textbox-password"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <TextInput
                            label='Contraseña'
                            textColor='black'
                            secureTextEntry
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                            onChangeText={texto => setPassword(texto)}
                        />
                    </View>
                </View>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="key"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <TextInput
                            label='Clave de Acceso del Grupo'
                            maxLength={5}
                            textColor='black'
                            mode='outlined'
                            outlineColor='#FFB75E'
                            activeOutlineColor='#FFB75E'
                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                            style={globalStyles.inputBase}
                            onChangeText={texto => setClave(texto)}
                        />
                    </View>
                </View>
                <View style={globalStyles.divi}>
                    <View style={globalStyles.containerLogin}>
                        <Icon
                            source="account-group"
                            color={'#4CAF50'}
                            size={40}
                        />
                        <View>
                            <SelectorGrupo
                                grupos={data?.obtenerTodosGrupos || []} // Aquí pon el array que traes de la BD
                                grupoSeleccionado={grupoSeleccionado}
                                setGrupoSeleccionado={setGrupoSeleccionado}
                            />
                        </View>
                    </View>
                </View>
                <GradientButton
                    title="Crear Cuenta"
                    onPress={() => handleSubmit()}
                    colores={['#6CBF84', '#4CAF50']}
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
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
    },
})


export default CrearCuenta;
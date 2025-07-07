import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'

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
import { Button, Text, List, Dialog, Portal, ActivityIndicator, MD2Colors, SegmentedButtons, Snackbar, TextInput, Icon } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useMutation, useQuery } from '@apollo/client'
import { useColorScheme } from 'react-native';


//Obtener las tareas del grupo
const OBTENER_TAREAS = gql`
    query obtenerTareas($input: GrupoIDInput){
        obtenerTareas(input: $input){
            id
            titulo
            descripcion
            fechaInicio
            fechaFinal
            repetible
            diasRepetible
            grupoPertenece
        }
    }

`



const ELIMINAR_TAREA = gql`
    mutation eliminarTarea($id: ID!) {
        eliminarTarea(id: $id)
    }
`

const ACTUALIZAR_GRUPO = gql`
    mutation actualizarGrupo($id: ID!, $input: GrupoInput) {
        actualizarGrupo(id: $id, input: $input){
            id
            clave
            grupo
            nombre
        }
    }

`

const Grupo = ({ route }) => {
    const navigation = useNavigation()

    const [actualizarGrupo] = useMutation(ACTUALIZAR_GRUPO)
    //Apollo
    const { data: tareasData, loading: tareasLoading, error: tareasError, refetch: tarearefetch } = useQuery(OBTENER_TAREAS, {
        variables: {
            input: {
                grupoPertenece: route.params.id
            }
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            tarearefetch();
        }, [])
    );
    

    const [eliminarTarea] = useMutation(ELIMINAR_TAREA, {
        update(cache) {
            const { obtenerTareas } = cache.readQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        grupoPertenece: route.params.id
                    }
                }
            })
            cache.writeQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        grupoPertenece: route.params.id
                    }
                },
                data: {
                    obtenerTareas: obtenerTareas.filter(tareaActual => tareaActual.id !== idMiTarea)
                }
            })
        }
    })

    //Para el ToggleSnackBar
    const [snackbarVisible, setsnackbarVisible] = useState(false);
    const [redirigir, setRedirigir] = useState(false);
    const [mensaje, setMensaje] = useState(null)
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [idMiTarea, setidMiTarea] = useState()
    const [value, setValue] = useState('Publicadas');
    const [clave, setClave] = useState(route.params.clave)

    const MessageEliminate = () => {
        setMensaje('¿Deseas eliminar de forma permanente esta tarea?')
        setVisibleDialog(true)
    }

    const eliminateSubmit = async () => {
        try {
            const { data } = await eliminarTarea({
                variables: {
                    id: idMiTarea
                }
            })
            setVisibleDialog(false)
        } catch (error) {
            console.log(error)
        }
    }

    const actualizarClave = async () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let claveGenerada = '';
        for (let i = 0; i < 5; i++) {
            claveGenerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setClave(claveGenerada);
        try {
            const { data } = await actualizarGrupo({
                variables: {
                    id: route.params.id,
                    input: {
                        clave: claveGenerada,
                        grupo: route.params.grupo,
                        nombre: route.params.nombre
                    }
                }
            })
            setMensaje('Clave actualizada correctamente')
            setsnackbarVisible(true)
        } catch (error) {
            console.log(error)
        }
    }

    const colorScheme = useColorScheme();

    //Si apollo está consultando
    if (tareasLoading) return <ActivityIndicator animating={true} color={MD2Colors.red800} />
    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <View style={styles.contenidololo}>
                <Icon
                    source="key-link"
                    color={'#2196F3'}
                    size={40}
                />
                <TextInput
                    disabled={true}
                    value={clave}
                    onChangeText={texto => setClave(texto)}
                    label='Clave de acceso único'
                    textColor='black'
                    maxLength={5}
                    mode='outlined'
                    outlineColor='#21DBF3'
                    activeOutlineColor='#2196F3'
                    theme={{
                        colors: {
                            primary: 'black', // color del label cuando está enfocado
                            onSurfaceVariant: 'black', // color del label cuando no está enfocado
                            surfaceDisabled: '#f5f5f5', // fondo cuando está deshabilitado (Paper v5+)
                            onSurfaceDisabled: '#212121', // color del texto cuando está deshabilitado (Paper v5+)
                        }
                    }} style={globalStyles.inputBase}
                />
            </View>
            <View style={{ paddingBottom: 20 }}>
                <Button
                    icon="key-plus"
                    mode="contained"
                    buttonColor="#4CAF50"
                    textColor='white'
                    onPress={() => actualizarClave()}
                >
                    Actualizar clave de acceso
                </Button>
            </View>
            <SafeAreaView style={styles.container}>
                <SegmentedButtons
                    icon={value}
                    value={value}
                    onValueChange={setValue}
                    buttons={[
                        {
                            value: 'Publicadas',
                            label: 'Publicadas',
                            labelStyle: {
                                color:
                                    value === 'Publicadas'
                                        ? (colorScheme === 'dark' ? 'white' : '#2196F3')
                                        : (colorScheme === 'dark' ? 'black' : 'black'),
                                fontWeight: 'bold'
                            }
                        },
                        {
                            value: 'Programadas',
                            label: 'Programadas',
                            labelStyle: {
                                color:
                                    value === 'Programadas'
                                        ? (colorScheme === 'dark' ? 'white' : '#2196F3')
                                        : (colorScheme === 'dark' ? 'black' : 'black'),
                                fontWeight: 'bold'
                            }
                        }
                    ]}
                />
            </SafeAreaView>
            <ScrollView>
                {tareasData && tareasData.obtenerTareas &&
                    tareasData.obtenerTareas
                        .filter(tarea => {
                            const fechaInicio = new Date(Number(tarea.fechaInicio));
                            const ahora = new Date();
                            if (value === 'Publicadas') {
                                // Publicada: fechaInicio <= ahora
                                return fechaInicio <= ahora;
                            } else if (value === 'Programadas') {
                                // Programada: fechaInicio > ahora
                                return fechaInicio > ahora;
                            }
                            return true;
                        })
                        .map(tarea => (
                            <List.Item
                                key={tarea.id}
                                title={() => (
                                    <View>
                                        <Text style={globalStyles.tituloGrupoItem}>{tarea.titulo}</Text>
                                    </View>
                                )}
                                description={() => (
                                    <View>
                                        <Text style={globalStyles.contenidoGrupoItem}>Fecha Lanzamiento: </Text>
                                        <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaInicio)).toLocaleDateString()}</Text>
                                        <Text style={globalStyles.contenidoGrupoItem}>Hora de Inicio:</Text>
                                        <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaInicio)).toLocaleTimeString()}</Text>
                                        <Text style={globalStyles.contenidoGrupoItem}>Fecha Límite:</Text>
                                        <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaFinal)).toLocaleDateString()}</Text>
                                        <Text style={globalStyles.contenidoGrupoItem}>Hora Límite:</Text>
                                        <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaFinal)).toLocaleTimeString()}</Text>
                                        <Text style={globalStyles.contenidoGrupoItem}>Repetible:</Text>
                                        <Text style={globalStyles.textNegro}>{tarea.repetible}</Text>
                                        <Text style={globalStyles.contenidoGrupoItem}>Días repetible:</Text>
                                        <Text style={globalStyles.textNegro}>{tarea.diasRepetible}</Text>
                                    </View>
                                )}
                                left={props => <List.Icon {...props} icon="atom" color='black' />}
                                onLongPress={() => {
                                    MessageEliminate()
                                    setidMiTarea(tarea.id)
                                }}
                                right={props =>
                                    <View style={{ width: 120 }}>
                                        <Button
                                            {...props} onPress={() => navigation.navigate("Tarea", {
                                                idGrupo: route.params.id,
                                                nombreGrupo: route.params.nombre,
                                                grupoGrupo: route.params.grupo,
                                                tarea
                                            })}
                                            icon="pencil-outline"
                                            mode="contained"
                                            buttonColor="#FCC25C"
                                            textColor='black'
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            {...props} onPress={() => navigation.navigate("Entregas", {
                                                idGrupo: route.params.id,
                                                nombreGrupo: route.params.nombre,
                                                grupoGrupo: route.params.grupo,
                                                tarea
                                            })}
                                            icon="eye"
                                            buttonColor="#4CAF50"
                                            textColor='black'
                                        >
                                            Entregas
                                        </Button>
                                    </View>
                                }
                            />
                        ))
                }
                <View style={globalStyles.snackContent}>
                    <Snackbar
                        visible={snackbarVisible}
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
                <Portal>
                    <Dialog
                        visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}
                        style={globalStyles.snackBarDanger}
                    >
                        <Dialog.Icon icon="alert"
                            color='black'
                            size={48}
                        />
                        <Dialog.Title style={styles.title}>Peligro</Dialog.Title>
                        <Dialog.Content>
                            <Text style={globalStyles.textNegro} variant="titleLarge">{mensaje}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button labelStyle={globalStyles.textoBoton} onPress={() => eliminateSubmit()}>Si, deseo eliminar la tarea</Button>
                        </Dialog.Actions>
                        <Dialog.Actions>
                            <Button labelStyle={globalStyles.textoBoton} onPress={() => setVisibleDialog(false)}>Cancelar</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
        fontSize: 29
    },
    contenidololo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
    }
})

export default Grupo;

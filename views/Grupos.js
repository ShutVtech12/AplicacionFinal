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
import { List, Button, Text, Dialog, Portal, ActivityIndicator, MD2Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery, useMutation } from '@apollo/client'

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

//Obtener la cantidad de alumnos
const OBTENER_ALUMNOS_GRUPO = gql`
    query obtenerAlumnosGrupo($input: GrupoIDInput){
        obtenerAlumnosGrupo(input: $input){
            nombre
        }
    }
`

const ELIMINAR_GRUPO = gql`
    mutation eliminarGrupo($id: ID!) {
        eliminarGrupo(id: $id)
    }

`

const ELIMINAR_TAREA = gql`
    mutation eliminarGrupoTarea($input: GrupoIDInput){
        eliminarGrupoTarea(input: $input)
    }

`


const Grupos = () => {
    const navigation = useNavigation()

    //Apollo
    //data son los datos de la consulta
    //loading mientras esperas
    //error te muestra el error
    const { data, loading, error } = useQuery(OBTENER_GRUPOS)

    const [eliminarGrupo] = useMutation(ELIMINAR_GRUPO, {
        update(cache) {
            const { obtenerGrupos } = cache.readQuery({
                query: OBTENER_GRUPOS
            })
            cache.writeQuery({
                query: OBTENER_GRUPOS,
                data: {
                    obtenerGrupos: obtenerGrupos.filter(grupoActual => grupoActual.id !== idMiGrupo)
                }
            })
        }
    })

    const [eliminarTarea] = useMutation(ELIMINAR_TAREA)
    const AlumnosGrupoCount = ({ grupoId }) => {
        const { data, loading } = useQuery(OBTENER_ALUMNOS_GRUPO, {
            variables: { input: { grupoPertenece: grupoId } }
        });

        if (loading) return <Text style={globalStyles.tituloGrupo}>...</Text>;

        return (
            <View>
                <Text style={{ textAlign: 'center', color: 'black', fontSize: 15, paddingHorizontal: 10 }}>
                    Alumnos: {data && data.obtenerAlumnosGrupo ? data.obtenerAlumnosGrupo.length : 0}
                </Text>
            </View>
        );
    };

    //Para el ToggleSnackBar
    const [mensaje, setMensaje] = useState(null)
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [idMiGrupo, setidMiGrupo] = useState()

    const MessageEliminate = () => {
        setMensaje('Al eliminar el grupo, se borrará también a los alumnos, las tareas y las entregas que contenia el grupo')
        setVisibleDialog(true)
    }

    const eliminateSubmit = async () => {
        try {
            // 1. Elimina todas las tareas del grupo
            await eliminarTarea({
                variables: {
                    input: {
                        grupoPertenece: idMiGrupo
                    }
                }
            })
            await eliminarGrupo({
                variables: {
                    id: idMiGrupo
                }
            })
            setVisibleDialog(false)
        } catch (error) {
            console.log(error)
        }
    }


    if (loading) return <ActivityIndicator animating={true} color={MD2Colors.red800} />

    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                    icon="account-multiple-plus"
                    mode="contained"
                    buttonColor="#2196F3"
                    textColor='white'
                    onPress={() => navigation.navigate("AgregarGrupo")}
                >
                    Nuevo Grupo
                </Button>
                <Button
                    icon="pencil-box-outline"
                    mode="contained"
                    buttonColor="#4CAF50"
                    textColor='white'
                    onPress={() => navigation.navigate("AgregarTarea")}
                >
                    Nueva Tarea
                </Button>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={globalStyles.subtitulo}>
                    Seleccione un grupo
                </Text>
            </View>
            <ScrollView>
                {data.obtenerGrupos.map(grupo => (
                    //console.log(grupo.lenght),
                    <List.Item
                        titleStyle={globalStyles.textNegro}
                        descriptionStyle={globalStyles.textNegro}
                        key={grupo.id}
                        title={grupo.grupo}
                        description={() => (
                            <Text
                                style={globalStyles.textNegro}
                            >
                                {grupo.nombre}
                            </Text>
                        )}
                        left={props => <List.Icon {...props} icon="account-group" color='black' />}
                        onPress={() => {
                            navigation.navigate("Grupo", grupo)
                        }}
                        onLongPress={() => {
                            MessageEliminate()
                            setidMiGrupo(grupo.id)
                        }}
                        right={() => <AlumnosGrupoCount grupoId={grupo.id} />}
                    />
                ))}
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
                            <Text variant="titleLarge">{mensaje}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button labelStyle={globalStyles.textoBoton} onPress={() => eliminateSubmit()}>Si, deseo eliminar el grupo</Button>
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
})

export default Grupos;
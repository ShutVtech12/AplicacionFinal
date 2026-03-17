import React, { useState } from 'react'
import { View, ScrollView, SafeAreaView } from 'react-native'

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
import { List, Text, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery } from '@apollo/client'
import { useColorScheme } from 'react-native';

const OBTENER_ALUMNOS = gql`
    query obtenerAlumnos($input: GrupoIDInput){
        obtenerAlumnos(input: $input){
            id
            nombre
            boleta
        }
    }
`

const OBTENER_ARCHIVO_ALUMNOS = gql`
    query obtenerArchivoAlumnos($input: TareaIDInput){
        obtenerArchivoAlumnos(input: $input){
            id
            texto
            fechaEntregado
            estado
            autor
            tareaAsignada
            archivoUrl
            tipoArchivo
        }
    }
`

const Entregas = ({ route }) => {
    const navigation = useNavigation()
    //Extrayendo los valores
    const { tarea } = route.params
    const [value, setValue] = useState('Asignadas');

    const { data: alumnosData, loading: alumnosLoading, error: alumnosError, refetch: alumnosRefresh } = useQuery(OBTENER_ALUMNOS, {
        variables: {
            input: {
                grupoPertenece: route.params.idGrupo
            }
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            alumnosRefresh();
        }, [])
    );
    const { data: archivosData, loading: archivosLoading, error: archivosError, refetch: archivoRefresh } = useQuery(OBTENER_ARCHIVO_ALUMNOS, {
        variables: {
            input: {
                tareaAsignada: route.params.tarea.id
            }
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            archivoRefresh();
        }, [])
    );

    const colorScheme = useColorScheme();

    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <ScrollView>
                <View>
                    <Text style={globalStyles.tituloGrupo}>Descripción de la tarea</Text>
                    <View style={{ maxHeight: 150, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 }}>
                        <ScrollView>
                            <Text style={{ fontSize: 16, color: 'black', padding: 8 }}>
                                {tarea.descripcion}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={globalStyles.tituloGrupo}>Entregas</Text>
                    <Text style={globalStyles.tituloGrupo}>{archivosData && archivosData.obtenerArchivoAlumnos
                        ? archivosData.obtenerArchivoAlumnos.length
                        : 0}/{alumnosData && alumnosData.obtenerAlumnos
                        ? alumnosData.obtenerAlumnos.length
                        : 0}</Text>
                </View>
                <ScrollView>
                    {archivosData &&
                        archivosData.obtenerArchivoAlumnos &&
                        (
                            tarea.repetible === 'Si'
                                ? (
                                    // Mostrar solo una entrega por alumno
                                    archivosData.obtenerArchivoAlumnos
                                        .filter(
                                            (archivo, index, self) =>
                                                index === self.findIndex(e => e.autor === archivo.autor)
                                        )
                                        .map(archivo => {
                                            const alumnoAutor = alumnosData?.obtenerAlumnos?.find(alumno => alumno.id === archivo.autor);
                                            return (
                                                <List.Item
                                                    key={archivo.id}
                                                    title={() => (
                                                        <View>
                                                            <Text style={globalStyles.tituloGrupoItem}>
                                                                {alumnoAutor ? alumnoAutor.nombre : 'Desconocido'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    left={props => <List.Icon {...props} icon="check-decagram-outline" color='black' />}
                                                    onPress={() => navigation.navigate("InfoEntregas", {
                                                        archivo,
                                                        alumnoAutor
                                                    })}
                                                />
                                            )
                                        })
                                )
                                : (
                                    // Mostrar todas las entregas
                                    archivosData.obtenerArchivoAlumnos.map(archivo => {
                                        const alumnoAutor = alumnosData?.obtenerAlumnos?.find(alumno => alumno.id === archivo.autor);
                                        return (
                                            <List.Item
                                                key={archivo.id}
                                                title={() => (
                                                    <View>
                                                        <Text style={globalStyles.tituloGrupoItem}>
                                                            {alumnoAutor ? alumnoAutor.nombre : 'Desconocido'}
                                                        </Text>
                                                    </View>
                                                )}
                                                description={() => (
                                                    <View>
                                                        <Text style={globalStyles.contenidoGrupoItem}>Fecha Entregado: {new Date(Number(archivo.fechaEntregado)).toLocaleDateString()}</Text>
                                                    </View>
                                                )}
                                                left={props => <List.Icon {...props} icon="check-decagram-outline" color='black' />}
                                                onPress={() => navigation.navigate("InformacionEntrega", {
                                                    archivo,
                                                    alumnoAutor
                                                })}
                                            />
                                        )
                                    })
                                )
                        )
                    }
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}
export default Entregas

import React from 'react'
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
import { List, Text } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery } from '@apollo/client'
import CircularProgress from 'react-native-circular-progress-indicator'

const OBTENER_ARCHIVOS_ALUMNO = gql`
  query obtenerArchivosAlumno($input: AlumnoIDInput!) {
    obtenerArchivosAlumno(input: $input) {
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
`;

const OBTENER_TAREA_ARCHIVO = gql`
    query obtenerTareaArchivo($input: TareaIDInput){
        obtenerTareaArchivo(input: $input){
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

const InfoEntregas = ({ route }) => {
    const navigation = useNavigation()
    const { alumnoAutor } = route.params
    const { data: archivosData, loading: archivosLoading, error: archivosError, refetch: archivoRefresh } = useQuery(OBTENER_ARCHIVOS_ALUMNO, {
        variables: {
            input: {
                autor: alumnoAutor.id,
                tareaAsignada: route.params.archivo.tareaAsignada
            }
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            archivoRefresh();
        }, [])
    );

    const { data: tareaData, loading: tareaLoading, error: tareaError, refetch: tareaRefresh } = useQuery(OBTENER_TAREA_ARCHIVO, {
        variables: {
            input: {
                tareaAsignada: route.params.archivo.tareaAsignada
            }
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            tareaRefresh();
        }, [])
    );

    //Para el CircleProgress
    function calcularTotalEntregas(tarea) {
        const fechaInicio = new Date(Number(tarea.fechaInicio));
        const fechaFinal = new Date(Number(tarea.fechaFinal));
        const diasRepetible = Number(tarea.diasRepetible) || 1; // Si no es repetible, será 1

        // Calcula la diferencia en días (incluyendo ambos extremos)
        const diffTime = fechaFinal - fechaInicio;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (tarea.repetible === 'Si' && diasRepetible > 0) {
            // Ejemplo: si inicia el 23 y termina el 1, y es cada 2 días, debe contar ambos extremos
            return Math.floor(diffDays / diasRepetible) + 1;
        } else {
            // Si no es repetible, solo una entrega
            return 1;
        }
    }
    const tarea = tareaData?.obtenerTareaArchivo;

    const totalEntregas = tarea ? calcularTotalEntregas(tarea) : 0;
    const entregasAlumno = archivosData?.obtenerArchivosAlumno?.length || 0;
    const porcentaje = totalEntregas > 0 ? Math.round((entregasAlumno / totalEntregas) * 100) : 0;
    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>

            <View style={{ alignItems: 'center' }}>
                <Text style={[globalStyles.tituloGrupo, { paddingBottom: 10 }]}>
                    Porcentaje de Entrega
                </Text>
                <CircularProgress
                    value={porcentaje}
                    valueSuffix='%'
                    activeStrokeColor='#4CAF50'
                    duration={1000}
                />
            </View>
            <View style={globalStyles.container}>
                <Text style={globalStyles.tituloGrupo}>
                    Entregas Totales de la Tarea: {totalEntregas}
                </Text>
                <Text style={globalStyles.tituloGrupo}>Entregas del Alumno: {entregasAlumno}</Text>
            </View>
            <ScrollView>
                {archivosData &&
                    archivosData.obtenerArchivosAlumno &&
                    archivosData.obtenerArchivosAlumno.map(archivo => (
                        <List.Item
                            key={archivo.id}
                            title={() => (
                                <View>
                                    <Text style={globalStyles.tituloGrupoItem}>
                                        Fecha Entrega: {new Date(Number(archivo.fechaEntregado)).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}
                            description={`Hora entregada: ${new Date(Number(archivo.fechaEntregado)).toLocaleTimeString()}`}
                            descriptionStyle={{ color: 'black' }}
                            left={props => <List.Icon {...props} icon="file-document-outline" color='black' />}
                            onPress={() => navigation.navigate("InfoIndividualEntrega", {
                                archivo,
                                alumnoAutor
                            })}
                        // Puedes agregar más props o acciones aquí
                        />
                    ))
                }
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: '20'
    },
});

export default InfoEntregas;
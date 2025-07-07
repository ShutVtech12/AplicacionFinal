import React from 'react'
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
import { List, Button, Text, TextInput, ActivityIndicator, MD2Colors, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery, useMutation } from '@apollo/client'
import CircularProgress from 'react-native-circular-progress-indicator'

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

const InformacionEntrega = ({ route }) => {
    const { archivo } = route.params
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

    const totalEntregas = 1
    const entregasAlumno = 1;
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
            <SafeAreaView>
                <View style={globalStyles.container}>
                    <Text style={globalStyles.tituloGrupo}>Contenido de la tarea</Text>
                    <Text style={globalStyles.contenidoGrupoItem}>Fecha Entregado: {new Date(Number(archivo.fechaEntregado)).toLocaleString()}</Text>
                </View>
                <ScrollView>
                    <TextInput
                        editable={false}
                        textColor='black'
                        keyboardType='default'
                        mode='outlined'
                        value={archivo.texto}
                        outlineColor='#FFB75E'
                        activeOutlineColor='#FFB75E'
                        theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                        style={[globalStyles.inputView, { height: 200, textAlignVertical: 'top' }]}
                        multiline={true}
                        numberOfLines={10}
                    />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaView>
    );
}


export default InformacionEntrega;
import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView, useColorScheme } from 'react-native'

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
import { List, Button, Text, ActivityIndicator, MD2Colors, Dialog, Portal, SegmentedButtons, Icon } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery } from '@apollo/client'
import CircularProgress from 'react-native-circular-progress-indicator'

const OBTENER_TAREAS_ALUMNO = gql`
    query obtenerTareasAlumno{
        obtenerTareasAlumno{
            id
            titulo
            descripcion
            fechaInicio
            fechaFinal
            repetible
            diasRepetible
        }
    }

`

const OBTENER_INFO_SOLO_ALUMNO = gql`
    query obtenerInfoSoloAlumno{
        obtenerInfoSoloAlumno{
            id
            nombre
            boleta
        }
    }

`

const OBTENER_ARCHIVOS = gql`
    query obtenerArchivo{
        obtenerArchivo{
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

const OBTENER_RACHA = gql`
    query obtenerRacha{
        obtenerRacha{
            id
            titulo
            fechaInicio
            diasConse
            autor
        }
    }
`


const TareasAlumno = () => {
    const navigation = useNavigation()

    //Apollo
    const { data: tareasData, loading: tareasLoading, error: tareasError, refetch: tareaAlumnoRefresh } = useQuery(OBTENER_TAREAS_ALUMNO)
    useFocusEffect(
        React.useCallback(() => {
            tareaAlumnoRefresh();
        }, [])
    );
    const { data: alumnoData, loading: alumnoLoading, error: alumnoError, refetch: infoRefresh } = useQuery(OBTENER_INFO_SOLO_ALUMNO)
    useFocusEffect(
        React.useCallback(() => {
            infoRefresh();
        }, [])
    );
    const { data: archivoData, loading: archivoLoading, error: archivoError, refetch: archivoRefresh } = useQuery(OBTENER_ARCHIVOS)
    useFocusEffect(
        React.useCallback(() => {
            archivoRefresh();
        }, [])
    );
    const { data: rachaData, loading: rachaLoading, error: rachaError, refetch: rachaRefresh } = useQuery(OBTENER_RACHA)
    useFocusEffect(
        React.useCallback(() => {
            rachaRefresh();
        }, [])
    );

    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [mensaje, setMensaje] = useState(null)

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

    function contarEntregasAlumno(tarea, archivos, alumnoId) {
        return archivos.filter(
            archivo => archivo.tareaAsignada === tarea.id && archivo.autor === alumnoId
        ).length;
    }

    const [value, setValue] = useState('Pendientes');
    const colorScheme = useColorScheme();

    //Para el modal
    const [modalVisible, setModalVisible] = useState(false)

    //Si apollo está consultando
    if (tareasLoading && alumnoLoading && archivoLoading) return <ActivityIndicator animating={true} color={MD2Colors.red800} />
    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <View style={globalStyles.containerAlumno}>
                <Icon
                    source="account-box"
                    color={'#4CAF50'}
                    size={40}
                />
                <Text style={{ fontSize: 20, alignContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    {alumnoData?.obtenerInfoSoloAlumno?.nombre ?? ''}
                </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
                {rachaData?.obtenerRacha
                    ? (
                        <Button
                            icon="clock-edit"
                            mode="text"
                            buttonColor="#4CAF50"
                            textColor='white'
                            onPress={() => navigation.navigate("ActualizarRecordatorio", { racha: rachaData.obtenerRacha })}
                        >
                            Administrar recordatorio
                        </Button>
                    )
                    : (
                        <Button
                            icon="clock-plus"
                            mode="text"
                            buttonColor="#FF9800"
                            textColor='black'
                            onPress={() => navigation.navigate("CrearRecordatorio")}
                        >
                            Crear recordatorio
                        </Button>
                    )
                }
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={globalStyles.tituloGrupo}>Total de Entregas</Text>
                <Text style={globalStyles.tituloGrupo}>{archivoData && archivoData.obtenerArchivo
                    ? archivoData.obtenerArchivo.length
                    : 0}</Text>
            </View>
            <SafeAreaView style={{ paddingVertical: 10 }}>
                <SegmentedButtons
                    icon={value}
                    value={value}
                    onValueChange={setValue}
                    buttons={[
                        {
                            value: 'Pendientes',
                            label: 'Pendientes',
                            labelStyle: {
                                color:
                                    value === 'Pendientes'
                                        ? (colorScheme === 'dark' ? 'white' : '#2196F3')
                                        : (colorScheme === 'dark' ? 'black' : 'black'),
                                fontWeight: 'bold'
                            }
                        },
                        {
                            value: 'Finalizadas',
                            label: 'Finalizadas',
                            labelStyle: {
                                color:
                                    value === 'Finalizadas'
                                        ? (colorScheme === 'dark' ? 'white' : '#4CAF50')
                                        : (colorScheme === 'dark' ? 'black' : 'black'),
                                fontWeight: 'bold'
                            }
                        }
                    ]}
                />
            </SafeAreaView>
            <ScrollView>
                {tareasData &&
                    tareasData.obtenerTareasAlumno.filter(tarea => {
                        // 1. No mostrar tareas cuya fecha de inicio es futura
                        const fechaInicio = new Date(Number(tarea.fechaInicio));
                        const fechaLimite = new Date(Number(tarea.fechaFinal));
                        const ahora = new Date();
                        if (fechaInicio > ahora) {
                            return false;
                        }

                        // 2. Lógica para SegmentedButtons
                        if (value === 'Pendientes') {
                            if (tarea.repetible === 'Si' || tarea.repetible === 'No') {
                                // Pendiente si la fecha límite aún no llega
                                return fechaLimite > ahora;
                            } else {
                                // Pendiente si NO tiene archivo entregado
                                const tieneArchivo = archivoData?.obtenerArchivo?.some(
                                    archivo => archivo.tareaAsignada === tarea.id
                                );
                                return !tieneArchivo;
                            }
                        } else if (value === 'Finalizadas') {
                            if (tarea.repetible === 'Si' || tarea.repetible === 'No') {
                                // Finalizada si la fecha límite ya pasó
                                return fechaLimite <= ahora;
                            } else {
                                // Finalizada si ya tiene archivo entregado
                                const tieneArchivo = archivoData?.obtenerArchivo?.some(
                                    archivo => archivo.tareaAsignada === tarea.id
                                );
                                return tieneArchivo;
                            }
                        }
                        return false;
                    }).map(tarea => (
                        <List.Item
                            key={tarea.id}
                            onPress={() => {
                                /*('Archivos entregados:', archivoData?.obtenerArchivo);
                                console.log('Alumno actual:', alumnoData?.obtenerInfoSoloAlumno?.id);
                                console.log('Tarea actual:', tarea.id);*/
                                // Busca si ya existe un archivo entregado hoy para esta tarea
                                const archivosAlumnoTarea = archivoData?.obtenerArchivo?.filter(archivo =>
                                    archivo.tareaAsignada === tarea.id &&
                                    archivo.autor === alumnoData?.obtenerInfoSoloAlumno?.id
                                ) || [];

                                const hoy = new Date();
                                const archivoHoy = archivosAlumnoTarea.find(archivo => {
                                    const fechaArchivo = new Date(Number(archivo.fechaEntregado));
                                    /*console.log('Comparando:', {
                                        fechaArchivo: fechaArchivo.toISOString(),
                                        hoy: hoy.toISOString(),
                                        añoIgualUTC: fechaArchivo.getUTCFullYear() === hoy.getUTCFullYear(),
                                        mesIgualUTC: fechaArchivo.getUTCMonth() === hoy.getUTCMonth(),
                                        diaIgualUTC: fechaArchivo.getUTCDate() === hoy.getUTCDate()
                                    });*/
                                    return (
                                        fechaArchivo.getFullYear() === hoy.getFullYear() &&
                                        fechaArchivo.getMonth() === hoy.getMonth() &&
                                        fechaArchivo.getDate() === hoy.getDate()
                                    );
                                });
                                //console.log("Archivo hoy: ", archivoHoy)

                                if (archivoHoy && tarea.repetible == 'Si') {
                                    // Aquí puedes mostrar un mensaje con Snackbar, Alert, etc.
                                    setMensaje('Ya entregaste esta tarea hoy.');
                                    setVisibleDialog(true)
                                    return;
                                } else if (archivoHoy && tarea.repetible == 'No') {
                                    setMensaje('Ya completaste esta tarea.');
                                    setVisibleDialog(true)
                                    return;
                                }

                                navigation.navigate("AgregarArchivo", {
                                    ...tarea
                                });
                            }}
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
                                    <Text style={globalStyles.contenidoGrupoItem}>Fecha de término:</Text>
                                    <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaFinal)).toLocaleDateString()}</Text>
                                    <Text style={globalStyles.contenidoGrupoItem}>Hora de término:</Text>
                                    <Text style={globalStyles.textNegro}>{new Date(Number(tarea.fechaFinal)).toLocaleTimeString()}</Text>
                                    <Text style={globalStyles.contenidoGrupoItem}>Repetible:</Text>
                                    <Text style={globalStyles.textNegro}>{tarea.repetible}</Text>
                                    <Text style={globalStyles.contenidoGrupoItem}>Días repetible:</Text>
                                    <Text style={globalStyles.textNegro}>{tarea.diasRepetible}</Text>
                                </View>
                            )}
                            left={props => <List.Icon {...props} icon="atom" color='black' />}
                            right={() => {
                                const totalEntregas = calcularTotalEntregas(tarea);
                                const entregasAlumno = contarEntregasAlumno(tarea, archivoData?.obtenerArchivo || [], alumnoData?.obtenerInfoSoloAlumno?.id);

                                const porcentaje = totalEntregas > 0 ? Math.round((entregasAlumno / totalEntregas) * 100) : 0;

                                return (
                                    <View style={{ width: 120 }}>
                                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 15 }}>
                                            {`Entregas: ${entregasAlumno}/${totalEntregas}`}
                                        </Text>
                                        <CircularProgress
                                            value={porcentaje}
                                            valueSuffix='%'
                                            activeStrokeColor='#4CAF50'
                                            duration={1000}
                                        />
                                    </View>
                                );
                            }}
                        />
                    ))}
                <View style={globalStyles.snackContent}>
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
                                <Button labelStyle={{ fontSize: 18, color: 'black' }} onPress={() => setVisibleDialog(false)}>Ok</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </View>
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

export default TareasAlumno;
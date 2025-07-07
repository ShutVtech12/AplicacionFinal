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
import { TextInput, Button, Snackbar, Text, Icon, Dialog, Switch, Portal, Checkbox } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import globalStyles from '../styles/global';
import DatePicker from 'react-native-date-picker'
import GradientButton from '../styles/gradientButton';
import { gql, useMutation, useQuery } from '@apollo/client'

const NUEVA_TAREA = gql`
    mutation nuevaTarea($input: TareaInput) {
        nuevaTarea(input: $input){
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
`;

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
const OBTENER_GRUPOS = gql`
    query obtenerGrupos{
        obtenerGrupos{
            id
            nombre
            grupo
        }
    }

`



const AgregarTarea = ({ route }) => {
    

    //Apollo
    const { data: gruposData, loading: gruposLoading, refetch } = useQuery(OBTENER_GRUPOS);
    console.log(gruposData)
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );
    const [nuevaTarea] = useMutation(NUEVA_TAREA, {
        update(cache, { data: { nuevaTarea } }) {
            if (!nuevaTarea) return;

            // Si nuevaTarea es un arreglo (por ejemplo, si creas varias tareas a la vez)
            const tareas = Array.isArray(nuevaTarea) ? nuevaTarea : [nuevaTarea];

            tareas.forEach(tarea => {
                try {
                    const dataExistente = cache.readQuery({
                        query: OBTENER_TAREAS,
                        variables: {
                            input: { grupoPertenece: tarea.grupoPertenece }
                        }
                    });

                    cache.writeQuery({
                        query: OBTENER_TAREAS,
                        variables: {
                            input: { grupoPertenece: tarea.grupoPertenece }
                        },
                        data: {
                            obtenerTareas: dataExistente && dataExistente.obtenerTareas
                                ? [...dataExistente.obtenerTareas, tarea]
                                : [tarea]
                        }
                    });
                } catch (e) {
                    // Si no hay datos previos en cache, simplemente escribe la nueva tarea
                    cache.writeQuery({
                        query: OBTENER_TAREAS,
                        variables: {
                            input: { grupoPertenece: tarea.grupoPertenece }
                        },
                        data: {
                            obtenerTareas: [tarea]
                        }
                    });
                }
            });
        }
    });

    //Para el checkbox
    const [checked, setChecked] = useState(false)
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    const toggleTodosLosGrupos = () => {
        if (
            gruposData?.obtenerGrupos &&
            gruposSeleccionados.length !== gruposData.obtenerGrupos.length
        ) {
            setGruposSeleccionados(gruposData.obtenerGrupos.map(g => g.id));
        } else {
            setGruposSeleccionados([]);
        }
    };
    const onToggleSwitch = () => {
        setChecked(prev => {
            const nuevoValor = !prev;
            repetibleDec(nuevoValor);
            return nuevoValor;
        });
    };
    const [desac, setDesac] = useState(true)
    const repetibleDec = (valor) => {
        if (valor) {
            setDesac(false);
            setRepe('Si');
        } else {
            setDesac(true);
            setRepe('No');
            setDiasRepe('0');
        }
    };

    // Función para combinar:
    function combinarFechaHora(fecha, hora) {
        const nuevaFecha = new Date(fecha);
        nuevaFecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
        return nuevaFecha;
    }

    const handleFechaChange = (nuevaFecha) => {
        setFecha(nuevaFecha);
    };

    const handleHoraChange = (nuevaHora) => {
        setHora(nuevaHora)
    }

    const handleFechaIniChange = (nuevaFecha) => {
        setFechaIni(nuevaFecha);
    };

    const handleHoraIniChange = (nuevaHora) => {
        setHoraIni(nuevaHora);
        // NO actualices la fecha aquí
    };

    //Fecha y hora utilizada para el DatePicker
    const [fecha, setFecha] = useState(new Date());
    const [hora, setHora] = useState(new Date());

    const [fechaIni, setFechaIni] = useState(new Date());
    const [horaIni, setHoraIni] = useState(new Date());

    //State del formulario
    const [titulo, setTitulo] = useState('')
    const [desc, setDesc] = useState('')
    const [repe, setRepe] = useState('No')
    const [diasRepe, setDiasRepe] = useState('0')
    const fechaInicioSeleccionada = combinarFechaHora(fechaIni, horaIni);
    const fechaFinalSeleccionada = combinarFechaHora(fecha, hora);

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

    //Validar y agregar tareas
    const handleSubmit = async () => {
        if (titulo === '' || desc === '' || repe === '' || diasRepe === '' || !fechaInicioSeleccionada || !fechaFinalSeleccionada) {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        if (gruposSeleccionados.length === 0) {
            setMensaje('Selecciona al menos un grupo');
            setVisibleDialog(true);
            return;
        }
        // Validar fechas
        const hoy = new Date();
        hoy.setSeconds(0, 0); // Ignora segundos y ms para la comparación

        if (fechaInicioSeleccionada < hoy) {
            setMensaje('La fecha y hora de inicio no puede ser anterior a la fecha y hora actual.');
            setVisibleDialog(true);
            return;
        }
        if (fechaFinalSeleccionada < hoy) {
            setMensaje('La fecha límite no puede ser anterior a la fecha y hora actual.');
            setVisibleDialog(true);
            return;
        }
        if (fechaFinalSeleccionada <= fechaInicioSeleccionada) {
            setMensaje('La fecha límite debe ser posterior a la fecha de inicio.');
            setVisibleDialog(true);
            return;
        }
        //Almacenarlo en la BD
        try {
            for (const grupoId of gruposSeleccionados) {
                await nuevaTarea({
                    variables: {
                        input: {
                            titulo,
                            descripcion: desc,
                            fechaInicio: fechaInicioSeleccionada.toISOString(),
                            fechaFinal: fechaFinalSeleccionada.toISOString(),
                            repetible: repe,
                            diasRepetible: diasRepe,
                            grupoPertenece: grupoId
                        }
                    }
                });
            }
            setMensaje('Tarea(s) creada(s) correctamente');
            setsnackbarVisible(true);
            setRedirigir(true);
        } catch (error) {
            console.log(error)
        }
    }

    //React navigation
    const navigation = useNavigation();

    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <ScrollView>
                <View style={globalStyles.contenido}>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="format-title"
                                color={'#2196F3'}
                                size={40}
                            />
                            <TextInput
                                label='Titulo'
                                textColor='black'
                                keyboardType='default'
                                mode='outlined'
                                outlineColor='#21DBF3'
                                activeOutlineColor='#2196F3'
                                theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                                style={globalStyles.inputBase}
                                onChangeText={texto => setTitulo(texto)}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="text-box-check-outline"
                                color={'#2196F3'}
                                size={40}
                            />
                            <TextInput
                                label='Descripción'
                                textColor='black'
                                keyboardType='default'
                                mode='outlined'
                                outlineColor='#21DBF3'
                                activeOutlineColor='#2196F3'
                                theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                                style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top' }]}
                                multiline={true}
                                numberOfLines={6}
                                onChangeText={texto => setDesc(texto)}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={{ paddingTop: 20 }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione el grupo o los grupos a asignar la tarea</Text>
                        </View>
                        {/* Opción "Todos los grupos" */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Checkbox
                                status={
                                    gruposData?.obtenerGrupos &&
                                        gruposSeleccionados.length === gruposData.obtenerGrupos.length
                                        ? 'checked'
                                        : 'unchecked'
                                }
                                onPress={toggleTodosLosGrupos}
                            />
                            <Text style={globalStyles.textNegro}>Todos los grupos</Text>
                        </View>
                        {/* Lista de grupos */}
                        {gruposData?.obtenerGrupos?.map(grupo => (
                            <View key={grupo.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Checkbox
                                    status={gruposSeleccionados.includes(grupo.id) ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        setGruposSeleccionados(prev =>
                                            prev.includes(grupo.id)
                                                ? prev.filter(id => id !== grupo.id)
                                                : [...prev, grupo.id]
                                        );
                                    }}
                                />
                                <Text style={globalStyles.textNegro}>{grupo.nombre}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={{ paddingTop: '20' }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione cuando iniciará la tarea</Text>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="calendar-range"
                                color={'#2196F3'}
                                size={40}
                            />
                            <View style={globalStyles.fechaContenedor}>
                                <DatePicker
                                    date={fechaIni}
                                    mode='date'
                                    locale='es'
                                    onDateChange={handleFechaIniChange}
                                    theme='light'
                                />
                            </View>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="clock-outline"
                                color={'#2196F3'}
                                size={40}
                            />
                            <View style={globalStyles.fechaContenedor}>
                                <DatePicker
                                    date={horaIni}
                                    mode='time'
                                    locale='es'
                                    onDateChange={handleHoraIniChange}
                                    theme='light'
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <View>
                            <Text style={globalStyles.containerLoginText}>¿Será repetible?</Text>
                        </View>
                        <Switch
                            value={checked}
                            onValueChange={onToggleSwitch}
                        />
                    </View>
                    <View style={globalStyles.divi}>
                            <Text style={{ color: 'black', fontSize: 18, textAlign: 'center' }}>
                                Ingrese la secuencia con la que se repetirá la tarea
                            </Text>
                            <Text style={{ color: 'black', fontSize: 18, textAlign: 'justify', paddingHorizontal: 20 }}>
                                Donde:
                            </Text>
                            <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20  }}>
                                1) Es todos los días.
                            </Text>
                            <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20  }}>
                                2) Es un día si y el otro no. Empezando en la fecha de inicio de la tarea.
                            </Text>
                            <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20  }}>
                                3) Es cada 3er día. Siendo la fecha de inicio de la tarea el primer día.
                            </Text>
                            <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20  }}>
                                n) ...Y así sucesivamente. 
                            </Text>
                            <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20  }}>
                                Siempre será la fecha de inicio de la tarea como primer día válido de entrega.
                            </Text>
                        </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="update"
                                color={'#2196F3'}
                                size={40}
                            />
                            <TextInput
                                disabled={desac}
                                label='Cada cuanto se va a repetir'
                                textColor='black'
                                mode='outlined'
                                keyboardType='numeric'
                                outlineColor='#21DBF3'
                                activeOutlineColor='#2196F3'
                                theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                                style={globalStyles.inputBase}
                                onChangeText={texto => setDiasRepe(texto)}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={{ paddingTop: '20' }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione fecha y hora límite</Text>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="calendar-range"
                                color={'#2196F3'}
                                size={40}
                            />
                            <View style={globalStyles.fechaContenedor}>
                                <DatePicker
                                    theme='light'
                                    date={fecha}
                                    mode='date'
                                    locale='es'
                                    onDateChange={handleFechaChange}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="clock-outline"
                                color={'#2196F3'}
                                size={40}
                            />
                            <View style={globalStyles.fechaContenedor}>
                                <DatePicker
                                    date={hora}
                                    mode='time'
                                    locale='es'
                                    onDateChange={handleHoraChange}
                                    theme='light'
                                />
                            </View>
                        </View>
                    </View>
                    <GradientButton
                        title="Agregar Tarea"
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
    },
})

export default AgregarTarea;
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
import { TextInput, Button, Snackbar, Text, Icon, Dialog, Switch, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import DatePicker from 'react-native-date-picker'
import GradientButton from '../styles/gradientButton';
import { gql, useMutation } from '@apollo/client'

const ACTUALIZAR_TAREA = gql`
    mutation actualizarTarea($id: ID!, $input: TareaInput) {
        actualizarTarea(id: $id, input: $input){
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

const Tarea = ({ route }) => {
    //Extrayendo los valores
    const { tarea } = route.params

    const [titulo, setTitulo] = useState(tarea.titulo || '')
    const [desc, setDesc] = useState(tarea.descripcion || '')
    const [repetible, setRepetible] = useState(tarea.repetible || '')
    const [diasRepe, setDiasRepe] = useState(tarea.diasRepetible || '')
    const [fechaInicial, setFechaInicial] = useState(tarea.fechaInicio || '')
    const [fecha, setFecha] = useState(new Date(Number(tarea.fechaFinal)));
    const [hora, setHora] = useState(new Date(Number(tarea.fechaFinal)));
    const [fechaIni, setFechaIni] = useState(new Date(Number(tarea.fechaInicio)));
    const [horaIni, setHoraIni] = useState(new Date(Number(tarea.fechaInicio)));

    //Apollo
    const [actualizarTarea] = useMutation(ACTUALIZAR_TAREA)
    const handleSubmit = async () => {
        //La fecha para la BD es fechaFormato
        const fechaFinal = combinarFechaHora(fecha, hora);
        const fechaInicio = combinarFechaHora(fechaIni, horaIni)
        const fechaInicioFormato = fechaInicio.toISOString()
        const fechaFormato = fechaFinal.toISOString();
        if (titulo === '' || desc === '' || repetible === '' || diasRepe === '' || fechaFormato === '') {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        // Validar fechas
        const hoy = new Date();
        hoy.setSeconds(0, 0); // Ignora segundos y ms para la comparación
        if (fechaInicio < hoy) {
            setMensaje('La fecha y hora de inicio no puede ser anterior a la fecha y hora actual.');
            setVisibleDialog(true);
            return;
        }
        if (fechaFinal < hoy) {
            setMensaje('La fecha de término no puede ser anterior a la fecha y hora actual.');
            setVisibleDialog(true);
            return;
        }
        if (fechaFinal <= fechaInicio) {
            setMensaje('La fecha término debe ser posterior a la fecha de inicio.');
            setVisibleDialog(true);
            return;
        }
        try {
            const { data } = await actualizarTarea({
                variables: {
                    id: tarea.id,
                    input: {
                        titulo: titulo,
                        descripcion: desc,
                        fechaInicio: fechaInicioFormato,
                        fechaFinal: fechaFormato,
                        repetible: repetible,
                        diasRepetible: diasRepe,
                        grupoPertenece: route.params.idGrupo
                    }
                }
            })
            setMensaje('Tarea actualizada correctamente')
            setsnackbarVisible(true)
            setRedirigir(true)
        } catch (error) {
            console.log(error)
        }
    }


    //Para el checkbox
    const [checked, setChecked] = useState((tarea.repetible || 'No') === 'Si');
    const onToggleSwitch = () => {
        setChecked(prev => {
            const nuevoValor = !prev;
            setRepetible(nuevoValor ? 'Si' : 'No');
            setDesac(!nuevoValor);
            if (!nuevoValor) setDiasRepe('0');
            return nuevoValor;
        });
    };
    const [desac, setDesac] = useState((tarea.repetible || 'No') !== 'Si');
    const repetibleDec = (valor) => {
        if (valor) {
            setDesac(false);
            setRepetible('Si');
        } else {
            setDesac(true);
            setRepetible('No');
            setDiasRepe('0');
        }
    };

    // Función para combinar:
    function combinarFechaHora(fecha, hora) {
        const nuevaFecha = new Date(fecha);
        nuevaFecha.setHours(hora.getHours());
        nuevaFecha.setMinutes(hora.getMinutes());
        nuevaFecha.setSeconds(hora.getSeconds());
        nuevaFecha.setMilliseconds(hora.getMilliseconds());
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
                                value={titulo}
                                onChangeText={setTitulo}
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
                                value={desc}
                                onChangeText={setDesc}
                            />
                        </View>
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
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="update"
                                color={'#2196F3'}
                                size={40}
                            />
                            <TextInput
                                disabled={desac}
                                label='Cada cuanto se repitirá'
                                textColor='black'
                                mode='outlined'
                                keyboardType='numeric'
                                outlineColor='#21DBF3'
                                activeOutlineColor='#2196F3'
                                theme={{ colors: { primary: '#2196F3', onSurfaceVariant: 'black' } }}
                                style={globalStyles.inputBase}
                                value={diasRepe}
                                onChangeText={setDiasRepe}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={{ paddingTop: '20' }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione fecha y hora de término</Text>
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
                                    date={fecha}
                                    mode='date'
                                    locale='es'
                                    onDateChange={handleFechaChange}
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
                        title="Actualizar Tarea"
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
                                style={globalStyles.snackBarWarning}
                            />
                            <Dialog.Title style={styles.title}>Advertencia</Dialog.Title>
                            <Dialog.Content>
                                <Text variant="bodyMedium">{mensaje}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => setVisibleDialog(false)}>Ok</Button>
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
export default Tarea;

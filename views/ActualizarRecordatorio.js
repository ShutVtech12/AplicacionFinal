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
import { Button, Text, TextInput, Dialog, Portal, Snackbar, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import DatePicker from 'react-native-date-picker'
import GradientButton from '../styles/gradientButton';
import { gql, useMutation } from '@apollo/client'
import PushNotification from 'react-native-push-notification';

const ACTUALIZAR_RACHA = gql`
    mutation actualizarRacha($id: ID!, $input: RachaInput) {
        actualizarRacha(id: $id, input: $input){
            id
            titulo
            fechaInicio
            diasConse
            autor
        }
    }
`


const ActualizarRecordatorio = ({ route }) => {
    const navigation = useNavigation();
    function programarRecordatorios({ titulo, fechaInicio, diasConse }) {
        const dias = parseInt(diasConse, 10);
        const fechaBase = new Date(Number(fechaInicio));
        for (let i = 0; i < 30; i++) {
            const fechaNotificacion = new Date(fechaBase);
            fechaNotificacion.setDate(fechaBase.getDate() + i * dias);
            if (fechaNotificacion < new Date()) continue;
            PushNotification.localNotificationSchedule({
                channelId: "recordatorios",
                title: titulo,
                message: "¡Es hora de continuar!",
                date: fechaNotificacion,
                allowWhileIdle: true,
                repeatType: 'none',
            });
        }
    }
    const { racha } = route.params
    //console.log(racha)
    //Apollo
    const [actualizarRacha] = useMutation(ACTUALIZAR_RACHA)

    //Fecha y hora utilizada para el DatePicker
    const [fecha, setFecha] = useState(new Date());
    const [hora, setHora] = useState(new Date());

    // Función para combinar:
    function combinarFechaHora(fecha, hora) {
        const nuevaFecha = new Date(fecha);
        nuevaFecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
        return nuevaFecha;
    }

    const handleFechaIniChange = (nuevaFecha) => {
        setFechaIni(nuevaFecha);
    };

    const handleHoraIniChange = (nuevaHora) => {
        setHoraIni(nuevaHora);
        // NO actualices la fecha aquí
    };

    //States del formulario
    const [titulo, setTitulo] = useState(racha.titulo)
    const [fechaIni, setFechaIni] = useState((new Date(Number(racha.fechaInicio))));
    const [horaIni, setHoraIni] = useState((new Date(Number(racha.fechaInicio))));
    const [diasRepe, setDiasRepe] = useState(racha.diasConse)
    const fechaInicioSeleccionada = combinarFechaHora(fechaIni, horaIni);
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

    //Validar y agregar recordatorio
    const handleSubmit = async () => {
        if (titulo === '' || diasRepe === '' || !fechaInicioSeleccionada) {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        // Validar fechas
        const hoy = new Date();
        hoy.setSeconds(0, 0); // Ignora segundos y ms para la comparación

        if (fechaInicioSeleccionada < hoy) {
            setMensaje('La fecha de inicio no puede ser anterior a la fecha actual.');
            setVisibleDialog(true);
            return;
        }
        //Almacenarlo en la BD
        try {
            const { data } = await actualizarRacha({
                variables: {
                    id: racha.id,
                    input: {
                        titulo: titulo,
                        fechaInicio: fechaInicioSeleccionada,
                        diasConse: diasRepe
                    }
                }
            })
            PushNotification.cancelAllLocalNotifications();
            programarRecordatorios({
                titulo,
                fechaInicio: fechaInicioSeleccionada.getTime(),
                diasConse: diasRepe,
            });
            setMensaje('Recordatorio actualizado correctamente');
            setsnackbarVisible(true);
            setRedirigir(true);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <ScrollView>
                <View style={globalStyles.contenido}>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="format-title"
                                color={'#4CAF50'}
                                size={40}
                            />
                            <TextInput
                                value={titulo}
                                textColor='black'
                                keyboardType='default'
                                mode='outlined'
                                outlineColor='#FFB75E'
                                activeOutlineColor='#FFB75E'
                                theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                style={globalStyles.inputBase}
                                onChangeText={texto => setTitulo(texto)}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <Text style={{ color: 'black', fontSize: 18, textAlign: 'center' }}>
                            Ingrese la secuencia con la que se repetirá el recordatorio
                        </Text>
                        <Text style={{ color: 'black', fontSize: 18, textAlign: 'justify', paddingHorizontal: 20 }}>
                            Donde:
                        </Text>
                        <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20 }}>
                            1) Es todos los días.
                        </Text>
                        <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20 }}>
                            2) Es un día si y el otro no. Empezando el día de la creación del recordatorio.
                        </Text>
                        <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20 }}>
                            3) Es cada 3er día. Siendo el día de la creación del recordatorio el primer día.
                        </Text>
                        <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20 }}>
                            n)...Y así sucesivamente.
                        </Text>
                        <Text style={{ color: 'black', fontSize: 15, textAlign: 'justify', paddingHorizontal: 20 }}>
                            Siempre será la fecha de creación como primer día en que se le notificará.
                        </Text>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="update"
                                color={'#4CAF50'}
                                size={40}
                            />
                            <TextInput
                                value={diasRepe}
                                textColor='black'
                                mode='outlined'
                                keyboardType='numeric'
                                outlineColor='#FFB75E'
                                activeOutlineColor='#FFB75E'
                                theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                style={globalStyles.inputBase}
                                onChangeText={texto => setDiasRepe(texto)}
                            />
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={{ paddingTop: '20' }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione cuando inciará</Text>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="calendar-range"
                                color={'#4CAF50'}
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
                        <View style={{ paddingTop: '20' }}>
                            <Text style={globalStyles.containerLoginText}>Seleccione a qué hora será el recordatorio</Text>
                        </View>
                    </View>
                    <View style={globalStyles.divi}>
                        <View style={globalStyles.containerLogin}>
                            <Icon
                                source="clock-outline"
                                color={'#4CAF50'}
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
                    <GradientButton
                        title="Actualizar Recordatorio"
                        onPress={() => handleSubmit()}
                        //Naranja
                        colores={['#4CAF50', '#21DBF3']}
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
    )
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
    },
})

export default ActualizarRecordatorio;
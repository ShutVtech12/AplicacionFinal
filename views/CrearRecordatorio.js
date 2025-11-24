import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView, PermissionsAndroid, Platform, Alert, InteractionManager } from 'react-native'

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

const NUEVA_RACHA = gql`
    mutation nuevaRacha($input: RachaInput) {
        nuevaRacha(input: $input){
            id
            titulo
            fechaInicio
            diasConse
            autor
        }
    }
`;

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

const CrearRecordatorio = () => {
    const navigation = useNavigation();
    function combinarFechaHora(fecha, hora) {
        const year = fecha.getFullYear();
        const month = fecha.getMonth();
        const day = fecha.getDate();
        const hours = hora.getHours();
        const minutes = hora.getMinutes();
        return new Date(year, month, day, hours, minutes, 0, 0);
    }
    function programarRecordatorios({ titulo, fechaInicio, diasConse }) {
        const dias = parseInt(diasConse, 10);
        const fechaBase = new Date(Number(fechaInicio)); // Asegúrate que sea un Date

        for (let i = 0; i < 30; i++) { // Por ejemplo, programa para 30 repeticiones máximas
            const fechaNotificacion = new Date(fechaBase);
            fechaNotificacion.setDate(fechaBase.getDate() + i * dias);

            // Si la fecha ya pasó, no la programes
            if (fechaNotificacion < new Date()) continue;

            PushNotification.localNotificationSchedule({
                channelId: "recordatorios",
                title: titulo,
                message: "¡Es hora de continuar!",
                date: fechaNotificacion,
                allowWhileIdle: true,
                repeatType: 'none', // No uses repeatType, ya que tú controlas la frecuencia
            });
        }
    }
    function ensureNotificationChannel() {
        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: "recordatorios",
                    channelName: "Recordatorios",
                    channelDescription: "Canal para recordatorios programados",
                    importance: 4,
                    vibrate: true,
                },
                (created) => console.log('createChannel recordatorios:', created)
            );
        }
    }

    async function solicitarPermisoNotificaciones() {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                try {
                    // Primero checar
                    const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                    if (already) return true;

                    // Pedir permiso en respuesta a gesto del usuario
                    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                    return result === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn('Permissions request failed:', err);
                    // Si ocurre el error "not attached to an Activity", informar al usuario y devolver false
                    Alert.alert(
                        'Permiso requerido',
                        'No se pudo solicitar el permiso de notificaciones desde la aplicación. Por favor activa las notificaciones en los ajustes del sistema.',
                        [{ text: 'Ok' }]
                    );
                    return false;
                }
            }
            return true;
        } else {
            // iOS
            try {
                const res = await PushNotification.requestPermissions();
                // res puede ser objeto o booleano según implementación
                return !!(res && (res.alert || res.alert === true));
            } catch (err) {
                console.warn('iOS request permissions error:', err);
                return false;
            }
        }
    }
    //Apollo
    const [nuevaRacha] = useMutation(NUEVA_RACHA, {
        update(cache, { data: { nuevaRacha } }) {
            let obtenerRacha = [];
            try {
                const data = cache.readQuery({ query: OBTENER_RACHA });
                if (data && data.obtenerRacha) {
                    obtenerRacha = data.obtenerRacha;
                }
            } catch (e) {
                // Si no hay cache, lo dejamos como []
            }
            cache.writeQuery({
                query: OBTENER_RACHA,
                data: { obtenerRacha: nuevaRacha }
            });
        }
    });

    // Fecha y hora utilizadas por los DatePicker (solo usamos fechaIni / horaIni)
    // Eliminadas variables no usadas `fecha` / `hora`

    const handleFechaIniChange = (nuevaFecha) => setFechaIni(nuevaFecha);
    const handleHoraIniChange = (nuevaHora) => setHoraIni(nuevaHora);

    //States del formulario
    const [titulo, setTitulo] = useState('')
    const [fechaIni, setFechaIni] = useState(new Date());
    const [horaIni, setHoraIni] = useState(new Date());
    const [diasRepe, setDiasRepe] = useState('')
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
        // validaciones previas...
        // pedir permiso primero (en el hilo UI, en respuesta al onPress)
        const permiso = await solicitarPermisoNotificaciones();
        // opcional: si quieres guardar aunque no haya permiso, continúa; si no, retorna
        if (!permiso) {
            // Puedes decidir guardar igualmente o pedir al usuario que active permiso
            // aquí solo mostramos mensaje y procedemos a guardar sin programar notifs
            console.log('Permiso no concedido, se guardará el recordatorio pero no se programarán notificaciones.');
        }
        if (titulo === '' || diasRepe === '' || !fechaInicioSeleccionada) {
            //Mostrar un error
            setMensaje('Todos los campos son obligatorios')
            setVisibleDialog(true)
            return;
        }
        // validar diasRepe
        const diasNum = parseInt(diasRepe, 10);
        if (isNaN(diasNum) || diasNum <= 0) {
            setMensaje('Ingrese una secuencia válida (número mayor que 0).');
            setVisibleDialog(true);
            return;
        }
        // Validar fechas
        const ahora = new Date();
        const TOLERANCIA_MS = 15 * 1000; // 15 segundos (ajusta si quieres)
        const nowMs = ahora.getTime();
        const inicioMs = fechaInicioSeleccionada.getTime();

        if (inicioMs < nowMs - TOLERANCIA_MS) {
            setMensaje('La fecha de inicio no puede ser anterior a fecha la fecha actual.');
            setVisibleDialog(true);
            return;
        }
        //Almacenarlo en la BD
        try {
            await nuevaRacha({
                variables: {
                    input: {
                        titulo: titulo,
                        fechaInicio: fechaInicioSeleccionada.toISOString(),
                        diasConse: diasRepe,
                    }
                }
            });
            // programar solo si hay permiso
            if (permiso) {
                // Small safety: ensure scheduling runs after UI interactions
                InteractionManager.runAfterInteractions(() => {
                    programarRecordatorios({
                        titulo,
                        fechaInicio: fechaInicioSeleccionada.getTime(),
                        diasConse: parseInt(diasRepe, 10),
                    });
                });
            }
            setMensaje('Recordatorio creado correctamente');
            setsnackbarVisible(true);
            setRedirigir(true);
        } catch (error) {
            console.log('Error al crear recordatorio:', error);
            setMensaje('Error al crear recordatorio. Revisa la consola.');
            setVisibleDialog(true);
        }
    }

    function ensureNotificationChannel() {
        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: "recordatorios",
                    channelName: "Recordatorios",
                    channelDescription: "Canal para recordatorios programados",
                    importance: 4,
                    vibrate: true,
                },
                (created) => console.log('createChannel recordatorios:', created)
            );
        }
    }
    // Llama a ensureNotificationChannel() justo antes de programar o en useEffect al montar

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
                                label='Titulo'
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
                                label='Cada cuanto se va a repetir'
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
                        title="Crear Recordatorio"
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

export default CrearRecordatorio;
import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView, PermissionsAndroid, Platform } from 'react-native'
import { TextInput, Button, Text, Icon, Dialog, Portal, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';
import { gql, useMutation, useQuery } from '@apollo/client'
import LottieView from 'lottie-react-native';

//Para cambiar el estado, !tarea.estado
const NUEVA_ARCHIVO = gql`
mutation nuevoArchivo($input: ArchivoInput, $estado: Boolean) {
    nuevoArchivo(input: $input, estado: $estado){
        id
        texto
        fechaEntregado
        estado
        autor
        tareaAsignada
        archivoUrl
        tipoArchivo
    }
}`;



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
}`



const AgregarArchivo = ({ route }) => {
    const [cargando, setCargando] = useState(false);
    //React navigation
    const navigation = useNavigation();
    //state del formulario
    const [desc, setDesc] = useState('')
    const [estadoFinal, setEstado] = useState(false)
    //Apollo
    const [nuevoArchivo] = useMutation(NUEVA_ARCHIVO, {
        update(cache, { data: { nuevoArchivo } }) {
            const { obtenerArchivo } = cache.readQuery({ query: OBTENER_ARCHIVOS })
            cache.writeQuery({
                query: OBTENER_ARCHIVOS,
                data: { obtenerArchivo: obtenerArchivo.concat([nuevoArchivo]) }
            })
        }
    })
    const { data: archivosData, refetch } = useQuery(OBTENER_ARCHIVOS);
    const archivosEntregados = archivosData?.obtenerArchivo || [];
    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [mensaje, setMensaje] = useState(null)

    const handleSubmit = async () => {
        if (cargando) {
            return;
        }
        if (desc === '' || desc.length < 25) {
            setMensaje('Tu tarea no puede ser vacia y debe contener más de 25 caracteres')
            setVisibleDialog(true)
            return
        }
        if (checked == true && archivoUrl.length < 5) {
            setMensaje('Tu link de la foto está vacio o es incorrecto')
            setVisibleDialog(true)
            return
        }

        setCargando(true);
        try {
            /*let urlSubida = archivoUrl;
            // Si hay archivo seleccionado y aún no se ha subido
            if (archivoSeleccionado && !archivoUrl) {
            urlSubida = await uploadToCloudinary(archivoSeleccionado);
            setArchivoUrl(urlSubida);
            }
            // Optimiza la URL antes de guardar
            const urlOptimizada = optimizarUrlCloudinary(urlSubida, tipoArchivo);*/
            const { data } = await nuevoArchivo({
                variables: {
                    input: {
                        texto: desc,
                        tareaAsignada: route.params.id,
                        archivoUrl: archivoUrl,
                        tipoArchivo: tipoArchivo
                    },
                    estado: !estadoFinal
                }
            })
            await refetch();
            setMensaje(data)
            setShowFireworks(true);
            setTimeout(() => {
                setShowFireworks(false);
                setCargando(false);
                navigation.goBack();
            }, 2500);
        } catch (error) {
            console.log(error)
            setCargando(false);
        }
    }
    //Extrayendo los valores
    const fechaActual = new Date()
    const [diasRepe, setDiasRepe] = useState(route.params.diasRepetible || '')
    const [fechaFin, setFechaFin] = useState(new Date(Number(route.params.fechaFinal)));
    const [fechaCre, setFechaCre] = useState(new Date(Number(route.params.fechaInicio)));
    let bandera
    const esMismoDia = (actual, creado, final) => {
        if (
            actual.getUTCFullYear() === creado.getUTCFullYear() &&
            actual.getUTCMonth() === creado.getUTCMonth() &&
            actual.getUTCDate() === creado.getUTCDate()
        ) {
            //console.log("Es el mismo dia, verificando con la fecha limite")
            if (
                actual.getUTCFullYear() === final.getUTCFullYear() &&
                actual.getUTCMonth() === final.getUTCMonth() &&
                actual.getUTCDate() === final.getUTCDate()
            ) {
                //console.log(actual <= final)
                //console.log("La fecha actual es el mismo día que la fecha limite, verficando hora")
                if ((actual.getTime() <= final.getTime())) {
                    //console.log("la actual es menor o igual a final")
                    return true
                } else {
                    bandera = "Ya no puedes entregar esta tarea"
                    return false
                }
            }
        } else {
            return false
        }
    }

    const cumpleRepeticion = (actual, creado, dias, final) => {
        // 1. Verificación universal de la fecha límite (usando UTC)
        if (actual.getTime() > final.getTime()) {
            bandera = "Ya se pasó de la fecha límite estipulada";
            return false;
        }

        // 2. Cálculo de días transcurridos de forma universal (usando UTC)
        const msPorDia = 1000 * 60 * 60 * 24;
        // Se obtienen los milisegundos de la medianoche de la fecha actual y de la fecha de creación en UTC.
        // Esto asegura que la diferencia en 'días' no se vea afectada por la hora local.
        const actualUTC = Date.UTC(actual.getUTCFullYear(), actual.getUTCMonth(), actual.getUTCDate());
        const creadoUTC = Date.UTC(creado.getUTCFullYear(), creado.getUTCMonth(), creado.getUTCDate());
        const diferenciaMs = actualUTC - creadoUTC;
        const pasados = Math.floor(diferenciaMs / msPorDia); // Días enteros UTC pasados
        // 3. Validación de la periodicidad
        if (pasados % Number(dias) === 0) {
            // También debe evitar que la tarea se entregue el día 0, a menos que sea la regla.
            // Si 'pasados' es 0 (mismo día de creación), y el día de repetición es '1' (diario), esto será True.
            // Si la intención es que se entregue *a partir* del día N (ej: día 1, 2, 3...) y no el día 0,
            // la condición debe ser: pasados > 0 && pasados % Number(dias) === 0
            if (pasados === 0 && Number(dias) === 1) {
                // Permite la entrega el mismo día si es una tarea diaria.
                return true;
            } else if (pasados > 0 && pasados % Number(dias) === 0) {
                // Permite la entrega en días 1, 2, 3, etc., dependiendo de la repetición.
                return true;
            } else if (pasados === 0) {
                // Si pasados es 0 (mismo día de creación) y dias > 1 (ej: cada 2 días), no debe permitir la entrega
                bandera = "Aún no es tiempo de entregar esta tarea (Día de inicio)";
                return false;
            }
        } else {
            bandera = "Aún no es tiempo de entregar esta tarea";
            return false;
        }
    }

    //Para escoger archivos-------------------------------------------------------------------------------------------
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [archivoUrl, setArchivoUrl] = useState('');
    console.log("URL: ", archivoUrl.length)
    const [tipoArchivo, setTipoArchivo] = useState('sin');
    const [checked, setChecked] = useState(false)
    const onToggleSwitch = () => {
        setChecked(prev => {
            const nuevoValor = !prev;
            fotoDec(nuevoValor);
            return nuevoValor;
        });
    };
    const [desac, setDesac] = useState(true)
    const fotoDec = (valor) => {
        if (valor) {
            setDesac(false);
            setTipoArchivo('sin');
            console.log(desac)
        } else {
            setDesac(true);
            setTipoArchivo('Foto');
            console.log(desac)
        }
    };

    //-------------------------------------------------------------------------------------------------------------------------------------------------------

    if (route.params.repetible === 'No') {
        if (fechaActual >= fechaCre && fechaActual <= fechaFin) {
            // Permitir entrega normalmente
            return (
                <SafeAreaView style={globalStyles.safe}>
                    <ScrollView>
                        <View style={globalStyles.contenedorNormal}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={globalStyles.nombreUsuario}>Descripción:</Text>
                            </View>
                            <View>
                                <Text style={globalStyles.textoContenido}>{route.params.descripcion}</Text>
                            </View>
                            <View>
                                <View style={globalStyles.divi}>
                                    <View style={globalStyles.containerLogin}>
                                        <Icon
                                            source="text-box-check-outline"
                                            color={'#4CAF50'}
                                            size={40}
                                        />
                                        <TextInput
                                            label='Escribe aquí'
                                            textColor='black'
                                            keyboardType='default'
                                            mode='outlined'
                                            outlineColor='#FFB75E'
                                            activeOutlineColor='#FFB75E'
                                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                            style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top' }]}
                                            multiline={true}
                                            numberOfLines={10}
                                            onChangeText={texto => setDesc(texto)}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                        <View>
                                            <Text style={globalStyles.containerLoginText}>¿Subirá Link de Foto?</Text>
                                        </View>
                                        <Switch
                                            value={checked}
                                            onValueChange={onToggleSwitch}
                                        />
                                    </View>
                                    <View style={globalStyles.divi}>
                                        <View style={globalStyles.containerLogin}>
                                            <Icon
                                                source="link-box-variant"
                                                color={'#4CAF50'}
                                                size={40}
                                            />
                                            <TextInput
                                                disabled={desac}
                                                label='Link de su foto'
                                                textColor='black'
                                                keyboardType='default'
                                                mode='outlined'
                                                outlineColor='#FFB75E'
                                                activeOutlineColor='#FFB75E'
                                                theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                                style={globalStyles.inputBase}
                                                onChangeText={texto => setArchivoUrl(texto)}
                                            />
                                        </View>
                                    </View>
                                    <GradientButton
                                        title="Entregar Tarea"
                                        onPress={() => handleSubmit()}
                                        colores={['#6CBF84', '#4CAF50']}
                                    />
                                </View>
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
                            </View>
                            {showFireworks && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                    flex: 1
                                }}>
                                    <LottieView
                                        source={require('../assets/fireworks.json')}
                                        autoPlay
                                        loop={false}
                                        style={{ width: 300, height: 300 }}
                                    />
                                    <Text style={{ color: '#4CAF50', fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>
                                        ¡Tarea Entregada!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            )
        } else {
            // Fuera de rango, muestra advertencia
            return (
                <SafeAreaView style={globalStyles.safe}>
                    <ScrollView>
                        <View style={globalStyles.contenedorNormal}>
                            <Text style={globalStyles.nombreUsuario}>Descripción:</Text>
                            <Text style={globalStyles.textoContenido}>{route.params.descripcion}</Text>
                            <View style={globalStyles.snackContent}>
                                <Portal>
                                    <Dialog
                                        visible={true}
                                        onDismiss={() => navigation.goBack()}
                                        style={globalStyles.snackBarWarning}
                                    >
                                        <Dialog.Icon icon="alert" color='black' style={globalStyles.snackBarWarning} />
                                        <Dialog.Title style={styles.title}>Advertencia</Dialog.Title>
                                        <Dialog.Content>
                                            <Text style={globalStyles.textNegro} variant="bodyMedium">
                                                Fuera del periodo de entrega.
                                            </Text>
                                        </Dialog.Content>
                                        <Dialog.Actions>
                                            <Button labelStyle={{ fontSize: 18 }} onPress={() => navigation.goBack()}>Ok</Button>
                                        </Dialog.Actions>
                                    </Dialog>
                                </Portal>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            );
        }
    }
    if (esMismoDia(fechaActual, fechaCre, fechaFin) === true) {
        return (
            <SafeAreaView style={globalStyles.safe}>
                <ScrollView>
                    <View style={globalStyles.contenedorNormal}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={globalStyles.nombreUsuario}>Descripción:</Text>
                        </View>
                        <View>
                            <Text style={globalStyles.textoContenido}>{route.params.descripcion}</Text>
                        </View>
                        <View>
                            <View style={globalStyles.divi}>
                                <View style={globalStyles.containerLogin}>
                                    <Icon
                                        source="text-box-check-outline"
                                        color={'#4CAF50'}
                                        size={40}
                                    />
                                    <TextInput
                                        label='Escribe aquí'
                                        textColor='black'
                                        keyboardType='default'
                                        mode='outlined'
                                        outlineColor='#FFB75E'
                                        activeOutlineColor='#FFB75E'
                                        theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                        style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top' }]}
                                        multiline={true}
                                        numberOfLines={10}
                                        onChangeText={texto => setDesc(texto)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <View>
                                        <Text style={globalStyles.containerLoginText}>¿Subirá Link de Foto?</Text>
                                    </View>
                                    <Switch
                                        value={checked}
                                        onValueChange={onToggleSwitch}
                                    />
                                </View>
                                <View style={globalStyles.divi}>
                                    <View style={globalStyles.containerLogin}>
                                        <Icon
                                            source="link-box-variant"
                                            color={'#4CAF50'}
                                            size={40}
                                        />
                                        <TextInput
                                            disabled={desac}
                                            label='Link de su foto'
                                            textColor='black'
                                            keyboardType='default'
                                            mode='outlined'
                                            outlineColor='#FFB75E'
                                            activeOutlineColor='#FFB75E'
                                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                            style={globalStyles.inputBase}
                                            onChangeText={texto => setArchivoUrl(texto)}
                                        />
                                    </View>
                                </View>
                                <GradientButton
                                    title="Entregar Tarea"
                                    onPress={() => handleSubmit()}
                                    colores={['#6CBF84', '#4CAF50']}
                                />
                            </View>
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
                        </View>
                        {showFireworks && (
                            <View style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10,
                                flex: 1
                            }}>
                                <LottieView
                                    source={require('../assets/fireworks.json')}
                                    autoPlay
                                    loop={false}
                                    style={{ width: 300, height: 300 }}
                                />
                                <Text style={{ color: '#4CAF50', fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>
                                    ¡Tarea Entregada!
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
        //-------------------------------------------------------------------------------------------------------------------------------------------------------
    } if (cumpleRepeticion(fechaActual, fechaCre, diasRepe, fechaFin) === true) {
        return (
            <SafeAreaView style={globalStyles.safe}>
                <ScrollView>
                    <View style={globalStyles.contenedorNormal}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={globalStyles.nombreUsuario}>Descripción:</Text>
                        </View>
                        <View>
                            <Text style={globalStyles.textoContenido}>{route.params.descripcion}</Text>
                        </View>
                        <View>
                            <View style={globalStyles.divi}>
                                <View style={globalStyles.containerLogin}>
                                    <Icon
                                        source="text-box-check-outline"
                                        color={'#4CAF50'}
                                        size={40}
                                    />
                                    <TextInput
                                        textColor='black'
                                        label='Escribe aquí'
                                        keyboardType='default'
                                        mode='outlined'
                                        outlineColor='#FFB75E'
                                        activeOutlineColor='#FFB75E'
                                        theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                        style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top' }]}
                                        multiline={true}
                                        numberOfLines={10}
                                        onChangeText={texto => setDesc(texto)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <View>
                                        <Text style={globalStyles.containerLoginText}>¿Subirá Link de Foto?</Text>
                                    </View>
                                    <Switch
                                        value={checked}
                                        onValueChange={onToggleSwitch}
                                    />
                                </View>
                                <View style={globalStyles.divi}>
                                    <View style={globalStyles.containerLogin}>
                                        <Icon
                                            source="link-box-variant"
                                            color={'#4CAF50'}
                                            size={40}
                                        />
                                        <TextInput
                                            disabled={desac}
                                            label='Link de su foto'
                                            textColor='black'
                                            keyboardType='default'
                                            mode='outlined'
                                            outlineColor='#FFB75E'
                                            activeOutlineColor='#FFB75E'
                                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                            style={globalStyles.inputBase}
                                            onChangeText={texto => setArchivoUrl(texto)}
                                        />
                                    </View>
                                </View>
                                <GradientButton
                                    title="Entregar Tarea"
                                    onPress={() => handleSubmit()}
                                    colores={['#6CBF84', '#4CAF50']}
                                />
                            </View>
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
                        </View>
                        {showFireworks && (
                            <View style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10,
                                flex: 1
                            }}>
                                <LottieView
                                    source={require('../assets/fireworks.json')}
                                    autoPlay
                                    loop={false}
                                    style={{ width: 300, height: 300 }}
                                />
                                <Text style={{ color: '#4CAF50', fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>
                                    ¡Tarea Entregada!
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
        //Si cuando el usuario ingreso es de acuerdo a la repeticion de la tarea
    } else {
        return (
            <SafeAreaView style={globalStyles.safe}>
                <ScrollView>
                    <View style={globalStyles.contenedorNormal}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={globalStyles.nombreUsuario}>Descripción:</Text>
                        </View>
                        <View>
                            <Text style={globalStyles.textoContenido}>{route.params.descripcion}</Text>
                        </View>
                        <View>
                            <View style={globalStyles.divi}>
                                <View style={globalStyles.containerLogin}>
                                    <Icon
                                        source="text-box-check-outline"
                                        color={'#4CAF50'}
                                        size={40}
                                    />
                                    <TextInput
                                        label='Escribe aquí'
                                        textColor='black'
                                        keyboardType='default'
                                        mode='outlined'
                                        outlineColor='#FFB75E'
                                        activeOutlineColor='#FFB75E'
                                        numberOfLines={10}
                                        theme={{
                                            colors: {
                                                primary: '#FFB75E',
                                                onSurfaceVariant: 'black'
                                            }
                                        }}
                                        style={globalStyles.inputBase}
                                        onChangeText={texto => setDesc(texto)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <View>
                                        <Text style={globalStyles.containerLoginText}>¿Subirá Link de Foto?</Text>
                                    </View>
                                    <Switch
                                        value={checked}
                                        onValueChange={onToggleSwitch}
                                    />
                                </View>
                                <View style={globalStyles.divi}>
                                    <View style={globalStyles.containerLogin}>
                                        <Icon
                                            source="link-box-variant"
                                            color={'#4CAF50'}
                                            size={40}
                                        />
                                        <TextInput
                                            disabled={desac}
                                            label='Link de su foto'
                                            textColor='black'
                                            keyboardType='default'
                                            mode='outlined'
                                            outlineColor='#FFB75E'
                                            activeOutlineColor='#FFB75E'
                                            theme={{ colors: { primary: '#FFB75E', onSurfaceVariant: 'black' } }}
                                            style={globalStyles.inputBase}
                                            onChangeText={texto => setArchivoUrl(texto)}
                                        />
                                    </View>
                                </View>
                                <GradientButton
                                    title="Entregar Tarea"
                                    onPress={() => {
                                        setMensaje(bandera)
                                        setVisibleDialog(true)
                                    }}
                                    colores={['#6CBF84', '#4CAF50']}
                                />
                            </View>
                            <View style={globalStyles.snackContent}>
                                <Portal>
                                    <Dialog
                                        visible={visibleDialog} onDismiss={() => {
                                            setVisibleDialog(false)
                                            navigation.goBack();
                                        }}
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
                                            <Button labelStyle={{ fontSize: 18 }} onPress={() => {
                                                setVisibleDialog(false)
                                                navigation.goBack();
                                            }}>Ok</Button>
                                        </Dialog.Actions>
                                    </Dialog>
                                </Portal>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    title: {
        color: 'black',
        textAlign: 'center',
        fontSize: 29
    },
})



export default AgregarArchivo;
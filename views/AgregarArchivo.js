import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView, PermissionsAndroid, Platform } from 'react-native'

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
import { TextInput, Button, Text, Icon, Dialog, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import GradientButton from '../styles/gradientButton';
import { gql, useMutation } from '@apollo/client'
import LottieView from 'lottie-react-native';
import DocumentPicker from '@react-native-documents/picker';
import axios from 'axios';



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
    }
`;

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

const AgregarArchivo = ({ route }) => {
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

    //Para el Dialog
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [mensaje, setMensaje] = useState(null)

    const handleSubmit = async () => {
        if (desc === '' || desc.length < 25) {
            setMensaje('Tu tarea no puede ser vacia y debe contener más de 25 caracteres')
            setVisibleDialog(true)
            return
        }
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
            setMensaje(data)
            setShowFireworks(true);
            setTimeout(() => {
                setShowFireworks(false);
                navigation.goBack();
            }, 2500);
        } catch (error) {
            console.log(error)
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
            actual.getFullYear() === creado.getFullYear() &&
            actual.getMonth() === creado.getMonth() &&
            actual.getDate() === creado.getDate()
        ) {
            //console.log("Es el mismo dia, verificando con la fecha limite")
            if (
                actual.getFullYear() === final.getFullYear() &&
                actual.getMonth() === final.getMonth() &&
                actual.getDate() === final.getDate()
            ) {
                //console.log(actual <= final)
                //console.log("La fecha actual es el mismo día que la fecha limite, verficando hora")
                if (actual <= final) {
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
        if (actual.getMonth() + 1 < final.getMonth() + 1) {
            //console.log("El mes actual es menor. Puedes continuar")
        } else if (final.getMonth() + 1 === actual.getMonth() + 1) {
            if (actual <= final) {
                // Aún no llega la fecha/hora límite
                // Permitir entrega
            } else {
                bandera = "Ya se pasó de la fecha límite estipulada";
                return false;
            }
        }
        const pasados = actual.getDate() - creado.getDate()
        if (pasados % dias === 0) {
            //console.log('Cumple los dias que deben pasar')
            return true
        } else {
            bandera = "Aún no es tiempo de entregar esta tarea"
            return false
        }
    }
    //Para escoger archivos-------------------------------------------------------------------------------------------
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [archivoUrl, setArchivoUrl] = useState('sin');
    const [tipoArchivo, setTipoArchivo] = useState('sin');
    const solicitarPermisos = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ]);
                // Opcional: verifica si los permisos fueron concedidos
            } catch (err) {
                console.warn(err);
            }
        }
    };
    const seleccionarArchivo = async () => {
        await solicitarPermisos()
        try {
            const file = await pickFile();
            if (file) {
                setArchivoSeleccionado(file);
                setNombreArchivo(file.name);
                setTipoArchivo(file.type.startsWith('video') ? 'video' : 'audio');
                setArchivoUrl(null); // Reinicia la URL si se cambia el archivo
            }
        } catch (err) {
            setArchivoSeleccionado(null);
            setNombreArchivo('');
            setTipoArchivo(null);
            setArchivoUrl(null);
        }
    };
    const pickFile = async () => {
        try {
            const res = await DocumentPicker.pick({
                allowMultiSelection: false, // o true si quieres varios
                type: ['audio/*', 'video/*'], // usa los MIME types estándar
            });
            // El picker de @react-native-documents/picker siempre devuelve un array
            const file = Array.isArray(res) ? res[0] : res;
            return {
                uri: file.uri,
                type: file.type,
                name: file.name || file.fileName || 'archivo',
            };
        } catch (err) {
            if (err.code === 'DOCUMENT_PICKER_CANCELED') return null;
            throw err;
        }
    };
    //Para subir archivos a Cloudinary
    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.name,
        });
        data.append('upload_preset', 'altruism_unsigned');
        data.append('resource_type', file.type.startsWith('video') ? 'video' : 'auto');

        const cloudName = 'dltv0f7wj';
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.secure_url;
    };
    const optimizarUrlCloudinary = (url, tipo) => {
        if (!url) return url;
        // Solo optimiza imágenes y videos
        if (tipo === 'video') {
            // Ejemplo: reduce calidad y tamaño del video
            return url.replace('/upload/', '/upload/q_auto:low,w_640/');
        } else if (tipo === 'audio') {
            // Para audio normalmente no se optimiza por URL, se usa tal cual
            return url;
        } else {
            // Para imágenes: formato y calidad automáticos, tamaño máximo 800px
            return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
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
                        qa     <View>
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
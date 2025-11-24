import React, { useState } from 'react'
import { View, ScrollView, SafeAreaView, Linking } from 'react-native'

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
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery, useMutation } from '@apollo/client'

const InfoIndividualEntrega = ({ route }) => {
    const { archivo } = route.params
    const handleOpenLink = async (url) => {
        // Comprobamos si la URL puede ser manejada por la aplicación
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            // Abrimos la URL
            await Linking.openURL(url);
        } else {
            // Puedes usar Toast/Snackbar aquí para notificar al usuario en un entorno de producción
            console.error(`No se pudo abrir la URL: ${url}`);
        }
    };
    const googlePhotosLink = archivo.archivoUrl;
    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
                <View style={globalStyles.container}>
                    <Text style={globalStyles.tituloGrupo}>Contenido de la tarea</Text>
                    <Text style={globalStyles.contenidoGrupoItem}>Fecha Entregado: {new Date(Number(archivo.fechaEntregado)).toLocaleString()}</Text>
                </View>
                <AutoGrowingReadOnlyText value={archivo.texto} />
                {googlePhotosLink && googlePhotosLink.startsWith('http') ? (
                <View style={[globalStyles.container, { paddingVertical: 10 }]}>
                    <Button
                        icon="link"
                        mode="contained"
                        // Llama a la función con el contenido de archivo.texto
                        onPress={() => handleOpenLink(googlePhotosLink)}
                        style={{ marginTop: 15 }}
                        buttonColor='#FFB75E' // Usando tu color de acento
                        labelStyle={{ color: 'white' }}
                    >
                        Abrir Foto Entregada
                    </Button>
                </View>
            ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

// Componente auxiliar: TextInput de solo lectura que crece y activa scroll cuando es necesario
const AutoGrowingReadOnlyText = ({ value }) => {
    return (
        <TextInput
            editable={false}
            textColor='black'
            keyboardType='default'
            mode='outlined'
            value={value}
            outlineColor='#FFB75E'
            activeOutlineColor='#FFB75E'
            theme={{ colors: { primary: 'black', onSurfaceVariant: 'black' } }}
            multiline={true}
            style={[
                globalStyles.inputView,
                {
                    minHeight: 150, // Altura mínima de inicio
                    textAlignVertical: 'top'
                }
            ]}
        />
    )
}

export default InfoIndividualEntrega;
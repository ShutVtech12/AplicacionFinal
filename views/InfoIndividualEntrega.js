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
import { useNavigation } from '@react-navigation/native'
import globalStyles from '../styles/global';
import { gql, useQuery, useMutation } from '@apollo/client'

const InfoIndividualEntrega = ({ route }) => {
    const {archivo} = route.params
    return (
        <SafeAreaView style={globalStyles.contenedorNormal}>
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
                        theme={{ colors: { primary: 'black', onSurfaceVariant: 'black' } }}
                        style={[globalStyles.inputView, { height: 200, textAlignVertical: 'top' }]}
                        multiline={true}
                        numberOfLines={10}
                    />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaView>
    );
}


export default InfoIndividualEntrega;
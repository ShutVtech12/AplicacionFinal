import { StyleSheet } from 'react-native'

const globalStyles = StyleSheet.create({
    formal1:{
        textAlign: 'justify',
        paddingBottom: '20',
        color: 'black',
        fontSize: 18
    },
    btnCancelar: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 8,
    },
    btnCancelarTexto: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black'
    },
    formal2:{
        textAlign: 'justify',
        paddingBottom: '20',
        fontStyle:'italic',
        textIndent: 20,
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18
    },
    titulo: {
        textAlign: 'left',
        fontSize: 40,
        color: '#FF8C42',
        fontWeight: '400'
    },
    subTexto: {
        color: 'gray',
        paddingBottom: 20,
    },
    subsubTexto: {
        color: 'gray',
        paddingBottom: 20,
        textAlign: 'center'
    },
    subtitulo: {
        color: 'black',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#606060',
    },
    subsubtitulo: {
        textAlign: 'center',
        marginBottom: 3,
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#606060',
    },
    contenedorLogin: {
        backgroundColor: '#FFF9F0',
        paddingVertical: 40,
        paddingHorizontal: 40,
        flex: 1,
        flexDirection: 1
    },
    contenedorNormal: {
        backgroundColor: '#FFF9F0',
        paddingVertical: 10,
        paddingHorizontal: 10,
        flex: 1,
        flexDirection: 1
    },
    safe: {
        backgroundColor: '#FFF9F0',
        paddingVertical: 10,
        paddingHorizontal: 10,
        flex: 1,
        flexDirection: 1
    },
    contenido: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginHorizontal: '2.5%'
    },
    inputBase: {
        color: 'black',
        flex: 1,
        backgroundColor: '#FFF7E6'
    },
    inputView: {
        flex: 1,
        backgroundColor: '#DAF5FF'
    },
    buttonGra: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginHorizontal: 20,
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    snackBarWarning: {
        color: 'black',
        borderColor: '#FFC107',
        backgroundColor: '#FCE7A8',
        borderRadius: 15
    },
    snackBarDanger: {
        backgroundColor: '#FF4343',
        borderRadius: 15
    },
    textoBoton: {
        fontSize: 20,
        color: '#fff'
    },
    containerLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 16,
    },
    divi: {
        marginBottom: 16
    },
    snackContent: {
        alignItems: 'center'
    },
    contenidoList: {
        backgroundColor: '#fff',
        marginHorizontal: '2.5%'
    },
    tituloGrupo: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20
    },
    textNegro:{
        color: 'black'
    },
    textoContenido:{
        color: 'black',
        fontSize: 18
    },
    nombreUsuario: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 19,
        paddingBottom: 10
    },
    tituloGrupoItem: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18
    },
    contenidoGrupoItem: {
        color:'black',
        fontWeight: 'bold'
    },
    containerLoginText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18
    },
    containerRadio: {
        alignItems: 'center'
    },
    fechaContenedor: {
        backgroundColor: '#FFF9F0',
        borderRadius: 10,
    }, //------------------------------------------------------------Alumno abajo
    tituloRecordatorio:{
        color: 'black',
        fontSize: 20,
        textAlign: 'left',
        fontWeight: 'bold',
        paddingTop: 9
    },
    containerAlumno: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    tituloLogin: {
        textAlign: 'center',
        fontSize: 20,
        color: '#2E2E2E'
    },
    register: {
        paddingTop: 140,
        alignItems: 'center',
        marginTop: 20
    },
    nuevoRegistro: {
        paddingTop: 10,
        textDecorationLine: 'underline',
        color: '#6CBF84'
    },
    container: {
        alignItems: 'center',
        paddingVertical: '20'
    },

})


export default globalStyles
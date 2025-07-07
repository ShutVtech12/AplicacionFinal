import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setContext } from '@apollo/client/link/context';

const httplink = createHttpLink({
    
})

const authlink = setContext( async (_, {headers}) => {
    //Leer el token
    const token = await AsyncStorage.getItem('token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    }
})

const client = new ApolloClient({
    cache: new InMemoryCache(),
    //Enviamos via link el link del servidor más el tokens
    link: authlink.concat(httplink)
});

export default client;
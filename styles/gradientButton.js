import React from 'react';
import { TouchableRipple, Text, Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import globalStyles from '../styles/global';

const GradientButton = ({ 
    onLongPress, 
    onPress, 
    title,
    colores = ['#FFB75E', '#ED8F03'] 
}) => {
    return (
        <TouchableRipple onLongPress={onLongPress} onPress={onPress} borderless style={globalStyles.buttonContainer}>
            <LinearGradient
                //color=['#6CBF84','#4CAF50'] VERDE
                colors={colores}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={globalStyles.buttonGra}
            >
                <Text style={globalStyles.buttonText}>{title}</Text>
            </LinearGradient>
        </TouchableRipple>
    )
}

export default GradientButton;
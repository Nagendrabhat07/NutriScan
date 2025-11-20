import { StyleSheet, Pressable,Text} from 'react-native'
import { Colors } from '../constant/Colors'

const ThemedButton = ({style , ...props}) => {
  return (
    <Pressable style={({pressed}) =>[styles.btn, pressed && styles.pressed,style]} {...props} >
            
          </Pressable>
  )
}

export default ThemedButton

const styles = StyleSheet.create({
      btn : {
      backgroundColor : Colors.primary,
      padding : 15 ,
      borderRadius : 5,
    },
    pressed: {
      opacity : 0.8
    }
})
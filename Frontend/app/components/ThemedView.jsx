import {  View,useColorScheme} from 'react-native'
import {useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '../../constant/Colors'

const ThemedView = ({style,children,safe = false, ...props}) => {

 if(!safe) return (
    <View style = {[{
        backgroundColor : Colors.background, flex:1},style]} {...props}>
          {children}
    </View>
  )

  const insets = useSafeAreaInsets()

  return (
    <View style = {[{
        flex:1,
        backgroundColor : Colors.background,
        paddingTop : insets.top,
        paddingBottom : insets.bottom,
        
        },style]} {...props}>
          {children}
    </View>
  )


}

export default ThemedView
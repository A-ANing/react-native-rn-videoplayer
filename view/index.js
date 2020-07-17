import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    NativeModules,
    Alert,
    Easing,
    PanResponder,
    SafeAreaView,
    Platform
} from 'react-native';
import SystemSetting from 'react-native-system-setting'

import LinearGradient from 'react-native-linear-gradient';




// 


import { SvgVideoNextBtn, SvgVideoLoading, SvgVideoBrightness, SvgVideoSetting, SvgVideoNoSound, SvgVideoStop, SvgVideoPlay, SvgVideoAllBox, SvgVideoSmallBox, SvgVideoBack, SvgVideoScang, SvgVideoSound } from '../component/svg'
import Orientation from 'react-native-orientation-locker';
const { height, width } = Dimensions.get('screen');



export const Loading = (props)=>  {
 




   
        

        return (
            <>
                    
{
     props.showLoading ?
     <View
         style={{

             left: props.width / 2 - 45, position: "absolute",
             top:props.height/2-35,
              justifyContent: "center",
             zIndex: 10
         }}>
         <View style={
             {
                 justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                 paddingVertical: 11, borderRadius: 6,

             }
         }>
             <Animated.View style={{ transform: [{ rotate: props.spin }] }} >
                 <SvgVideoLoading height="30" width="30" />
             </Animated.View>

             <View><Text style={{ color: "#fff" }}>正在缓冲...</Text></View>
         </View>
     </View>
     :
     null
}
            </>

        )

}



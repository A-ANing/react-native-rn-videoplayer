import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    Dimensions,
    Animated,
    StatusBar,
    Platform,
    SafeAreaView
} from 'react-native';
import { formatSeconds } from '../utils/formatSeconds'
import { SvgVideoNextBtn, SvgVideoLoading, SvgVideoBrightness, SvgVideoSetting, SvgVideoNoSound, SvgVideoStop, SvgVideoPlay, SvgVideoAllBox, SvgVideoSmallBox, SvgVideoBack, SvgVideoScang, SvgVideoSound } from '../component/svg'
const { height, width } = Dimensions.get('screen');



export const Loading = (props) => {

    return (
        <>

            {
                props.showLoading ?
                    <View
                        style={{

                            left: props.width / 2 - 45, position: "absolute",
                            top: props.height / 2 - 35,
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


//暂停的tips
export const TipsPaused = (props) => {
    let timer = ''
    const [animater, setAnimater] = React.useState(new Animated.Value(0))
    const [show, setShow] = React.useState(true)




    React.useEffect(() => {

        tipsPausedFun();

    }, [])


    //控件显示动画
    const AnimatedOp = Animated.timing(
        // timing方法使动画值随时间变化
        animater, // 要变化的动画值
        {
            toValue: 1, // 最终的动画值
            duration: 300,
            useNativeDriver: false
        },
    )

    function tipsPausedFun() {
        if (AnimatedOp) {
            AnimatedOp.stop()
        }
        if (timer) {
            clearTimeout(timer)
        }
        AnimatedOp.start(() => {
            timer = setTimeout(() => {
                setShow(false)
            }, 2000)
        });
    }

    if (show) {
        return <Animated.View style={[styles.TipsPausedBox, { opacity: animater, left: props.width / 2 - 37, top: props.height / 2 - 15, }]}>
            <SvgVideoStop height="16" width="16" />
            <Text style={styles.TipsPausedText}>已暂停</Text>
        </Animated.View>
    } else {
        return null
    }


}



//亮度
export const Brightness = (props) => {

    return (
        <View
            style={{
                left: props.width / 2 - 80, position: "absolute",
                top: 0, bottom: 0, justifyContent: "center",
            }}>
            <View style={
                {
                    flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                    paddingVertical: 11, borderRadius: 6,


                }
            }>
                <SvgVideoBrightness width="20" height="20" />
                <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                    <Animated.View style={{ backgroundColor: "#ea7a99", width: props.brightnessWidth && props.brightnessWidth, zIndex: 99999, height: 2 }}></Animated.View>
                </View>
            </View>
        </View>
    )
}


//音量

export const Volume = (props) => {

    return (
        <View
            style={{
                left: props.width / 2 - 80, position: "absolute",
                top: 0, bottom: 0, justifyContent: "center",
            }}>
            <View style={{
                flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                paddingVertical: 11, borderRadius: 6,
            }}>
                {
                    props.soundWidth > 0 ? <SvgVideoSound width="20" height="20" /> : <SvgVideoNoSound width="20" height="20" />
                }
                <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                    <Animated.View style={{ backgroundColor: "#ea7a99", width: props.soundWidth && props.soundWidth, zIndex: 99999, height: 2 }}></Animated.View>
                </View>
            </View>
        </View>
    )
}


export const BottomSpeed = (props) => {

    return (
        <View style={{ width: props.width, bottom: 0, zIndex: 999, position: "absolute" }}>
            <View style={{ flex: 1, alignItems: "center", zIndex: 999, justifyContent: "space-around", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>


                <View style={{ width: props.width, flexDirection: "row", flexWrap: "nowrap", zIndex: 10 }}>
                    {/* 进度条*/}
                    <Animated.View style={{ zIndex: 12, width: props.playhideContsDotX === null ? 0 : props.playhideContsDotX, height: Platform.OS === "android" ? 2 : 3, backgroundColor: "#e54602" }}></Animated.View>


                </View>


            </View>
        </View>
    )
}




export const Header = (props) => {
    return (
        <>
            {
                props.width === width && Platform.OS === "android" ?
                    <View style={{ height: StatusBar.currentHeight, backgroundColor: "#000" }}></View>
                    :
                    <SafeAreaView style={{ backgroundColor: "#000" }} />
            }
            <StatusBar barStyle={"light-content"} />
        </>
    )

}


export class Speed extends Component {
    state = {
        allTime: "00:00",//总时长
        nowTime: "00:00",//当前播放时长
        dotStart: false,//是否按住了进度条上的点
    }
    setNativeProps = (data) => {
        this.refs.dotspeed.setNativeProps(data)
    }

    setSpeed = (e) => {
        if (this.nowTime != parseInt(e.currentTime)) {
            this.nowTime = parseInt(e.currentTime)

            this.props.ismoveDot ?
                this.setState({
                    nowTime: formatSeconds(e.currentTime),

                })
                :
                this.setState({
                    nowTime: formatSeconds(e.currentTime),
                    dotStart: false
                })
        }
    }

    setdotStart = (e) => {
        const dotStart = this.state.dotStart
        if (e && !dotStart) {
            this.setState({ dotStart: true })
        }

        if (!e && dotStart) {
            this.setState({ dotStart: false })
        }
    }

    render() {
        const { props } = this
        const { nowTime, dotStart } = this.state
        return (
            <View style={{ elevation: 10, flex: 1, alignItems: "center", zIndex: 9999, justifyContent: "center", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>
                <View>
                    <Text style={{ color: "#ffffff" }}>{nowTime}</Text>
                </View>

                <View style={{ width: props.width - 180, paddingHorizontal: 10, flexDirection: "row", flexWrap: "nowrap", zIndex: 10, alignItems: "center", position: "relative", }}>
                    {/* 进度条*/}
                    <Animated.View style={{ zIndex: 12, width: dotStart ? props.dotWidth : (props.playDotX === null ? 0 : props.playDotX), height: 2, backgroundColor: "#e54602" }}></Animated.View>
                    {/* 缓存条*/}
                    <Animated.View style={{ zIndex: 11, width: props.playBufferX === null ? 0 : props.playBufferX, height: 2, backgroundColor: "rgba(225,225,225,1)", position: "absolute", left: 10 }}></Animated.View>
                    {/* 进度条上的点 */}
                    <View style={{ zIndex: 9999, padding: 12, left: -14, backgroundColor: "rgba(0,0,0,0)" }} {...props.panHandlers}>
                        <View ref={"dotspeed"} style={{ height: 10, width: 10, borderRadius: 10, backgroundColor: "#e54602", borderWidth: 4, padding: 4, left: -2, borderColor: "rgba(255,255,255,0)" }}></View>
                    </View>
                    {/* 总进度 */}
                    <View style={{ height: 2, backgroundColor: "rgba(0,0,0,0.4)", position: "absolute", width: props.width - 200, zIndex: 9, left: 10 }}></View>
                </View>

                <View style={{}}>
                    <Text style={{ color: "#ffffff" }}>{props.allTime}</Text>
                </View>
            </View>
        )
    }
}




const styles = StyleSheet.create({

    TipsPausedBox: {
        flexDirection: "row", backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8, position: "absolute", alignItems: "center"
    },
    TipsPausedText: {
        color: "#fff", fontSize: 14, paddingLeft: 5
    }
})
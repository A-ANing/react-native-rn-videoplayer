import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
    Animated,
    StatusBar,
    Platform,
    SafeAreaView
} from 'react-native';
import {
    SvgVideoUnlock,
    SvgVideoLocking,
    SvgVideoLoading,
    SvgVideoBrightness,
    SvgVideoNoSound,
    SvgVideoStop,
    SvgVideoSound
} from '../component/svg'
import { formatSeconds } from '../utils/formatSeconds'

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


//锁定
export class Lock extends Component {
    state = {
        lock: false
    }
    onChangeLock = () => {

        this.props.showContsfun(this.state.lock)

        this.setState({
            lock: !this.state.lock
        })
    }
    render() {
        const { props } = this
        const { lock } = this.state
        if (props.showLockCont) {
            return (
                <Animated.View
                    style={{
                        opacity: props.opacity,
                        left: props.smallP ? 5 : 45, position: "absolute",
                        top: props.height / 2 - 35,
                        justifyContent: "center",
                        zIndex: 10
                    }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            padding: 10,
                        }}
                        onPress={this.onChangeLock}
                    >
                        {
                            lock ? <SvgVideoLocking width="28" height="28" /> : <SvgVideoUnlock width="30" height="30" />
                        }
                    </TouchableOpacity>
                </Animated.View >
            )
        } else {
            return null
        }

    }

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
export class Brightness extends Component {
    constructor(props) {
        super(props)
        this.state = {
            brightnessWidth: 0
        }
    }

    setBrightnessWidthFun = (data) => {
        this.setState({
            brightnessWidth: data
        })
    }
    render() {
        const { props } = this
        const { brightnessWidth } = this.state
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
                        <Animated.View style={{ backgroundColor: "#ea7a99", width: brightnessWidth && brightnessWidth, zIndex: 99999, height: 2 }}></Animated.View>
                    </View>
                </View>
            </View>
        )
    }
}

//音量

export class Volume extends Component {
    state = {
        soundWidth: 0.1
    }

    setsoundWidth = (soundWidth) => {
        this.setState({
            soundWidth
        })
    }
    render() {
        const { props } = this
        const { soundWidth } = this.state

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
                        soundWidth > 0 ? <SvgVideoSound width="20" height="20" /> : <SvgVideoNoSound width="20" height="20" />
                    }
                    <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                        <Animated.View style={{ backgroundColor: "#ea7a99", width: soundWidth && soundWidth, zIndex: 99999, height: 2 }}></Animated.View>
                    </View>
                </View>
            </View>
        )
    }
}



export const BottomSpeed = (props) => {

    return (
        <View style={{ width: props.width, bottom: 0, zIndex: 999, position: "absolute" }}>
            <View style={{ flex: 1, alignItems: "center", zIndex: 999, justifyContent: "space-around", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>


                <View style={{ width: props.width, flexDirection: "row", flexWrap: "nowrap", zIndex: 10 }}>
                    {/* 进度条*/}
                    <Animated.View style={{ zIndex: 12, width: props.playhideContsDotX === null ? 0 : (props.admRePlay ? 0 : props.playhideContsDotX), height: Platform.OS === "android" ? 2 : 3, backgroundColor:props.bottomSpeedColor }}></Animated.View>


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
            <StatusBar translucent={true} barStyle={"light-content"} />
        </>
    )

}


export class Speed extends Component {
    state = {
        allTime: "00:00",//总时长
        nowTime: "00:00",//当前播放时长
        dotStart: false,//是否按住了进度条上的点
        dotWidth: 0
    }
    setNativeProps = (data) => {
        this.refs.dotspeed.setNativeProps(data)
    }

    setdotWidth = (dotWidth) => {
        this.setState({ dotWidth })
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
        const { nowTime, dotStart, dotWidth } = this.state
        return (
            <View style={{ elevation: 10, flex: 1, alignItems: "center", zIndex: 9999, justifyContent: "center", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>
                <View>
                    <Text style={{ color: "#ffffff" }}>{props.admRePlay ? "00:00" : (nowTime == "00:00" ? props.nowTime : nowTime)}</Text>
                </View>

                <View style={{ width: props.width - 180, paddingHorizontal: 10, flexDirection: "row", flexWrap: "nowrap", zIndex: 10, alignItems: "center", position: "relative", }}>
                    {/* 进度条*/}
                    <Animated.View style={{ zIndex: 12, width: dotStart ? dotWidth : props.admRePlay ? 0 : (props.playDotX === null ? 0 : props.playDotX), height: 2, backgroundColor:props.color }}></Animated.View>
                    {/* 缓存条*/}
                    <Animated.View style={{ zIndex: 11, width: props.playBufferX === null ? 0 : props.admRePlay ? 0 : props.playBufferX, height: 2, backgroundColor:props.cachColor, position: "absolute", left: 10 }}></Animated.View>
                    {/* 进度条上的点 */}
                    <View style={{ zIndex: 9999, padding: 12, left: -14, backgroundColor: "rgba(0,0,0,0)" }} {...props.panHandlers}>
                        <View ref={"dotspeed"} style={{ height: 10, width: 10, borderRadius: 10, backgroundColor: props.dotColor, borderWidth: 4, padding: 4, left: -2, borderColor: "rgba(255,255,255,0)" }}></View>
                    </View>
                    {/* 总进度 */}
                    <View style={{ height: 2, backgroundColor:props.allSpeedColor, position: "absolute", width: props.width - 200, zIndex: 9, left: 10 }}></View>
                </View>

                <View style={{}}>
                    <Text style={{ color: "#ffffff" }}>{props.admRePlay ? "00:00" : props.allTime}</Text>
                </View>
            </View>
        )
    }
}

/* 拖动进度条展示拖动当前时时间 */
export class SpeedTipTime extends Component {
    state = {
        goSpeedTime: "00:00",//想要拖动改变的进度时常 


    }

    setgoSpeedTime = (goSpeedTime) => {
        this.setState({ goSpeedTime })
    }

    render() {
        const { props } = this
        return (
            <View
                ref={"gotimeSpeed"}
                style={{
                    left: props.width / 2 - 45, position: "absolute",
                    top: 50, bottom: 50, justifyContent: "center",
                    opacity: 0,
                    width: 0
                }}>
                <View style={{
                    flexDirection: "row", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                    paddingVertical: 6, borderRadius: 4,
                }}>
                    <View><Text style={{ color: "#fff" }}>{this.state.goSpeedTime}</Text></View>
                    <View><Text style={{ color: "#fff" }}>/</Text></View>
                    <View><Text style={{ color: "#fff" }}>{props.allTime}</Text></View>
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
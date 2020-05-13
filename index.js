/**
 * 首页顶部导航
 */
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
import Orientation from 'react-native-orientation';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { SvgVideoLoading, SvgVideoBrightness, SvgVideoSetting, SvgVideoNoSound, SvgVideoStop, SvgVideoPlay, SvgVideoAllBox, SvgVideoSmallBox, SvgVideoBack, SvgVideoScang, SvgVideoSound } from './component/svg'
const { height, width } = Dimensions.get('screen');



class VideoPlayer extends React.Component {

    constructor(props) {
        super(props)
        this.noVipSecond = this.props.noVipSecond || 5//没有vip可观看的分钟数
        this.url = this.props.url
        this.spinValue = new Animated.Value(0)
        this.adminBrightness = ''
        this.soundData = 0//音量
        this.soundDataY = 0
        this.BrightnessData = 0//亮度
        this.BrightnessY = 0

        this.dotX = new Animated.Value(0),
            this.bufferX = new Animated.Value(0),
            this.soundAnima = new Animated.Value(0),//音量
            this.playDotX = null,//控件没被隐藏时的进度动画
            this.playhideContsDotX = null,//控件被隐藏时，最下面的进度动画
            this.playBufferX = null,
            this.recordHandeY = [],//记录滑动y值
            this.recordHandeX = [],//记录滑动x值
            this.state = {
                duration: 0.0,
                soundWidth: 0,
                brightnessWidth: 0,
                opacity: new Animated.Value(1),
                paused: true,
                width: width,
                allTime: "00:00",//总时长
                nowTime: "00:00",//当前播放时长
                goSpeedTime: "00:00",//想要拖动改变的进度时常
                smallP: true,//当前是否是小屏
                statusBarH: 44,
                isEnd:false,//是否播放完了
                dotStart: false,//是否按住了进度条上的点
                showVolume: false,
                showBrightness: false,
                videoStarTimeWidth: 0,//现在的播放时间的宽度
                videoEndTimeWidth: 0,//总时长的宽度
                height: width * 210 / 375,
                LinearGradientHeight: 60,//控件阴影高度
                topContsTop: 0,//上部分控件的top定位值
                bottomContsBottom: 0,//下部分控件的bottom定位值
                showOpenVip: false,//是否显示开通vip提示
                currentTime: 0.0,
                showLoading: false,//是否显示正在加载
                showConts: true
            }
        this.goLogin = this.goLogin.bind(this)
        this.animatedonBuffer = this.animatedonBuffer.bind(this)

    }
    _press = (name) => {

        this.props.navigation.navigate('Detail', { transition: 'default', name: name })
    }

    goLogin(goPage) {

        this.props.navigation.navigate(goPage, {
            transition: 'default'
        })

    }

    componentWillUnmount() {

        Orientation.lockToPortrait();
        Orientation.removeOrientationListener(this._orientationDidChange);
        //离开该页面 还原屏幕亮度
        if (this.adminBrightness) {
            Platform.OS === "android" ?
                NativeModules.AppBrightness.setAppBrightness(this.adminBrightness) :
                SystemSetting.setBrightnessForce(this.adminBrightness).then((success) => {
                    !success && Alert.alert('没有权限', '您无权限改变屏幕亮度', [
                        { 'text': '好的', style: 'cancel' },
                        { 'text': '打开设置', onPress: () => SystemSetting.grantWriteSettingPermission() }
                    ])
                });
        }

    }

    _orientationDidChange = (orientation) => {
        if (orientation === 'LANDSCAPE') {
            // 横屏

            this.playhideContsDotX = this.dotX.interpolate({
                inputRange: [0, this.state.duration],
                outputRange: [0, height],
                extrapolate: 'clamp'
            })
            this.setState({
                width: height + 0,//StatusBar.currentHeight
                height: width,
                statusBarH: 0,
                smallP: false,
                showConts: false,
                LinearGradientHeight: 100,
                topContsTop: 30,
                bottomContsBottom: 30
            }, () => {
                StatusBar.setHidden(true)
                // 更新播放进度
                this.playDotX = this.dotX.interpolate({
                    inputRange: [0, this.state.duration],
                    outputRange: [0, height + 0 - 200],//StatusBar.currentHeight
                    extrapolate: 'clamp'
                })

                // 更新缓存进度
                this.playBufferX = this.bufferX.interpolate({
                    inputRange: [0, this.state.duration],
                    outputRange: [0, height + 0 - 200],//StatusBar.currentHeight
                    extrapolate: 'clamp'
                })
            })
        } else {
            //更新控件隐藏后的进度条
            this.playhideContsDotX = this.dotX.interpolate({
                inputRange: [0, this.state.duration],
                outputRange: [0, width],
                extrapolate: 'clamp'
            })
            this.setState({
                width: width,
                height: width * 210 / 375,
                statusBarH: 0,//
                smallP: true,
                showConts: false,
                LinearGradientHeight: 60,
                topContsTop: 0,
                bottomContsBottom: 0
            }, () => {
                StatusBar.setHidden(false)
                // 更新播放进度
                this.playDotX = this.dotX.interpolate({
                    inputRange: [0, this.state.duration],
                    outputRange: [0, width - 200],
                    extrapolate: 'clamp'
                })


                // 更新缓存进度
                this.playBufferX = this.bufferX.interpolate({
                    inputRange: [0, this.state.duration],
                    outputRange: [0, this.state.width - 200],
                    extrapolate: 'clamp'
                })
            }
            )
            // do something with portrait layout
        }
    }
    //全屏
    changeAllBox = () => {
        Platform.OS === "android" && NativeModules.HideBottomNa.hide();
        Orientation.lockToLandscape()
        this.props.onWindowChange&&this.props.onWindowChange("full")
    }
    //小屏
    changeSmallBox = () => {
        
        Orientation.lockToPortrait()
        this.props.onWindowChange&&this.props.onWindowChange("small")
        Platform.OS === "android" && NativeModules.HideBottomNa.show();
    
    
    }

    componentDidMount() {
        this.spin()
        this.setState({
            paused: false
        })
        // Orientation.lockToLandscape();
        Orientation.addOrientationListener(this._orientationDidChange);//监听屏幕方向
    }

    //控制loading加载器的显示隐藏
    animatedonBuffer(event) {
        console.log("在加载", event)
        if (event.isBuffering) {
            this.setState({
                showLoading: true
            })
        } else {
            this.setState({
                showLoading: false
            })
        }

    }

    //播放进度  包含进度条  以及当前播放时间
    animatedDot = (e) => {


        //console.log("进度", parseInt(e.currentTime))
        if (!this.state.showOpenVip && this.props.VIPCONTS) {
            if (e.currentTime >= this.noVipSecond) {

                this.setState({ showOpenVip: true, paused: true, showConts: false }, () => { !this.state.smallP && this.changeSmallBox(); alert("试看结束") })
            }
        }
        if (this.nowTime != parseInt(e.currentTime)) {
            this.nowTime = parseInt(e.currentTime)
            this.setState({
                nowTime: this.formatSeconds(e.currentTime)
            })
        }

        Animated.timing(
            // timing方法使动画值随时间变化
            this.dotX, // 要变化的动画值
            {
                toValue: e.currentTime, // 最终的动画值
                duration: 0
            },
        ).start(); // 开始执行动画

        Animated.timing(
            // timing方法使动画值随时间变化
            this.bufferX, // 要变化的动画值
            {
                toValue: e.playableDuration, // 最终的动画值
                duration: 0
            },
        ).start(); // 开始执行动画

    }
    componentWillMount() {

        //控件逐渐透明动画
        this.hide = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 0, // 最终的动画值

                duration: 300,
                delay: 5000


            },
        )

        //控件显示动画
        this.AnimatedOp = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 1, // 最终的动画值
                duration: 300,
            },
        )

        //控件隐藏动画
        this.fastHide = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 0, // 最终的动画值
                duration: 300,
            },
        )

        //直接隐藏
        this.toofastHide = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 0, // 最终的动画值
                duration: 0,
            },
        )

        // 上下滑动 调节音量 以及屏幕亮度
        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {

                clearTimeout(this.TimeHideConts)//拖动时禁止隐藏控件

                //初始化 记录滑动的xy值
                this.recordHandeY = []; this.recordHandeX = [];

                // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
                this.startX = evt.nativeEvent.pageX;

                this.startY = evt.nativeEvent.pageY;
                console.log("startY",this.startY)
                //获取当前音量
                SystemSetting.getVolume().then((volume) => {
                    this.volume = volume
                }).catch((err) => {
                    console.log('Current err is ' + err);
                })

                //获取当前屏幕亮度
                SystemSetting.getBrightness().then((brightness) => {
                    this.adminBrightness = brightness
                    //安卓不是直接修改系统亮度，这里获取到的是系统亮度，所以安卓需要处理
                    if (this.brightnessData) {
                        this.brightness = Platform.OS === "android" ? this.brightnessData : brightness
                    } else {
                        this.brightness = brightness
                    }
                });

            },
            onPanResponderMove: (evt, gestureState) => {

                if (this.recordHandeY.length < 10) {
                    this.recordHandeY.push(evt.nativeEvent.pageY)

                    this.recordHandeX.push(evt.nativeEvent.pageX)
                }
                console.log("locationY",evt.nativeEvent.pageY)
                this.moveYData = this.startY - evt.nativeEvent.pageY
                // console.log("moveYData",)
                this.moveXData = this.startX - evt.nativeEvent.pageX
                this.soundDataY = (this.startY + 30 - gestureState.moveY) / (this.state.height)
                this.BrightnessY = (this.startY + 30 - gestureState.moveY) / (this.state.height)

                if (this.recordHandeY.length === 10) {

                    
                    if (Math.abs(this.recordHandeY[9] - this.recordHandeY[0]) > Math.abs(this.recordHandeX[9] - this.recordHandeX[0])) {
                        //console.log("上下滑动")
                        if (Math.abs(this.moveYData) > 5) {

                            if (Math.abs(this.soundDataY) <= 1 && this.startX > this.state.width / 2) {
                                // 改变当前系统音量
                                if (this.soundDataY) {

                                    this.soundData = this.volume + this.soundDataY

                                    if (!this.state.showVolume) {
                                        this.setState({ showVolume: true })
                                    }
                                    if (this.hideVolumeTime) {
                                        clearTimeout(this.hideVolumeTime)
                                    }
                                    console.log("音量", this.soundData)
                                    SystemSetting.setVolume(this.soundData);
                                    if (this.soundData >= 1) {
                                        this.setState({
                                            soundWidth: 100
                                        })
                                    }
                                    if (this.soundData >= 0 && this.soundData <= 1) {

                                        this.setState({
                                            soundWidth: this.soundData / 1 * 100
                                        })

                                    }
                                    if (this.soundData < 0 && this.soundData <= 1 && this.state.soundWidth != 0) {
                                        this.setState({
                                            soundWidth: 0
                                        })
                                    }

                                }

                            }

                            if (this.volume >= 1 && this.startX < this.state.width / 2 && this.soundData >= 0.96) {
                                this.setState({
                                    soundWidth: 100
                                })
                            }

                            if (Math.abs(this.BrightnessY) <= 1 && this.startX < this.state.width / 2) {
                                //console.log("屏幕左边上下滑动调节亮度")
                                if (this.BrightnessY) {
                                    if (!this.state.showBrightness) {
                                        this.setState({ showBrightness: true })
                                    }
                                    if (this.hideBrightnessTime) {
                                        clearTimeout(this.hideBrightnessTime)
                                    }
                                    this.brightnessData = this.brightness + this.BrightnessY

                                    if (this.brightnessData >= 1) {
                                        this.setState({
                                            brightnessWidth: 100
                                        })
                                    }
                                    if (this.brightnessData >= 0 && this.brightnessData <= 1) {
                                        
                                        Platform.OS === "android" ?
                                            NativeModules.AppBrightness.setAppBrightness(this.brightnessData)
                                            :
                                            SystemSetting.setBrightnessForce(this.brightnessData).then((success) => {
                                                !success && Alert.alert('没有权限', '您无权限改变屏幕亮度', [
                                                    { 'text': '好的', style: 'cancel' },
                                                    { 'text': '打开设置', onPress: () => SystemSetting.grantWriteSettingPermission() }
                                                ])
                                            });
                                        this.setState({
                                            brightnessWidth: this.brightnessData / 1 * 100
                                        })

                                    }
                                    if (this.brightnessData < 0 && this.brightnessData <= 1 && this.state.brightnessWidth != 0) {
                                        this.setState({
                                            brightnessWidth: 0
                                        })
                                    }
                                }



                            }
                        }
                    } else {
                        //console.log("左右滑动调节播放进度")
                    }

                }


            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // this.props.navigation.setParams({ enableGestures: true });

                this.activateAutoHide()//激活自动隐藏
                //调节完音量后隐藏音量显示器
                if (this.state.showVolume) {
                    this.hideVolumeTime = setTimeout(() => { this.setState({ showVolume: false }) }, 800)
                }
                //调节完亮度后隐藏亮度显示器
                if (this.state.showBrightness) {
                    this.hideBrightnessTime = setTimeout(() => { this.setState({ showBrightness: false }) }, 800)
                }

                //如果滑动距离小于2 就是展示隐藏空间
                if (Math.abs(this.moveYData) < 2) {
                    this.showConts()
                }

                if (this.brightnessData >= 1) {
                    this.brightnessData = 1
                }

                if (this.brightnessData <= 0) {
                    this.brightnessData = 0
                }
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.activateAutoHide()//激活自动隐藏
                return true;
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                return false;
            },
        });




        // 左右拖动进度条
        this._panSpeeDot = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                // this.props.navigation.setParams({ enableGestures: false });
                if (this.state.showOpenVip) return//需要权限时停止不允许滑动进度条


                clearTimeout(this.TimeHideConts)//拖动进度条时禁止隐藏控件


                // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
                this.touchX = evt.nativeEvent.locationX;

                this.setState({ dotStart: true, dotWidth: evt.nativeEvent.pageX - 100, })
                // this.playDotX=null
                // gestureState.{x,y} 现在会被设置为0
            },
            onPanResponderMove: (evt, gestureState) => {
                // 最近一次的移动距离为gestureState.move{X,Y}

                if (this.state.showOpenVip) return//需要权限时停止不允许滑动进度条



                this.realMarginLeft = gestureState.moveX - this.touchX - 85;

                if (this.realMarginLeft >= this.state.width - 200) {
                    this.realMarginLeft = this.state.width - 200
                }

                // console.log("realMarginLeft",this.realMarginLeft)
                // console.log("当前",)
                if (this.realMarginLeft > 0) {
                    this.setState({
                        dotWidth: this.realMarginLeft,
                        //想要拖动快进的时间
                        goSpeedTime: this.formatSeconds((this.realMarginLeft) / (this.state.width - 200) * this.state.duration)
                    })
                }
                // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // this.props.navigation.setParams({ enableGestures: true });
                if (this.state.showOpenVip) return//需要权限时停止不允许滑动进度条

                this.activateAutoHide()//手指离开后激活自动隐藏

                let speedB = (this.state.dotWidth) / (this.state.width - 200)
                if (speedB >= 1) {
                    this.player.seek(this.state.duration * speedB - 2)
                } else {
                    this.player.seek(this.state.duration * speedB)
                }
               
                    this.setState({ dotStart: false })
              
                
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.activateAutoHide()//激活自动隐藏
                return true;
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {

                return false;
            },
        });
    }


    //快速隐藏控件
    fastHideConts = () => {
        this.fastHide.start(() => { this.setState({ showConts: false }) })
    }

    //激活自动隐藏
    activateAutoHide = () => {
        this.TimeHideConts = setTimeout(this.fastHideConts, 5000);
    }



    //显示控件
    showConts = () => {
        clearTimeout(this.TimeHideConts)
        //当提示要vip 暂停播放时 禁止双击暂停播放
        if (!this.state.showOpenVip) {
            if (this.lastBackPressed && this.lastBackPressed + 300 >= Date.now()) {
                this.state.paused ? this.setState({ paused: false, showConts: true }) : this.setState({ paused: true, showConts: true })
                this.AnimatedOp.start()
                clearTimeout(this.Timeout)
                return
            } else {
                this.lastBackPressed = Date.now();
            }
        }
        this.Timeout = setTimeout(() => {

            if (this.state.showConts) {//立即消失

                this.hide.stop()
                this.fastHideConts()
            } else {
                this.hide.stop();
                //点击视频显示控件
                this.AnimatedOp.start(() => { this.setState({ showConts: true }); this.hide.stop(); this.AnimatedOp.stop(); this.fastHide && this.fastHide.stop(); }); // 开始执行动画
            }
        }, 350)


        this.activateAutoHide()//激活控件自动隐藏
    }

    formatSeconds = (value) => {
        let result = parseInt(value)
        let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
        let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
        let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
        if (Math.floor(result / 3600) === 0) {
            result = `${m}:${s}`
        } else {
            result = `${h}:${m}:${s}`
        }

        return result
    }


    onLoad = (data) => {
        //console.log("总", this.formatSeconds(data.duration))
        //视频总长度
        this.setState({ duration: data.duration, allTime: this.formatSeconds(data.duration) });
        //进度条动画
        this.playDotX = this.dotX.interpolate({
            inputRange: [0, data.duration],
            outputRange: [0, this.state.width - 200],
            extrapolate: 'clamp'
        })

        //隐藏控件时，最下面的进度动画

        this.playhideContsDotX = this.dotX.interpolate({
            inputRange: [0, data.duration],
            outputRange: [0, this.state.width],
            extrapolate: 'clamp'
        })

        this.playBufferX = this.bufferX.interpolate({
            inputRange: [0, data.duration],
            outputRange: [0, this.state.width - 200],
            extrapolate: 'clamp'
        })
        this.toofastHide.start(() => { this.setState({ showConts: false }) })
    }


    //播放完重制播放进度等状态
    reVideo = () => {
        this.setState({ showConts: true, opacity: 1, paused: true,isEnd:true }, () => {
            // this.player.seek(0)
            // this.refs.speed.setNativeProps({

            //     style: {
            //         width: 0
            //     }
            // })
        })


    }

    //旋转方法
    spin = () => {
        this.spinValue.setValue(0)
        Animated.timing(this.spinValue, {
            toValue: 1, // 最终值 为1，这里表示最大旋转 360度
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => this.spin())
    }
    render() {
        console.log("调用次数")
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],//输入值
            outputRange: ["0deg", "360deg"] //输出值
        })

        const { allTime, nowTime, goSpeedTime, LinearGradientHeight, showOpenVip, topContsTop, bottomContsBottom } = this.state
        return (
            <View>
                <View >
                    <View  {...this._panResponder.panHandlers} style={{ height: this.state.height, width: this.state.width }}
                        activeOpacity={1}
                    >
                        <Video
                            
                            source={{ uri: this.props.url }}
                            ref={(ref) => {
                                this.player = ref
                            }}
                            {...this.props}
                            selectedTextTrack={{
                                type: "title",
                                value: "English Subtitles"
                            }}
                            onSeek={()=>{this.setState({paused:false,isEnd:false})}}
                            posterResizeMode={"cover"}//封面大小
                            playWhenInactive={true}//确定当通知或控制中心在视频前面时，媒体是否应继续播放。
                            paused={this.state.paused}//暂停
                            onLoad={this.onLoad}
                            onEnd={this.reVideo}
                            resizeMode={"contain"}
                            onReadyForDisplay={() => { this.setState({ showLoading: false }) }}//每次需要缓冲，正要播放时调用，可以隐藏loading
                            controls={false}
                            onProgress={this.animatedDot}                              // Store reference
                            onBuffer={(e) => this.animatedonBuffer(e)}                // Callback when remote video is buffering
                            onError={this.videoError}
                            width={this.state.width}
                            // Callback when video cannot be loaded
                            style={{ height: this.state.height, backgroundColor: "#000000" }} />

                    </View>
                    {
                        this.state.showConts ?
                            <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: this.state.opacity, height: 30, }}

                            >
                                {/* 阴影 */}
                                <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']} style={{ height: LinearGradientHeight, width: this.state.width }}></LinearGradient>
                                {/* 返回键 */}
                                <TouchableOpacity style={{ position: "absolute", top: topContsTop, left: 5, padding: 10, zIndex: 999 }}
                                    //如果是全屏 点击返回键是切换到小屏  反之返回上个页面
                                    onPress={() => { if (this.state.smallP) { this.props.navigation.goBack() } else { this.changeSmallBox() } }}
                                >
                                    <SvgVideoBack height="20" width="20" />
                                </TouchableOpacity>
                                {/* 收藏|更多 */}
                                <View style={{ position: "absolute", top: topContsTop, right: 5, flexWrap: "nowrap", flexDirection: "row", zIndex: 10, }}>
                                    <TouchableOpacity style={{ padding: 8 }}>
                                        <SvgVideoScang height="20" width="20" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ padding: 8, marginLeft: 1, }}>
                                        <SvgVideoSetting height="20" width="20" />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View >
                            :
                            null
                    }
                    {
                        showOpenVip && this.props.VIPCONTS &&
                        <ShouldPermissionTitle openViptipBOTTOM={bottomContsBottom + 40} />



                    }
                    {
                        //控件隐藏时候，最下面显示的进度
                        this.state.showConts ? null :
                            <View style={{ width: this.state.width, bottom: 0, zIndex: 999, position: "absolute" }}>
                                <View style={{ flex: 1, alignItems: "center", zIndex: 999, justifyContent: "space-around", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>


                                    <View style={{ width: this.state.width, flexDirection: "row", flexWrap: "nowrap", zIndex: 10 }}>
                                        {/* 进度条*/}
                                        <Animated.View ref="speed" style={{ zIndex: 12, width: this.playhideContsDotX === null ? 0 : this.playhideContsDotX, height: 2, backgroundColor: "#e54602" }}></Animated.View>


                                    </View>


                                </View>
                            </View>
                    }

                    {
                        this.state.showConts ?
                            <Animated.View style={{ width: this.state.width, bottom: bottomContsBottom, opacity: this.state.opacity, zIndex: 999, position: "absolute", flexDirection: "row", flexWrap: "nowrap" }}>
                                {/* 播放暂停 */}
                                {
                                    this.state.paused
                                        ?
                                        <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => {if(!showOpenVip){
                                            
                                            if(this.state.isEnd){
                                                this.player.seek(0)
                                                setTimeout(()=>{
                                                    this.setState({ paused: false,isEnd:false });
                                                    
                                                },300)
                                               
                                            }else{
                                                this.setState({ paused: false });
                                            }
                                         
                                            }}}>

                                            <SvgVideoPlay height="20" width="20" />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999 }} onPress={() => { !showOpenVip && this.setState({ paused: true }) }}>

                                            <SvgVideoStop height="20" width="20" />
                                        </TouchableOpacity>
                                }

                                {/* 进度条 缓存条*/}
                                <View style={{ flex: 1, alignItems: "center", zIndex: 999, justifyContent: "space-around", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>
                                    <View>
                                        <Text style={{ color: "#ffffff" }}>{nowTime}</Text>
                                    </View>

                                    <View style={{ width: this.state.width - 200, flexDirection: "row", flexWrap: "nowrap", top: 14, zIndex: 10 }}>
                                        {/* 进度条*/}
                                        <Animated.View ref="speed" style={{ zIndex: 12, width: this.state.dotStart ? this.state.dotWidth : (this.playDotX === null ? 0 : this.playDotX), height: 2, backgroundColor: "#e54602" }}></Animated.View>
                                        {/* 缓存条*/}
                                        <Animated.View style={{ zIndex: 11, width: this.playBufferX === null ? 0 : this.playBufferX, height: 2, backgroundColor: "rgba(225,225,225,1)", position: "absolute", }}></Animated.View>
                                        {/* 进度条上的点 */}
                                        <View style={{ zIndex: 13, bottom: 14, padding: 10, left: -14, backgroundColor: "rgba(0,0,0,0)", }} {...this._panSpeeDot.panHandlers}>
                                            <View style={{ height: 10, width: 10, borderRadius: 10, backgroundColor: "#e54602", }}></View>
                                        </View>
                                        {/* 总进度 */}
                                        <View style={{ height: 2, backgroundColor: "rgba(0,0,0,0.4)", position: "absolute", width: this.state.width - 200, zIndex: 9 }}></View>
                                    </View>

                                    <View style={{}}>
                                        <Text style={{ color: "#ffffff" }}>{allTime}</Text>
                                    </View>
                                </View>
                                {
                                    this.state.smallP ?
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            style={{ padding: 10, width: 40, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end", justifyContent: "flex-end" }}
                                            onPress={() => { this.changeAllBox() }}
                                        >
                                            <SvgVideoAllBox height="20" width="20" />
                                        </TouchableOpacity >
                                        :
                                        <TouchableOpacity
                                            activeOpacity={0.5}

                                            style={{ padding: 10, width: 40, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end" }}
                                            onPress={() => { this.changeSmallBox() }}
                                        >
                                            <SvgVideoSmallBox height="20" width="20" />
                                        </TouchableOpacity >

                                }
                                {/* 阴影 */}
                                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']} style={{ height: LinearGradientHeight, width: this.state.width, position: "absolute", bottom: this.state.smallP ? 0 : -bottomContsBottom }}></LinearGradient>
                            </Animated.View>
                            :
                            null
                    }
                </View>
                {/* 屏大小切换 */}



                {/* 音量 this.state.height / 2 - 20 + this.state.statusBarH / 2*/}
                {
                    this.state.showVolume ?
                        <View style={
                            {
                                flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 10,
                                paddingVertical: 11, borderRadius: 6,
                                left: this.state.width / 2 - 80, position: "absolute",
                                top: this.state.smallP ? this.state.height / 2 : this.state.height / 2 - 20
                            }
                        }>
                            {
                                this.state.soundWidth > 0 ? <SvgVideoSound width="20" height="20" /> : <SvgVideoNoSound width="20" height="20" />
                            }
                            <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                                <Animated.View style={{ backgroundColor: "#ea7a99", width: this.state.soundWidth && this.state.soundWidth, zIndex: 99999, height: 2 }}></Animated.View>
                            </View>
                        </View>
                        :
                        null
                }

                {/* 亮度*/}
                {
                    this.state.showBrightness ?
                        <View style={
                            {
                                flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 10,
                                paddingVertical: 11, borderRadius: 6,
                                left: this.state.width / 2 - 80, position: "absolute",
                                top: this.state.smallP ? this.state.height / 2 : this.state.height / 2 - 20
                            }
                        }>
                            <SvgVideoBrightness width="20" height="20" />
                            <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                                <Animated.View style={{ backgroundColor: "#ea7a99", width: this.state.brightnessWidth && this.state.brightnessWidth, zIndex: 99999, height: 2 }}></Animated.View>
                            </View>
                        </View>
                        :
                        null

                }

                {
                    //拖动进度条展示拖动当前时时间
                    this.state.dotStart &&
                    <View style={
                        {
                            flexDirection: "row", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                            paddingVertical: 6, borderRadius: 4,
                            left: this.state.width / 2 - 45, position: "absolute",
                            top: this.state.smallP ? this.state.height / 2 : this.state.height / 2 - 20
                        }
                    }>
                        <View><Text style={{ color: "#fff" }}>{goSpeedTime}</Text></View>
                        <View><Text style={{ color: "#fff" }}>/</Text></View>
                        <View><Text style={{ color: "#fff" }}>{allTime}</Text></View>
                    </View>

                }
                {
                    /* loading */
                    this.state.showLoading ?
                        <View style={
                            {
                                justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                                paddingVertical: 11, borderRadius: 6,
                                left: this.state.width / 2 - 45, position: "absolute",
                                top: this.state.smallP ? this.state.height / 2 : this.state.height / 2 - 20
                            }
                        }>
                            <Animated.View style={{ transform: [{ rotate: spin }] }} >
                                <SvgVideoLoading height="30" width="30" />
                            </Animated.View>

                            <View><Text style={{ color: "#fff" }}>正在缓冲...</Text></View>
                        </View>
                        :
                        null
                }

            </View>
        )
    }


}

const styles = StyleSheet.create({


});

export default VideoPlayer
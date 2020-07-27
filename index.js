/**
 * 视频
 * props:
 *     continuous为是否是连续剧，可以选集数的视频，为true时，播放暂停，全屏键在进度条下方，展示选集按钮，为false，播放暂停，全屏按钮在进度条左右两边展示
 *     renderAllSeenList，fun,返回一个Component,渲染全屏时的选集框
 * 
 * 
 */


//修复播放不同分辨率视频，不会重新测量分辨率的问题https://github.com/react-native-community/react-native-video/pull/2053
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
import Video from 'react-native-video';
import { Loading } from './view/index'
import { formatSeconds } from './utils/formatSeconds';
import { SvgVideoNextBtn, SvgVideoLoading, SvgVideoBrightness, SvgVideoSetting, SvgVideoNoSound, SvgVideoStop, SvgVideoPlay, SvgVideoAllBox, SvgVideoSmallBox, SvgVideoBack, SvgVideoScang, SvgVideoSound } from './component/svg'
import Orientation from 'react-native-orientation-locker';
const { height, width } = Dimensions.get('screen');





class VideoPlayer extends React.Component {

    // VideoPlayer.changeWindows=this.changeWindows.bind(this)
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
                isEnd: false,//是否播放完了
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
                showConts: true,
                showDrTime: false,//拖动进度条时显示的时间进度
                showChangeList: false,//控制是否显示全屏选集
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
        // Orientation.removeOrientationListener(this._orientationDidChange);
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

        // if (orientation === 'LANDSCAPE') {
        //     // 横屏
        //     this.setAll()
        // } else {

        //    this.setSmall()
        //     // do something with portrait layout
        // }
    }
    //全屏
    changeAllBox = () => {
        this.setAll()
        Platform.OS === "android" && NativeModules.HideBottomNa.hide();
        Orientation.lockToLandscape()
        this.props.onWindowChange && this.props.onWindowChange("full")
    }
    //小屏
    changeSmallBox = () => {
        this.setSmall()
        Orientation.lockToPortrait()
        this.props.onWindowChange && this.props.onWindowChange("small")
        Platform.OS === "android" && NativeModules.HideBottomNa.show();


    }


    setAll = () => {


        this.playhideContsDotX = this.dotX.interpolate({
            inputRange: [0, this.state.duration],
            outputRange: [0, height],
            extrapolate: 'clamp'
        })
        this.props.navigation && this.props.navigation.setParams({ enableGestures: false });
        this.setState({
            width: height + 0,//StatusBar.currentHeight
            height: width,
            statusBarH: 0,
            smallP: false,
            showConts: false,
            LinearGradientHeight: 100,
            topContsTop: 30,
            bottomContsBottom: this.props.continuous ? 30 : 0,
            dotStart: false
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
    }

    setSmall = () => {
        //更新控件隐藏后的进度条
        this.playhideContsDotX = this.dotX.interpolate({
            inputRange: [0, this.state.duration],
            outputRange: [0, width],
            extrapolate: 'clamp'
        })
        this.props.navigation && this.props.navigation.setParams({ enableGestures: true });

        this.setState({
            width: width,
            height: width * 210 / 375,
            statusBarH: 0,//
            smallP: true,
            showConts: false,
            LinearGradientHeight: 60,
            topContsTop: 0,
            bottomContsBottom: 0,
            dotStart: false
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
    }

    componentDidMount() {
        this.spin()
        this.setState({
            paused: false
        })

        // Orientation.lockToLandscape();
        // Orientation.addOrientationListener(this._orientationDidChange);//监听屏幕方向
    }

    //控制loading加载器的显示隐藏
    animatedonBuffer(event) {
        this.props.onBuffer && this.props.onBuffer(event)


        if (Platform.OS === "android") {
            if (event.isBuffering) {
                this.setState({
                    showLoading: true
                })
            } else {

                this.setState({
                    showLoading: false,

                })
            }
        } else {

            this.setState({
                showLoading: true,

            })


        }


    }

    //播放进度  包含进度条  以及当前播放时间
    animatedDot = (e) => {
        this.props.onProgress && this.props.onProgress(e)

        //console.log("进度", parseInt(e.currentTime))
        if (!this.state.showOpenVip && this.props.VIPCONTS) {
            if (e.currentTime >= this.noVipSecond) {

                this.setState({ showOpenVip: true, paused: true, showConts: false }, () => { !this.state.smallP && this.changeSmallBox();  })
            }
        }
        if (this.nowTime != parseInt(e.currentTime)) {
            this.nowTime = parseInt(e.currentTime)

            this.ismoveDot ?
                this.setState({
                    nowTime: formatSeconds(e.currentTime),

                })
                :
                this.setState({
                    nowTime: formatSeconds(e.currentTime),
                    dotStart: false
                })
        }
        if (this.state.showLoading) {
            Platform.OS === "ios" && this.setState({ showLoading: false })
        }

        Animated.timing(
            // timing方法使动画值随时间变化
            this.dotX, // 要变化的动画值
            {
                toValue: e.currentTime, // 最终的动画值
                duration: 0,
                useNativeDriver: false
            },
        ).start(); // 开始执行动画

        Animated.timing(
            // timing方法使动画值随时间变化
            this.bufferX, // 要变化的动画值
            {
                toValue: e.playableDuration, // 最终的动画值
                duration: 0,
                useNativeDriver: false
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
                delay: 5000,
                useNativeDriver: false


            },
        )

        //控件显示动画
        this.AnimatedOp = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 1, // 最终的动画值
                duration: 300,
                useNativeDriver: false
            },
        )

        //控件隐藏动画
        this.fastHide = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 0, // 最终的动画值
                duration: 300,
                useNativeDriver: false
            },
        )

        //直接隐藏
        this.toofastHide = Animated.timing(
            // timing方法使动画值随时间变化
            this.state.opacity, // 要变化的动画值
            {
                toValue: 0, // 最终的动画值
                duration: 0,
                useNativeDriver: false
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
                // console.log("startY", this.startY)
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
                // console.log("locationY", evt.nativeEvent.pageY)
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
                                    // console.log("音量", this.soundData)
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
                if (Math.abs(this.moveYData) < 5) {
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

                this.refs.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0.5)" }
                })
                this.refs.gotimeSpeed.setNativeProps({ style: { opacity: 1, display: null, width: null } })
                clearTimeout(this.TimeHideConts)//拖动进度条时禁止隐藏控件

                this.ismoveDot = true
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
                        showDrTime: false,
                        dotWidth: this.realMarginLeft,
                        //想要拖动快进的时间
                        goSpeedTime: formatSeconds((this.realMarginLeft) / (this.state.width - 200) * this.state.duration)
                    })
                }
                // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // this.props.navigation.setParams({ enableGestures: true });
                if (this.state.showOpenVip) return//需要权限时停止不允许滑动进度条
                this.refs.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })
                this.activateAutoHide()//手指离开后激活自动隐藏

                let speedB = (this.state.dotWidth) / (this.state.width - 200)
                if (speedB >= 1) {
                    this.player.seek(this.state.duration * speedB - 2)
                } else {
                    this.player.seek(this.state.duration * speedB)
                }

                this.refs.gotimeSpeed.setNativeProps({ style: { opacity: 0, display: "none", width: 0 } })
                this.ismoveDot = false

            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.refs.gotimeSpeed.setNativeProps({ style: { opacity: 0, display: "none", width: 0 } })
                this.refs.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })
                this.ismoveDot = false
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

    //重置播放
    rePlay = (autoPlay = true) => {
        if (this.state.isEnd) {
            // console.log("---=-=-=-=", 1)
            this.player.seek(0)
            setTimeout(() => {
                if (autoPlay) {
                    this.setState({ paused: true, isEnd: false, showConts: true }, () => { this.setState({ paused: false }) });
                } else {
                    this.setState({ isEnd: false, showConts: true });
                }

            }, 300)

        } else {
            // console.log("---=-=-=-=", 2)
            if (!this.state.paused) {
                if (autoPlay) {
                    this.setState({ paused: true }, () => { this.setState({ paused: false }) });
                } else {
                    this.setState({ paused: true });
                }
            }

        }
        if (this.state.paused && !this.state.isEnd) {
            // console.log("---=-=-=-=", 3)
            this.setState({ paused: autoPlay ? false : true });
        }

    }

    //暴露方法 设置播放暂停
    setPaused = (e) => {
        this.adminPaused = true
        if (e) {
            this.setState({
                paused: true
            })
        } else {
            this.setState({
                paused: false

            })
        }
    }



    //重新加载 暴露方法

    reLoad = () => {
        const { paused } = this.state
        if (!paused) { this.setState({ paused: true }) }
        this.player.seek(0)
        setTimeout(() => {
            this.setState({ paused: false, showConts: true, showLoading: true });

        })
    }
    //显示控件
    showConts = () => {
        try {
            clearTimeout(this.TimeHideConts)
            //当提示要vip 暂停播放时 禁止双击暂停播放
            if (!this.state.showOpenVip) {
                if (this.lastBackPressed && this.lastBackPressed + 300 >= Date.now()) {
                    // clearTimeout(this.Timeout)
                    this.state.paused ? this.rePlay() : this.setState({ paused: true, showConts: true })
                    this.state.opacity.setValue(1)
                    return 
                } else {
                    this.lastBackPressed = Date.now();
                }
            }
            // this.Timeout = setTimeout(() => {

            if (this.state.showConts) {//立即消失
                this.hide.stop()
                this.fastHideConts()
            } else {
                this.hide.stop();
                //点击视频显示控件
                this.AnimatedOp.start(() => { this.setState({ showConts: true, showChangeList: false }); this.hide.stop(); this.AnimatedOp.stop(); this.fastHide && this.fastHide.stop(); }); // 开始执行动画
            }

            // }, 300)

            this.activateAutoHide()//激活控件自动隐藏
        } catch (error) {

        }




    }




    onLoad = (data) => {
        // console.log("onload", data)
        this.props.onLoad && this.props.onLoad(data)
        //console.log("总", this.formatSeconds(data.duration))
        //视频总长度
        this.setState({ duration: data.duration, allTime: formatSeconds(data.duration), showChangeList: false });
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

        !this.props.repeat && this.setState({ showConts: true, opacity: 1, paused: true, isEnd: true }, () => {
            // this.player.seek(0)
            // this.refs.speed.setNativeProps({

            //     style: {
            //         width: 0
            //     }
            // })
        })
        if (!this.state.paused) {
            this.props.onEnd && this.props.onEnd()
        }

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

    videoError = (e) => {
        this.props.onError && this.props.onError(e)
        this.setState({ showLoading: false, paused: true })
        this.onError = true
    }
    changeWindows = (e) => {
        if (e) {
            this.changeAllBox()
        } else {
            this.changeSmallBox()
        }
    }

    render() {
        // console.log("调用次数")
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],//输入值
            outputRange: ["0deg", "360deg"] //输出值
        })

        const { showLoading, smallP, allTime, nowTime, goSpeedTime, LinearGradientHeight, showOpenVip, topContsTop, bottomContsBottom } = this.state
        return (
            <>
                {
                    this.state.width === width && Platform.OS === "android" ?
                        <View style={{ height: StatusBar.currentHeight, backgroundColor: "#000" }}></View>
                        :
                        <SafeAreaView style={{ backgroundColor: "#000" }} />
                }
                <StatusBar barStyle={"light-content"} />

                <View ref={ref => this.videoBox = ref} style={{ backgroundColor: "#000", position: 'relative' }}>

                    <View style={{}}>
                        <View  {...this._panResponder.panHandlers} style={{ height: this.state.height, width: this.state.width, }}
                            activeOpacity={1}
                        >
                            <Video
                                    
                                source={{ uri: this.props.url }}
                                ref={(ref) => {
                                    this.player = ref
                                }}
                                continuous={this.props.continuous ? true : false}//是否是连续剧，用来全屏展示选集，下一集按钮    重新加载Video标签，防止出现上个视频和下个视频分辨率不切换的问题　
                                {...this.props}
                                repeat={this.props.repeat ? this.props.repeat : false}
                                onSeek={(e) => {
                                    this.props.onSeek && this.props.onSeek(e)
                                    this.setState({ isEnd: false })
                                    // this.setState({ dotStart: false })
                                }}
                                posterResizeMode={"cover"}//封面大小
                                playWhenInactive={true}//确定当通知或控制中心在视频前面时，媒体是否应继续播放。
                                paused={this.adminPaused ? this.state.paused : (this.props.paused ? this.props.paused : this.state.paused)}//暂停
                                onLoad={this.onLoad}
                                onEnd={this.reVideo}
                                resizeMode={"none"}
                                onReadyForDisplay={(e) => {
                                    this.props.onReadyForDisplay && this.props.onReadyForDisplay(e)

                                    // this.setState({ showLoading: false,dotStart: false })

                                }}//
                                controls={false}
                                onProgress={this.animatedDot}                              // Store reference
                                onBuffer={(e) => this.animatedonBuffer(e)}                // Callback when remote video is buffering
                                onError={this.videoError}
                                width={this.props.width ? this.props.width : this.state.width}
                                
                                // Callback when video cannot be loaded
                                style={{ height: this.state.height, backgroundColor: "#000000" }} />

                        </View>
                        {
                            this.state.showConts ?
                                <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: this.state.opacity, height: 30 }}

                                >
                                    {/* 阴影 */}
                                    <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']} style={{ height: LinearGradientHeight, width: this.state.width }}></LinearGradient>
                                    {/* 返回键 */}
                                    <TouchableOpacity style={{ position: "absolute", top: topContsTop, left: smallP ? 5 : this.props.continuous ? 45 : 5, padding: 10, zIndex: 999, }}
                                        //如果是全屏 点击返回键是切换到小屏  反之返回上个页面
                                        onPress={() => {
                                            if (this.state.smallP) {
                                                this.props.onSmallBack && this.props.onSmallBack()
                                                // this.props.navigation.goBack()

                                            } else { this.changeSmallBox() }
                                        }}
                                    >
                                        <SvgVideoBack height="20" width="20" />
                                    </TouchableOpacity>
                                    {/* 收藏|更多 */}
                                    <View style={{ position: "absolute", top: topContsTop, right: smallP ? 5 : this.props.continuous ? 45 : 5, flexWrap: "nowrap", flexDirection: "row", zIndex: 10, }}>
                                        <TouchableOpacity style={{ padding: 8 }}
                                            onPress={this.props.onStore && this.props.onStore}
                                        >
                                            {
                                                this.props.storeComponent ? this.props.storeComponent() : <SvgVideoScang height="20" width="20" />
                                            }

                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ padding: 8, marginLeft: 1, }}
                                            onPress={this.props.onMoreFun && this.props.onMoreFun()}
                                        >
                                            {
                                                this.props.moreSetting ? this.props.moreSetting() : <SvgVideoSetting height="20" width="20" />
                                            }

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
                                            <Animated.View ref="speed" style={{ zIndex: 12, width: this.playhideContsDotX === null ? 0 : this.playhideContsDotX, height: Platform.OS === "android" ? 2 : 3, backgroundColor: "#e54602" }}></Animated.View>


                                        </View>


                                    </View>
                                </View>
                        }
                        {
                            this.state.showConts &&
                            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']} style={{ height: LinearGradientHeight, width: this.state.width, position: "absolute", bottom: this.state.smallP ? 0 : -bottomContsBottom }}></LinearGradient>

                        }

                        {
                            this.state.showConts ?
                                <Animated.View style={{ width: this.state.width, bottom: bottomContsBottom, opacity: this.state.opacity, zIndex: 99999, position: "absolute", }}>
                                    <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
                                        {/* 播放暂停 */}
                                        {
                                            !this.props.continuous ? (this.state.paused
                                                ?
                                                <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => {
                                                    if (!showOpenVip) {
                                                        this.rePlay()
                                                    }
                                                }}>

                                                    <SvgVideoPlay height="20" width="20" />
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => { !showOpenVip && this.setState({ paused: true }) }}>

                                                    <SvgVideoStop height="20" width="20" />
                                                </TouchableOpacity>
                                            )
                                                :
                                                smallP && (this.state.paused
                                                    ?
                                                    <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => {
                                                        if (!showOpenVip) {

                                                            this.rePlay()

                                                        }
                                                    }}>

                                                        <SvgVideoPlay height="20" width="20" />
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => { !showOpenVip && this.setState({ paused: true }) }}>

                                                        <SvgVideoStop height="20" width="20" />
                                                    </TouchableOpacity>
                                                )

                                        }

                                        {/* 进度条 缓存条*/}
                                        <View style={{ elevation: 10, flex: 1, alignItems: "center", zIndex: 9999, justifyContent: "center", flexDirection: "row", flexWrap: "nowrap", bottom: 0 }}>
                                            <View>
                                                <Text style={{ color: "#ffffff" }}>{nowTime}</Text>
                                            </View>

                                            <View style={{ width: this.state.width - 180, paddingHorizontal: 10, flexDirection: "row", flexWrap: "nowrap", zIndex: 10, alignItems: "center", position: "relative", }}>
                                                {/* 进度条*/}
                                                <Animated.View ref="speed" style={{ zIndex: 12, width: this.state.dotStart ? this.state.dotWidth : (this.playDotX === null ? 0 : this.playDotX), height: 2, backgroundColor: "#e54602" }}></Animated.View>
                                                {/* 缓存条*/}
                                                <Animated.View style={{ zIndex: 11, width: this.playBufferX === null ? 0 : this.playBufferX, height: 2, backgroundColor: "rgba(225,225,225,1)", position: "absolute", left: 10 }}></Animated.View>
                                                {/* 进度条上的点 */}
                                                <View style={{ zIndex: 9999, padding: 12, left: -14, backgroundColor: "rgba(0,0,0,0)" }} {...this._panSpeeDot.panHandlers}>
                                                    <View ref={"dotspeed"} style={{ height: 10, width: 10, borderRadius: 10, backgroundColor: "#e54602", borderWidth: 4, padding: 4, left: -2, borderColor: "rgba(255,255,255,0)" }}></View>
                                                </View>
                                                {/* 总进度 */}
                                                <View style={{ height: 2, backgroundColor: "rgba(0,0,0,0.4)", position: "absolute", width: this.state.width - 200, zIndex: 9, left: 10 }}></View>
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
                                                : (
                                                    !this.props.continuous &&
                                                    <TouchableOpacity
                                                        activeOpacity={0.5}

                                                        style={{ padding: 10, width: 40, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end" }}
                                                        onPress={() => { this.changeSmallBox() }}
                                                    >
                                                        <SvgVideoSmallBox height="20" width="20" />
                                                    </TouchableOpacity >
                                                )
                                        }
                                    </View>
                                    {
                                        !smallP &&
                                        <View style={{ height: 40, width: this.state.width, paddingHorizontal: 45, flexDirection: "row" }}>
                                            <View style={{ flexDirection: "row", flex: 1, }}>
                                                {
                                                    this.props.continuous && (this.state.paused
                                                        ?
                                                        <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999, }} onPress={() => {
                                                            if (!showOpenVip) {

                                                                this.rePlay()

                                                            }
                                                        }}>

                                                            <SvgVideoPlay height="20" width="20" />
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity activeOpacity={1} style={{ bottom: 0, left: 5, padding: 10, zIndex: 999 }} onPress={() => { !showOpenVip && this.setState({ paused: true }) }}>

                                                            <SvgVideoStop height="20" width="20" />
                                                        </TouchableOpacity>
                                                    )
                                                }
                                                {
                                                    this.props.continuous &&
                                                    <TouchableOpacity
                                                        activeOpacity={this.props.nextBtnFun ? 0.5 : 1}

                                                        style={{ padding: 10, width: 40, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end", marginLeft: 10 }}
                                                        onPress={() => { this.props.nextBtnFun && this.props.nextBtnFun() }}
                                                    >
                                                        <SvgVideoNextBtn height="20" width="22" fill={this.props.nextBtnFun ? "#ffffff" : "#626262"} />


                                                    </TouchableOpacity >
                                                }

                                            </View>
                                            <View style={{ flexDirection: "row", flex: 1, justifyContent: "flex-end" }}>

                                                {
                                                    this.props.continuous &&
                                                    <TouchableOpacity
                                                        activeOpacity={0.5}

                                                        style={{ padding: 10, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end" }}
                                                        onPress={() => { this.setState({ showConts: false, showChangeList: true }) }}
                                                    >
                                                        <Text style={{ color: "#fff" }}>选集</Text>
                                                    </TouchableOpacity >
                                                }
                                                {
                                                    this.props.continuous &&
                                                    <TouchableOpacity
                                                        activeOpacity={0.5}

                                                        style={{ padding: 10, width: 40, bottom: 0, right: 5, zIndex: 9999, alignSelf: "flex-end" }}
                                                        onPress={() => { this.changeSmallBox() }}
                                                    >
                                                        <SvgVideoSmallBox height="20" width="20" />
                                                    </TouchableOpacity >
                                                }
                                            </View>

                                        </View>
                                    }
                                    {/* 阴影 */}
                                </Animated.View>
                                :
                                null
                        }
                    </View>
                    {/* 屏大小切换 */}

                    {
                        //拖动进度条展示拖动当前时时间

                        <View
                            ref={"gotimeSpeed"}
                            style={{
                                left: this.state.width / 2 - 45, position: "absolute",
                                top: 50, bottom: 50, justifyContent: "center",
                                opacity: 0,
                                width: 0
                            }}>
                            <View style={{
                                flexDirection: "row", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                                paddingVertical: 6, borderRadius: 4,
                            }}>
                                <View><Text style={{ color: "#fff" }}>{goSpeedTime}</Text></View>
                                <View><Text style={{ color: "#fff" }}>/</Text></View>
                                <View><Text style={{ color: "#fff" }}>{allTime}</Text></View>
                            </View>
                        </View>

                    }
                    {
                        /* loading */
                        <Loading {...this.state} spin={spin} />
                    }

                    {/* 音量 this.state.height / 2 - 20 + this.state.statusBarH / 2*/}
                    {
                        this.state.showVolume ?
                            <View
                                style={{
                                    left: this.state.width / 2 - 80, position: "absolute",
                                    top: 0, bottom: 0, justifyContent: "center",
                                }}>
                                <View style={{
                                    flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", alignItems: 'center', backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10,
                                    paddingVertical: 11, borderRadius: 6,
                                }}>
                                    {
                                        this.state.soundWidth > 0 ? <SvgVideoSound width="20" height="20" /> : <SvgVideoNoSound width="20" height="20" />
                                    }
                                    <View style={{ backgroundColor: "rgba(255,255,255,0.5)", height: 2, width: 100, marginLeft: 8 }}>
                                        <Animated.View style={{ backgroundColor: "#ea7a99", width: this.state.soundWidth && this.state.soundWidth, zIndex: 99999, height: 2 }}></Animated.View>
                                    </View>
                                </View>
                            </View>
                            :
                            null
                    }

                    {/* 亮度*/}
                    {
                        this.state.showBrightness ?
                            <View
                                style={{
                                    left: this.state.width / 2 - 80, position: "absolute",
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
                                        <Animated.View style={{ backgroundColor: "#ea7a99", width: this.state.brightnessWidth && this.state.brightnessWidth, zIndex: 99999, height: 2 }}></Animated.View>
                                    </View>
                                </View>
                            </View>
                            :
                            null
                    }

                    {
                        this.state.showChangeList &&
                        this.props.renderAllSeenList && this.props.renderAllSeenList()
                    }



                </View>
            </>
        )
    }



}

export const NgxuSetting = function () {
    this.hideAndroidBottom = () => {
        if (Platform.OS == "android")
            NativeModules.HideBottomNa.hide();
    }
    this.showAndroidBottom = () => {
        if (Platform.OS == "android")
            NativeModules.HideBottomNa.show();
    }
    this.getBrightness = (callback) => {
        SystemSetting.getBrightness().then((brightness) => {
            callback(brightness)
        });
    }
    this.SetBrightness = (e) => {
        Platform.OS === "android" ?
            NativeModules.AppBrightness.setAppBrightness(e)
            :
            SystemSetting.setBrightnessForce(e).then((success) => {
                !success && Alert.alert('没有权限', '您无权限改变屏幕亮度', [
                    { 'text': '好的', style: 'cancel' },
                    { 'text': '打开设置', onPress: () => SystemSetting.grantWriteSettingPermission() }
                ])
            });
    }
}

export default VideoPlayer


//修复播放不同分辨率视频，不会重新测量分辨率的问题https://github.com/react-native-community/react-native-video/pull/2053
import React from 'react';
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
    Platform
} from 'react-native';
import {
    Loading,
    TipsPaused,
    Brightness,
    Volume,
    BottomSpeed,
    Speed,
    Header,
    SpeedTipTime,
    Lock
} from './view/index';
import {
    SvgVideoNextBtn,
    SvgVideoSetting,
    SvgVideoStop,
    SvgVideoPlay,
    SvgVideoAllBox,
    SvgVideoSmallBox,
    SvgVideoBack,
    SvgVideoScang
} from './component/svg';
import SystemSetting from 'react-native-system-setting';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { formatSeconds } from './utils/formatSeconds';
import Orientation from 'react-native-orientation-locker';
import { getMaxdata } from './utils/getMaxdata';

const { height, width } = Dimensions.get('screen');


class VideoPlayer extends React.Component {
    static defaultProps = {
        autoPlay: true,
        showSmallCont: true,
        speedColor:"#e54602",
        dotColor:"#e54602",
        dotBorderColor:"rgba(255,255,255,0.3)",
        bottomSpeedColor:"#e54602",
        cachColor:"#ffffff",
        allSpeedColor:"rgba(0,0,0,0.4)"
    }
    constructor(props) {
        super(props)
        this.noVipSecond = this.props.noVipSecond || 5//没有vip可观看的分钟数
        this.url = this.props.url
        this.spinValue = new Animated.Value(0)
        this.adminBrightness = ''
        this.soundData = 0//音量
        this.soundDataY = 0
        this.speedData = 0//滑动进度
        this.speedDataX = 0
        this.BrightnessData = 0//亮度
        this.BrightnessY = 0
        this.nowTime = "00:00"
        this.nowCurrentTime = 0//当前播放秒数
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
                onload: false,//视频加载状态
                admRePlay: false,//重置视频进度状态
                opacity: new Animated.Value(1),
                paused: true,
                width: width,
                smallP: true,//当前是否是小屏
                statusBarH: 44,
                isEnd: false,//是否播放完了
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
                showLockCont: false//锁的显示状态
            }
        this.animatedonBuffer = this.animatedonBuffer.bind(this)
    }


    componentWillUnmount() {
        Orientation.lockToPortrait();
        Platform.OS === "android" 
        ? NativeModules.HideBottomNa.show()
        : NativeModules.RNIndicator.alwaysVisible();
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
        Platform.OS === "android" 
        ? NativeModules.HideBottomNa.hide()
        : NativeModules.RNIndicator.autoHidden();
        Orientation.lockToLandscape()
        this.props.onWindowChange && this.props.onWindowChange("full")
    }
    //小屏
    changeSmallBox = () => {
        this.setSmall()
        Orientation.lockToPortrait()
        this.props.onWindowChange && this.props.onWindowChange("small")
        Platform.OS === "android" 
        ? NativeModules.HideBottomNa.show()
        : NativeModules.RNIndicator.alwaysVisible();
    }


    setAll = () => {
        this.playhideContsDotX = this.dotX.interpolate({
            inputRange: [0, this.state.duration],
            outputRange: [0, height],
            extrapolate: 'clamp'
        })
        this.props.navigation && this.props.navigation.setParams({ enableGestures: false });
        this.dotspeed && this.dotspeed.setdotStart(false)
        this.setState({
            width: height + 0,//StatusBar.currentHeight
            height: width,
            statusBarH: 0,
            smallP: false,
            showConts: false,
            showLockCont: false,
            LinearGradientHeight: 100,
            topContsTop: 30,
            bottomContsBottom: this.props.continuous ? 30 : 0,

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
        this.dotspeed && this.dotspeed.setdotStart(false)
        this.setState({
            width: width,
            height: width * 210 / 375,
            statusBarH: 0,//
            smallP: true,
            showConts: false,
            showLockCont: false,
            LinearGradientHeight: 60,
            topContsTop: 0,
            bottomContsBottom: 0,

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
        if (this.props.autoPlay) {
            this.setState({
                paused: false
            })
        }
        // Orientation.lockToLandscape();
        // Orientation.addOrientationListener(this._orientationDidChange);//监听屏幕方向
    }

    //控制loading加载器的显示隐藏
    animatedonBuffer(event) {
        this.props.onBuffer && this.props.onBuffer(event)
        this.setState({
            showLoading: Platform.OS === "android" ? (event.isBuffering ? true : false) :(!this.state.paused&&true) 
        })
    }

    //播放进度  包含进度条  以及当前播放时间
    animatedDot = (e) => {
        this.props.onProgress && this.props.onProgress(e)

        if (!this.ismoveDot) {
            this.nowCurrentTime = e.currentTime
        }

        this.nowTime = formatSeconds(e.currentTime)
        !this.ismoveDot && this.dotspeed && this.dotspeed.setSpeed(e)

        if (!this.state.showOpenVip && this.props.VIPCONTS) {
            e.currentTime >= this.noVipSecond
                &&
                this.setState({ showOpenVip: true, paused: true, showConts: false }, () => {
                    !this.state.smallP && this.changeSmallBox();
                })
        }

        this.state.showLoading && Platform.OS === "ios" && this.setState({ showLoading: false })

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
            onStartShouldSetPanResponder: (evt, gestureState) => true,//锁定控件时 禁用手势
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2
            },

            onPanResponderGrant: (evt, gestureState) => {
                clearTimeout(this.TimeHideConts)//拖动时禁止隐藏控件

                //初始化 记录滑动的xy值
                this.recordHandeY = []; this.recordHandeX = [];

                // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
                this.startX = evt.nativeEvent.pageX;

                this.startY = evt.nativeEvent.pageY;
                //显示控件
                this.showLockAndCont()

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
                if (this.LockRef && this.LockRef.state.lock) return//锁定控件时 禁用手势
                // console.log("moveYData",)
                this.moveXData = evt.nativeEvent.pageX - this.startX

                this.soundDataY = (this.startY + 30 - gestureState.moveY) / (this.state.height)
                this.BrightnessY = (this.startY + 30 - gestureState.moveY) / (this.state.height)

                this.speedDataX = (gestureState.moveX - this.startX)

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
                                        this.VolumeRef && this.VolumeRef.setsoundWidth(100)
                                    }
                                    if (this.soundData >= 0 && this.soundData <= 1) {
                                        this.VolumeRef && this.VolumeRef.setsoundWidth(this.soundData / 1 * 100)
                                    }
                                    if (this.soundData < 0 && this.soundData <= 1 && this.state.soundWidth != 0) {
                                        this.VolumeRef && this.VolumeRef.setsoundWidth(0)
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
                                        this.BrightnessRef && this.BrightnessRef.setBrightnessWidthFun(100)
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
                                        this.BrightnessRef && this.BrightnessRef.setBrightnessWidthFun(this.brightnessData / 1 * 100)
                                    }
                                    if (this.brightnessData < 0 && this.brightnessData <= 1 && this.state.brightnessWidth != 0) {
                                        this.BrightnessRef && this.BrightnessRef.setBrightnessWidthFun(0)
                                    }
                                }
                            }
                        }
                    } else {
                        //console.log("左右滑动调节播放进度")
                        if (this.state.onload && Math.abs(this.moveXData) > 0) {
                            const { duration, width } = this.state

                            !this.ismoveDot && this.dotspeed && this.dotspeed.setNativeProps({
                                style: { borderColor: "rgba(255,255,255,0.5)" }
                            })

                            /**调节进度开始**/
                            !this.ismoveDot && (this.ismoveDot = true);
                            this.dotspeed && this.dotspeed.setdotStart(true)

                            /**调节进度结束**/
                            this.changeSpeedTip({ opacity: 1, display: null, width: null })

                            clearTimeout(this.TimeHideConts)//拖动进度条时禁止隐藏控件
                            this.realMarginLeft = this.speedDataX / 2; //2为快进退的手势速度 必须大于0
                            if (this.realMarginLeft >= width - 200) {
                                this.realMarginLeft = width - 200
                            }
                            this.speedtime = duration > 60 * 30 ? (this.realMarginLeft) : (this.realMarginLeft) / (width) * duration//快进的时长 单位s
                            this.speedalltime = getMaxdata(this.nowCurrentTime + this.speedtime, duration)
                            this.SpeedTipTimeRef && this.SpeedTipTimeRef.setgoSpeedTime(formatSeconds(
                                this.speedalltime
                            ))
                            this.dotspeedWidth = (width - 200) / duration * (this.speedalltime)
                            this.reasut = this.dotspeedWidth
                            this.dotspeed && this.dotspeed.setdotWidth(this.reasut)
                        }
                    }
                }
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {


                // this.props.navigation.setParams({ enableGestures: true });
                if (this.LockRef && this.LockRef.state.lock) return false//锁定控件时 禁用手势

                this.activateAutoHide()//激活自动隐藏

                this.dotspeed && this.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })

                let speedB = '';

                speedB = this.speedalltime
                if (speedB) {

                    speedB >= this.state.duration ?
                        this.player.seek(speedB - 2)
                        :
                        this.player.seek(speedB);
                    this.speedalltime = '';
                }



                this.changeSpeedTip({ opacity: 0, display: "none", width: 0 })
                this.ismoveDot = false

                // this.activateAutoHide()//激活自动隐藏
                //调节完音量后隐藏音量显示器
                if (this.state.showVolume) {
                    this.hideVolumeTime = setTimeout(() => { this.setState({ showVolume: false }) }, 800)
                }
                //调节完亮度后隐藏亮度显示器
                if (this.state.showBrightness) {
                    this.hideBrightnessTime = setTimeout(() => { this.setState({ showBrightness: false }) }, 800)
                }

                if (Math.abs(this.moveXData) > 5) {
                    this.changeSpeedTip({ opacity: 0, display: "none", width: 0 })
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
                this.dotspeed && this.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })

                this.changeSpeedTip({ opacity: 0, display: "none", width: 0 })
                this.ismoveDot = false
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

                if (this.state.showOpenVip || !this.state.onload) return//需要权限 或者视频还不可以播放时停止不允许滑动进度条
                this.dotspeed.setNativeProps({
                    style: { borderColor:this.props.dotBorderColor }
                })
                this.changeSpeedTip({ opacity: 1, display: null, width: null })
                clearTimeout(this.TimeHideConts)//拖动进度条时禁止隐藏控件

                this.ismoveDot = true
                // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
                this.touchX = evt.nativeEvent.locationX;
                this.dotspeed.setdotStart(true)
                // this.setState({ dotWidth: evt.nativeEvent.pageX - 100, })
                this.dotspeed.setdotWidth(evt.nativeEvent.pageX - 100)
                // this.playDotX=null
                // gestureState.{x,y} 现在会被设置为0
            },
            onPanResponderMove: (evt, gestureState) => {
                // 最近一次的移动距离为gestureState.move{X,Y}

                if (this.state.showOpenVip || !this.state.onload) return//需要权限 或者视频还不可以播放时停止不允许滑动进度条
                this.realMarginLeft = gestureState.moveX - this.touchX - 85;
                if (this.realMarginLeft >= this.state.width - 200) {
                    this.realMarginLeft = this.state.width - 200
                }
                // console.log("realMarginLeft",this.realMarginLeft)
                // console.log("当前",)
                if (this.realMarginLeft > 0) {
                    //    this.setState({

                    //         // dotWidth: this.realMarginLeft,
                    //         //想要拖动快进的时间
                    //         goSpeedTime: formatSeconds((this.realMarginLeft) / (this.state.width - 200) * this.state.duration)
                    //     })

                    this.SpeedTipTimeRef && this.SpeedTipTimeRef.setgoSpeedTime(formatSeconds((this.realMarginLeft) / (this.state.width - 200) * this.state.duration))
                    this.dotspeed.setdotWidth(evt.nativeEvent.pageX - 100 >= this.state.width - 200 ? this.state.width - 200 : evt.nativeEvent.pageX - 100)
                }
                // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // this.props.navigation.setParams({ enableGestures: true });
                if (this.state.showOpenVip) return//需要权限时停止不允许滑动进度条
                this.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })
                this.activateAutoHide()//手指离开后激活自动隐藏
                let speedB = (this.dotspeed.state.dotWidth) / (this.state.width - 200)
                if (speedB >= 1) {
                    this.player.seek(this.state.duration * speedB - 2)
                } else {
                    this.player.seek(this.state.duration * speedB)
                }
                this.changeSpeedTip({ opacity: 0, display: "none", width: 0 })
                this.ismoveDot = false
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.changeSpeedTip({ opacity: 0, display: "none", width: 0 })
                this.dotspeed.setNativeProps({
                    style: { borderColor: "rgba(255,255,255,0)" }
                })
                this.ismoveDot = false//判断是否触摸按住进度条上的点
                this.activateAutoHide()//激活自动隐藏
                return true;
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                return false;
            },
        });
    }


    changeSpeedTip = (e) => {
        this.SpeedTipTimeRef && this.SpeedTipTimeRef.refs.gotimeSpeed.setNativeProps({ style: e })
    }

    //快速隐藏控件
    fastHideConts = () => {
        this.fastHide.start(() => { this.setState({ showConts: false, showLockCont: false }) })
    }

    //激活自动隐藏
    activateAutoHide = () => {
        this.TimeHideConts = setTimeout(this.fastHideConts, 5000);
    }

    //重置播放
    rePlay = (autoPlay = true, admRePlay = true) => {
        this.adminPaused = true;

        //admRePlay//重置当前播放时间

        const GSTATE = { admRePlay: admRePlay, showChangeList: false }

        if (this.state.isEnd) {

            this.player.seek(0)
            setTimeout(() => {
                autoPlay
                    ?
                    this.setState({ paused: true, isEnd: false, showConts: true, ...GSTATE }, () => { this.setState({ paused: false }) })
                    :
                    this.setState({ isEnd: false, showConts: true, ...GSTATE });
            }, 300)

        } else {
            if (!this.state.paused) {
                this.setState({ paused: true, ...GSTATE }, () => { autoPlay && this.setState({ paused: false }) });
            }
        }

        if (this.state.paused && !this.state.isEnd) {

            this.setState({ paused: autoPlay ? false : true, ...GSTATE });
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


    showLockAndCont = () => {
        const GSHOWSTATE = { showLockCont: true, showConts: true, showChangeList: false }
        const animaFun = () => {
            this.hide.stop(); this.AnimatedOp.stop(); this.fastHide && this.fastHide.stop();
        }
        if (this.LockRef && !this.LockRef.state.lock) {
            this.AnimatedOp.start(() => { this.setState({ ...GSHOWSTATE }); animaFun() }); // 开始执行动画
        } else {
            !this.LockRef
                ?
                this.AnimatedOp.start(() => { this.setState({ ...GSHOWSTATE }); animaFun() }) // 开始执行动画
                :
                this.AnimatedOp.start(() => { this.setState({ showLockCont: true, showChangeList: false }); animaFun() }); // 开始执行动画
        }
    }

    //显示控件
    showConts = () => {
        try {
            clearTimeout(this.TimeHideConts)
            //当提示要vip 暂停播放时 禁止双击暂停播放
            if (!this.state.showOpenVip) {
                if (this.lastBackPressed && this.lastBackPressed + 300 >= Date.now()) {
                    // clearTimeout(this.Timeout)
                    if (this.LockRef && this.LockRef.state.lock) return//锁定控件时 禁用手势
                    this.adminPaused = true
                    this.state.paused ? this.rePlay(true, false) : this.setState({ paused: true, })
                    this.state.opacity.setValue(1)
                    return
                } else {
                    this.lastBackPressed = Date.now();
                }
            }
            // this.Timeout = setTimeout(() => {
            if (this.state.showConts || this.state.showLockCont) {//立即消失
                this.hide.stop()
                this.fastHideConts()
            } else {
                this.hide.stop();
                //点击视频显示控件
                this.showLockAndCont()
            }
            // }, 300)
            this.activateAutoHide()//激活控件自动隐藏
        } catch (error) {

        }
    }


    onLoad = (data) => {
        this.props.onLoad && this.props.onLoad(data)
        //视频总长度
        this.setState({ duration: data.duration, allTime: formatSeconds(data.duration), showChangeList: false, admRePlay: false, onload: true });
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

    btnPasuedfun = () => {
        !this.state.showOpenVip && (this.adminPaused = true, this.setState({ paused: true }))
    }

    //视频地址改变的回调
    onchangeUrl = () => {
        this.setState({
            onload: false
        })
    }

    render() {
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],//输入值
            outputRange: ["0deg", "360deg"] //输出值
        })
        var propsObj = { ...this.props }
        delete (propsObj["paused"])

        if (this.url && this.url != this.props.url) {
            this.onchangeUrl()
        }
        this.url = this.props.url
        const { smallP, allTime, LinearGradientHeight, showOpenVip, topContsTop, bottomContsBottom } = this.state
        const preShowSmallCont = smallP?(this.props.showSmallCont?true:false):true
        return (
            <>
                {this.props.statusBar ? (smallP && this.props.statusBar()) : <Header width={this.state.width} />}
                <View ref={ref => this.videoBox = ref} style={{ backgroundColor: "#000", position: 'relative' }}>

                    <View style={{}}>

                        <View  {...this._panResponder.panHandlers} style={{ height: this.state.height, width: this.state.width, }}
                            activeOpacity={1}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={this.showConts}
                            >
                                <Video
                                    key={this.url}
                                    source={{ uri: this.props.url }}
                                    ref={(ref) => { this.player = ref }}
                                    continuous={this.props.continuous ? true : false}//是否是连续剧，用来全屏展示选集，下一集按钮    重新加载Video标签，防止出现上个视频和下个视频分辨率不切换的问题　
                                    {...propsObj}
                                    repeat={this.props.repeat ? this.props.repeat : false}
                                    onSeek={(e) => {
                                        this.props.onSeek && this.props.onSeek(e)
                                        this.setState({ isEnd: false })
                                    }}
                                    posterResizeMode={"cover"}//封面大小
                                    playWhenInactive={true}//确定当通知或控制中心在视频前面时，媒体是否应继续播放。
                                    paused={this.adminPaused ? this.state.paused : (this.props.autoPlay ? false : true)}//暂停
                                    onLoad={this.onLoad}
                                    onEnd={this.reVideo}
                                    resizeMode={"none"}
                                    onReadyForDisplay={(e) => {
                                        this.props.onReadyForDisplay && this.props.onReadyForDisplay(e)
                                    }}
                                    controls={false}
                                    onProgress={this.animatedDot}
                                    onBuffer={(e) => this.animatedonBuffer(e)}
                                    onError={this.videoError}
                                    width={this.props.width ? this.props.width : this.state.width}
                                    style={{ height: this.state.height, backgroundColor: "#000000" }} />
                            </TouchableOpacity>
                        </View>

                        {this.state.showConts ?
                            <Animated.View
                                style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: this.state.opacity, height: 30 }}
                            >
                                {/* 阴影 */}
                                <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']} style={{ height: LinearGradientHeight, width: this.state.width }}></LinearGradient>
                                {/* 返回键 */}
                                {preShowSmallCont&&<TouchableOpacity 
                                style={{position: "absolute", top: topContsTop, left: smallP ? 5 : this.props.continuous ? 45 : 5, padding: 10, zIndex: 999, }}
                                    //如果是全屏 点击返回键是切换到小屏  反之返回上个页面
                                    onPress={() => {
                                        if (this.state.smallP) {
                                            this.props.onSmallBack && this.props.onSmallBack()
                                            // this.props.navigation.goBack()
                                        } else { this.changeSmallBox() }
                                    }}
                                >
                                    <SvgVideoBack height="20" width="20" />
                                </TouchableOpacity>}
                                {/* 收藏|更多 */}
                                <View style={{ position: "absolute", top: topContsTop, right: smallP ? 5 : this.props.continuous ? 45 : 5, flexWrap: "nowrap", flexDirection: "row", zIndex: 10, }}>
                                    <TouchableOpacity style={{ padding: 8 }}
                                        onPress={this.props.onStore && this.props.onStore}
                                    >
                                        {this.props.storeComponent ? this.props.storeComponent() : <SvgVideoScang height="20" width="20" />}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ padding: 8, marginLeft: 1, }}
                                        onPress={this.props.onMoreFun && this.props.onMoreFun()}
                                    >
                                        {this.props.moreSetting ? this.props.moreSetting() : <SvgVideoSetting height="20" width="20" />}
                                    </TouchableOpacity>
                                </View>
                            </Animated.View >
                            :
                            null}
                        {showOpenVip && this.props.VIPCONTS
                            &&
                            <ShouldPermissionTitle openViptipBOTTOM={bottomContsBottom + 40} />}
                        {//控件隐藏时候，最下面显示的进度
                            this.state.showConts ? null :
                                <BottomSpeed
                                    bottomSpeedColor={this.props.bottomSpeedColor}
                                    playhideContsDotX={this.playhideContsDotX}
                                    admRePlay={this.state.admRePlay}
                                    {...this.state}
                                />
                        }

                        {this.props.lockControl &&
                            <Lock
                                ref={(ref) => this.LockRef = ref}
                                showContsfun={(e) => { this.setState({ showConts: e }) }}
                                {...this.state}
                            />
                        }


                        {
                            this.state.showConts &&
                            <LinearGradient
                                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
                                style={{ height: LinearGradientHeight, width: this.state.width, position: "absolute", bottom: this.state.smallP ? 0 : -bottomContsBottom }}
                            ></LinearGradient>
                        }

                        {
                            this.state.showConts ?
                                <Animated.View
                                    style={{ width: this.state.width, bottom: bottomContsBottom, opacity: this.state.opacity, zIndex: 99999, position: "absolute", }}>
                                    <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
                                        {/* 播放暂停 */}
                                        {
                                            !this.props.continuous ? (this.state.paused
                                                ?
                                                <TouchableOpacity activeOpacity={1} style={s.touchs} onPress={() => {
                                                    if (!showOpenVip) {
                                                        this.rePlay(true, false)
                                                    }
                                                }}>
                                                    <SvgVideoPlay height="20" width="20" />
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity activeOpacity={1} style={s.touchs} onPress={this.btnPasuedfun}>
                                                    <SvgVideoStop height="20" width="20" />
                                                </TouchableOpacity>
                                            )
                                                :
                                                smallP && (this.state.paused
                                                    ?
                                                    <TouchableOpacity activeOpacity={1} style={s.touchs} onPress={() => {
                                                        if (!showOpenVip) {
                                                            this.rePlay(true, false)
                                                        }
                                                    }}>
                                                        <SvgVideoPlay height="20" width="20" />
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity
                                                        activeOpacity={1}
                                                        style={s.touchs}
                                                        onPress={this.btnPasuedfun}
                                                    >
                                                        <SvgVideoStop height="20" width="20" />
                                                    </TouchableOpacity>
                                                )

                                        }

                                        {/* 进度条 缓存条*/}
                                        <Speed
                                            {...this.state}
                                            color={this.props.speedColor}
                                            cachColor={this.props.cachColor}
                                            dotColor={this.props.dotColor}
                                            dotBorderColor={this.props.dotBorderColor}
                                            allSpeedColor={this.props.allSpeedColor}
                                            admRePlay={this.state.admRePlay}
                                            nowTime={this.nowTime}
                                            panHandlers={this._panSpeeDot.panHandlers}
                                            allTime={allTime}
                                            ref={child => this.dotspeed = child}
                                            playDotX={this.playDotX}
                                            playBufferX={this.playBufferX}
                                            ismoveDot={this.ismoveDot}
                                        />

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
                                                        <TouchableOpacity activeOpacity={1} style={s.touchs} onPress={() => {
                                                            if (!showOpenVip) {
                                                                this.rePlay(true, false)
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
                                                        onPress={() => { this.setState({ showConts: false, showChangeList: true, showLockCont: false }) }}
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

                    {
                        <SpeedTipTime
                            ref={(ref) => this.SpeedTipTimeRef = ref}
                            {...this.state}
                            allTime={allTime}
                        />
                    }

                    {
                        /* loading */
                        <Loading {...this.state} spin={spin} />
                    }
                    {
                        this.adminPaused && this.state.paused && <TipsPaused {...this.state} />
                    }

                    {/* 音量 this.state.height / 2 - 20 + this.state.statusBarH / 2*/}
                    {
                        this.state.showVolume ?
                            <Volume ref={(ref) => this.VolumeRef = ref} {...this.state} />
                            :
                            null
                    }

                    {/* 亮度*/
                        this.state.showBrightness ?
                            <Brightness ref={(ref) => this.BrightnessRef = ref}  {...this.state} />
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

const s = StyleSheet.create({
    touchs: { bottom: 0, left: 5, padding: 10, zIndex: 999, }

})

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


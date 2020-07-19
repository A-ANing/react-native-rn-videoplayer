
# react-native-rn-videoplayer
- 可以上下滑动改变音量、屏幕亮度，拖动进度条显示要改变的时间，全屏切换，缓存进度，双击视频暂停，等功能，基于react-native-video
- ps：Android改变亮度无需获取高级权限，只改变当前active也就是当前页面的亮度，改变亮度后，返回进入到其他页面会恢复到原来的亮度。

## 目前只支持rn0.60以下的版本



### [简书地址](https://www.jianshu.com/p/a6f09d2ab09c)

- gif预览 ios 和 android

<img src="https://github.com/ngxu/ngxu.github.io/blob/master/img/ios_demo.gif?raw=true" width=320 height=693/>&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/ngxu/ngxu.github.io/blob/master/img/VEditor_20200514220024.gif?raw=true" width=320 height=693 />
<video controls="" autoplay="" name="media"><source src="https://vfx.mtime.cn/Video/2020/01/13/mp4/200113092021600382_1080.mp4" type="video/mp4"></video>

## Getting started

1. 
```shell
npm install react-native-rn-videoplayer --save
```
2. 
```shell
react-native link react-native-linear-gradient
react-native link react-native-orientation-locker
react-native link react-native-svg
react-native link react-native-system-setting
react-native link react-native-video
```

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`

- Add 
  
```java
import android.content.Intent; // <--- import`
import android.content.res.Configuration; // <--- import
public class MainActivity extends ReactActivity {

   ...
         
 @Override
      public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
    ...
}
```
  
2. Append the following lines to `android/settings.gradle`:
  	``` javascript
  	include ':react-native-rn-videoplayer'
  	project(':react-native-rn-videoplayer').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-rn-videoplayer/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-rn-videoplayer')
  	```

4. Open up `android/app/src/main/java/[...]/MainApplication.java`

	- Add 
  ```java
  import com.ngxu.videoplayer.RNVideoplayerPackage;

  new RNVideoplayerPackage() //to the list returned by the `getPackages()` method
 ```

#### iOS

Add the following to your project's `AppDelegate.m`:

```diff
+#import "Orientation.h"

@implementation AppDelegate

// ...

+- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
+  return [Orientation getOrientation];
+}

@end
```


## Usage
```javascript
import Videoplayer from 'react-native-rn-videoplayer';

<VideoPlayer
url={"https://xxxxx.mp4"}
navigation={this.props.navigation}//路由 用于小屏屏播放的返回按钮
ref={(ref)=>this.player=ref}
poster={"http:XXX.jpg"}//视频封面
/>

```
# api
- url 视频地址

- continuous 是否开启全屏时的选集功能 适合连续剧 默认 false
  ```js
    continuous={true}
  ```

- renderAllSeenList 点击选集后显示的集数列表
  ```js
  ···
  <VideoPlayer
    url={"https://xxxxx.mp4"}
    ref={(ref)=>this.player=ref}
    renderAllSeenList={this.renderAllSeenList}
  />
    
  ···
    renderAllSeenList = () => (
    <View style={{ width: height / 2.5, backgroundColor: "rgba(0,0,0,0.6)", position: "absolute", top: 0, bottom: 0, right: 0, }}>
        <ScrollView>
          <Button 
            onPress={()=>{
                const newdata = this.state.data
                      newdata.index = newindex//集数
                //更新集数 并重新开始播放
                this.setState({ data: newdata }, () => { this.player.rePlay() })
            }}
            
          />  
        </ScrollView>      

      </View>
    )

  ```

- nextBtnFun 全屏时下一集按钮的方法 当是最后一集的时候应将值变为false，将按钮置灰
  ```js
  const {data} = this.state
  //data.index为集数
  //当当前播放的集数和总集数相同时，将nextBtnFun重置为false
  nextBtnFun={
    data.index == data.datalist[data.datalist.length - 1].num - 1 ? false : this.nextBtnFun
    }
  ```

- storeComponent 右上角收藏按钮的图标 
  ```javascript
    storeComponent={()=><Image/>}
  ```
- moreSetting 右上角更多按钮的图标 
  ```javascript
    moreSetting={()=><Image/>}
  ```
- setPaused 播放暂停   
  ```javascript
    this.player.setPaused(true)//true暂停；false播放；

    <VideoPlayer
     ref={(ref)=>this.player=ref}
    >

  ```
- reLoad 重新加载
  ```javascript
    this.player.reLoad()

    <VideoPlayer
     ref={(ref)=>this.player=ref}
    >

  ```
- onSmallBack 当视频是小窗口时 点击返回按钮的回调 可以在此添加返回上个页面的功能  func
- onStore 点击右上角收藏按钮的回调 func
- onMoreFun 点击右上角更多按钮的回调 func
- onWindowChange 窗口改变的回调 func
  ```javascript

    <VideoPlayer
      onWindowChange={(e)=>{}}//e:"full"全屏 "small"小屏 
    >

  ```

- onLoad 视频加载成功可以开始播放的回调 继承react-native-veideo
- onSeek 调整进度后的回调 继承react-native-video的onSeek
- onEnd  播放完的回调 继承react-native-video的onSeek
- onBuffer 是否处于等待加载时 这里可以取到视频卡住展示loading或者是视频可以播放隐藏loading的回调 继承react-native-video的onBuffer
- poster 视频封面图 视频还不能播放的时候展示的封面图 并不是loading框  继承react-native-video的poster eg:poster={"http://i1.hdslb.com/bfs/archive/784013a39c59aede1ee9e775ec271790dfd7dc4b.jpg@320w_200h.jpg"}

- ..... 继承全部的react-native-video的方法及属性

# 自己的方法
- changeWindows() 切换全屏或者小屏

changeWindows(boolean)  true 全屏， false 小屏

Example:
```javascript
<VideoPlayer ref={(ref)=>this.player=ref}/>
this.player.changeWindows(true); // 全屏
```



# 暴露方法
`import {NgxuSetting} from 'react-native-rn-videoplayer'`
##  你可以不使用NgxuSetting， NgxuSetting是我暴露除了自己封装以及其他库的原生方法如改变音量 显示隐藏Android底部虚拟按键 以及改变屏幕亮度的方法，如果你在其他地方需要用到你可以引用进来。

# 显示或者隐藏安卓底部虚拟按键
```javascript
NgxuSetting.hideAndroidBottom()
NgxuSetting.showAndroidBottom()
```

# 获取手机系统亮度
```javascript
NgxuSetting.getBrightness((e)=>{consoloe.log(e)})
```



# 改变ios系统亮度 android 当前app亮度
 - android仅仅只改变当前active亮度，不会修改系统亮度，修改系统亮度是非常麻烦的事情，需要用户手动打开手机设置，app权限设置，手动打开“允许修改系统设置“的高级权限
 - ios则是改变系统亮度你可以
 ```javascript
    NgxuSetting.SetBrightness(1)//0-1之间
  ```

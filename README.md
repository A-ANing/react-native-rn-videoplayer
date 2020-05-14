
# react-native-rn-videoplayer

# 使用方法
`import VideoPlayer,{NgxuSetting} from 'react-native-rn-videoplayer'`
 - 你可以不使用{NgxuSetting},
`import VideoPlayer from 'react-native-rn-videoplayer'`

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
## Getting started

1. 
`$ npm install react-native-rn-videoplayer react-native-linear-gradient@2.5.6 react-native-orientation@3.1.3 react-native-svg@9.5.1 react-native-system-setting@1.7.2 react-native-video@4.4.4 --save`

2. 

`$ react-native link react-native-videoplayerreact-native-linear-gradient react-native-orientation react-native-svg react-native-system-setting react-native-video`


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

	- Add `import com.ngxu.videoplayer.RNVideoplayerPackage;`
  - Add `new RNVideoplayerPackage()` to the list returned by the `getPackages()` method

#### iOS

No need to do anything, because no ios native code is used




## Usage
```javascript
import Videoplayer from 'react-native-videoplayer';

<VideoPlayer
url={"https://xxxxx.mp4"}
ref={(ref)=>this.player=ref}/>
```
# api
- url 视频地址
- onSmallBack 当视频是小窗口时 点击返回按钮的回调 可以在此添加返回上个页面的功能  
- onStore 点击右上角收藏按钮的回调
- onMoreFun 点击右上角更多按钮的回调
- onWindowChange 窗口改变的回调 (e)=>{} e:"full"大 "small"小


- onLoad 视频加载成功可以开始播放的回调 继承react-native-veideo
- onSeek 继承react-native-video的onSeek
- onEnd  继承react-native-video的onSeek
- onBuffer 继承react-native-video的onBuffer
- ..... 继承全部的react-native-video的方法

# 自己的方法
- changeWindows() 切换全屏或者小屏

changeWindows(boolean)  true 全屏， false 小屏

Example:
```javascript
<VideoPlayer ref={(ref)=>this.player=ref}/>
this.player.changeWindows(true); // 全屏
```

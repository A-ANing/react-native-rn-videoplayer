
# react-native-rn-videoplayer

## Getting started

`$ npm install react-native-rn-videoplayer react-native-linear-gradient@2.5.6 react-native-orientation@3.1.3 react-native-svg@9.5.1 react-native-system-setting@1.7.2 react-native-video@4.4.4 --save`

### Anderiod add manully MainActivity.java


`$ react-native link react-native-videoplayer`

### Manual installation


#### iOS

No need to do anything, because no ios native code is used

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
## Usage
```javascript
import Videoplayer from 'react-native-videoplayer';

// TODO: What to do with the module?
Videoplayer;
```
  
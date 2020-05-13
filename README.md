
# react-native-videoplayer

## Getting started

`$ npm install react-native-videoplayer --save`

### Mostly automatic installation

`$ react-native link react-native-videoplayer`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-videoplayer` and add `RNVideoplayer.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNVideoplayer.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.ngxu.videoplayer.RNVideoplayerPackage;` to the imports at the top of the file
  - Add `new RNVideoplayerPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-videoplayer'
  	project(':react-native-videoplayer').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-videoplayer/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-videoplayer')
  	```


## Usage
```javascript
import RNVideoplayer from 'react-native-videoplayer';

// TODO: What to do with the module?
RNVideoplayer;
```
  
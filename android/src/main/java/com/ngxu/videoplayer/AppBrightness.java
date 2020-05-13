package com.ngxu.videoplayer;

import android.widget.Toast;
import android.app.Activity;
import android.content.Context;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.os.Build;
import java.util.Map;
import java.util.HashMap;
import android.view.View;
import java.lang.ref.WeakReference;

public class AppBrightness extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
private static WeakReference<Activity> activity;
    public AppBrightness(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AppBrightness";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }


 
    @ReactMethod
    
   public  void setAppBrightness(float brightnessPercent) {
        SetAppBrightness.goSetAppBrightness(getCurrentActivity(),brightnessPercent);
    }

    

    
}
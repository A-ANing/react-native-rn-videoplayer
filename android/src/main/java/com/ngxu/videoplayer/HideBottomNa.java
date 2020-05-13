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

public class HideBottomNa extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
private static WeakReference<Activity> activity;
    public HideBottomNa(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "HideBottomNa";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }


    /**
     * 要导出一个方法给JavaScript使用，Java方法需要使用注解@ReactMethod。方法的返回类型必须为void。
     * @param message
     * @param duration
     */
    @ReactMethod
    
   public  void hide() {
        HeidBottomBtn.goHide(getCurrentActivity(),"123");
    }
       
@ReactMethod
    
   public  void show() {
        HeidBottomBtn.goShow(getCurrentActivity(),"123");
    }
    

    
}
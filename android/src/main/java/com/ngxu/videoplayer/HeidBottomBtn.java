 package com.ngxu.videoplayer;
 import android.os.Build;
 import android.view.View;
 import android.app.Activity;
 import java.lang.ref.WeakReference;
 import android.view.View; 
import android.graphics.Color; 
import android.view.WindowManager;
import android.view.Window;
 public class HeidBottomBtn {
     
private static WeakReference<Activity> mActivity;
    public static void goHide( Activity activity,String message) {

        

        mActivity=new WeakReference<Activity>(activity);

        if (activity == null) {
            if (mActivity == null) {
                return;
            }
            activity = mActivity.get();
        }

        if (activity == null) return;

        final Activity _activity = activity;

        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                      //隐藏虚拟按键
          

    if (Build.VERSION.SDK_INT > 11 && Build.VERSION.SDK_INT < 19) { // lower api
            View v = _activity.getWindow().getDecorView();
            v.setSystemUiVisibility(View.GONE);
        } else if (Build.VERSION.SDK_INT >= 19) {
            //for new api versions.
            View decorView = _activity.getWindow().getDecorView();
            
            int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION //隐藏系统NavigationBar。
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN 
            |View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_IMMERSIVE
            |View.SYSTEM_UI_FLAG_FULLSCREEN;//隐藏StatusBar。(>=api16)

            decorView.setSystemUiVisibility(uiOptions);
            //设置页面全屏显示
            if (Build.VERSION.SDK_INT >= 28) {
        WindowManager.LayoutParams lp = _activity.getWindow().getAttributes();
        lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        //设置页面延伸到刘海区显示
        _activity.getWindow().setAttributes(lp);
        } 
        }

            }
        });
       
        // Toast.makeText(getReactApplicationContext(), message, duration).show();
   
    }



public static void goShow( Activity activity,String message) {

        

        mActivity=new WeakReference<Activity>(activity);

        if (activity == null) {
            if (mActivity == null) {
                return;
            }
            activity = mActivity.get();
        }

        if (activity == null) return;

        final Activity _activity = activity;

        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                      
          

        //显示虚拟按键
    if (Build.VERSION.SDK_INT > 11 && Build.VERSION.SDK_INT < 19) {
        //低版本sdk
        View v = _activity.getWindow().getDecorView();
        v.setSystemUiVisibility(View.VISIBLE);
    } else if (Build.VERSION.SDK_INT >= 19) {
        View decorView = _activity.getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);
    }


            }
        });
       
        // Toast.makeText(getReactApplicationContext(), message, duration).show();
   
    }
    

}
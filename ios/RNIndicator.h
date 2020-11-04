
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <UIKit/UIKit.h>



@interface HomeIndicatorView : UIViewController
@property BOOL refsAutoHidden;
@end

@interface RNIndicator : NSObject <RCTBridgeModule>
@end
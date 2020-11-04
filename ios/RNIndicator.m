#import "RNIndicator.h"

@implementation HomeIndicatorView

- (BOOL)prefersHomeIndicatorAutoHidden {
    return self.refsAutoHidden;
}

@end


@implementation RNIndicator

- (id) init {
    [self setrefsAutoHidden:NO];
    return [super init];
}

- (void) setrefsAutoHidden: (BOOL) newValue {
    HomeIndicatorView *rootViewController = [self getHomeIndicatorView];

    rootViewController.refsAutoHidden = newValue;
    if (@available(iOS 11.0, *)) {
        [rootViewController setNeedsUpdateOfHomeIndicatorAutoHidden];
    }
}

- (HomeIndicatorView*) getHomeIndicatorView {
    UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
    NSAssert(
        [rootViewController isKindOfClass:[HomeIndicatorView class]],
        @"rootViewController is not of type HomeIndicatorView as expected."
    );
    return (HomeIndicatorView*) rootViewController;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(alwaysVisible) {
    [self setrefsAutoHidden:NO];
}

RCT_EXPORT_METHOD(autoHidden) {
    [self setrefsAutoHidden:YES];
}

@end

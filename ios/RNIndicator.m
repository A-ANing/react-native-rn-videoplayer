#import "RNIndicator.h"


@implementation IndicatorView

- (BOOL)prefersHomeIndicatorAutoHidden {
    return self.prefersAutoHidden;
}

@end


@implementation RNHomeIndicator

- (id) init {
    [self setHidden:NO];
    return [super init];
}

- (void) setHidden: (BOOL) newValue {
    IndicatorView *rootViewController = [self getIndicatorView];

    rootViewController.prefersAutoHidden = newValue;
    if (@available(iOS 11.0, *)) {
        [rootViewController setNeedsUpdateOfHomeIndicatorAutoHidden];
    }
}

- (IndicatorView*) getIndicatorView {
    UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
    NSAssert(
        [rootViewController isKindOfClass:[IndicatorView class]],
        @"rootViewController is not of type IndicatorView as expected."
    );
    return (IndicatorView*) rootViewController;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(alwaysVisible) {
    [self setHidden:NO];
}

RCT_EXPORT_METHOD(autoHidden) {
    [self setHidden:YES];
}

@end

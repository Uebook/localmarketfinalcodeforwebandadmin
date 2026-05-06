import os
import re
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove the `override` keyword from ViewManager setters (started with set) and module methods
    # For ButtonViewManager
    methods_to_unoverride = [
        "setForeground", "setBorderless", "setEnabled", "setBorderRadius", "setBorderTopLeftRadius",
        "setBorderTopRightRadius", "setBorderBottomLeftRadius", "setBorderBottomRightRadius",
        "setBorderWidth", "setBorderColor", "setBorderStyle", "setRippleColor", "setRippleRadius",
        "setExclusive", "setTouchSoundDisabled",
        # For Module
        "handleSetJSResponder", "handleClearJSResponder", "createGestureHandler", "attachGestureHandler",
        "updateGestureHandler", "dropGestureHandler", "install", "flushOperations"
    ]

    for method in methods_to_unoverride:
        content = re.sub(r'override fun ' + method + r'\(', 'fun ' + method + '(', content)

    # Clean up the `mDelegate` getDelegate override just in case it's still failing
    content = re.sub(r'override fun getDelegate\(\):[^{]*\{[^}]*\}', '', content)
    content = re.sub(r'override fun getDelegate\(\)[^=]*=[^\n]*', '', content)

    with open(filepath, 'w') as f:
        f.write(content)

screens_path = 'node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/**/*.kt'
gesture_handler_path = 'node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/**/*.kt'

for file in glob.glob(screens_path, recursive=True):
    patch_file(file)
for file in glob.glob(gesture_handler_path, recursive=True):
    patch_file(file)

print("Overrides stripped!")

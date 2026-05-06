import os
import re
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove the interface implementation from ViewManagers
    # Matches `, RNGestureHandlerButtonManagerInterface<ButtonViewGroup>` etc
    content = re.sub(r',\s*[A-Za-z0-9]+Interface<[^>]+>', '', content)
    
    # 2. Fix RNGestureHandlerModule to directly extend ReactContextBaseJavaModule
    if "RNGestureHandlerModule.kt" in filepath:
        content = content.replace("NativeRNGestureHandlerModuleSpec", "ReactContextBaseJavaModule")
        # Remove the import for NativeRNGestureHandlerModuleSpec
        content = re.sub(r'import com\.swmansion\.gesturehandler\.NativeRNGestureHandlerModuleSpec\n', 'import com.facebook.react.bridge.ReactContextBaseJavaModule\n', content)

    # 3. For any ViewManager that might have had `implements RNGestureHandlerButtonManagerInterface` (Java files)
    content = re.sub(r'implements\s*[A-Za-z0-9]+Interface<[^>]+>', '', content)

    with open(filepath, 'w') as f:
        f.write(content)

screens_path = 'node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/**/*.kt'
gesture_handler_path = 'node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/**/*.kt'
gesture_handler_java = 'node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/**/*.java'

for file in glob.glob(screens_path, recursive=True):
    patch_file(file)
for file in glob.glob(gesture_handler_path, recursive=True):
    patch_file(file)
for file in glob.glob(gesture_handler_java, recursive=True):
    patch_file(file)

print("Interfaces stripped!")

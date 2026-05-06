import os
import re
import glob

def strip_delegates(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Just remove delegate instantiation. The field may exist but won't do any harm if it's not initialized, 
    # but wait, Kotlin `val` without init fails to compile. Let's remove the declaration too.
    content = re.sub(r'private val m?Delegate:\s*ViewManagerDelegate<[^>]+>', '', content)
    content = re.sub(r'm?delegate\s*=\s*[a-zA-Z0-9_]+Delegate<[^>]+>\(this\)', '', content)
    content = re.sub(r'override fun getDelegate\(\)[^=]*=[^\n]*', '', content)
    content = re.sub(r'protected override fun getDelegate\(\)[^=]*=[^\n]*', '', content)
    
    # Let's ensure the `init { }` blocks don't become empty and invalid Kotlin
    content = re.sub(r'init\s*\{\s*\}', '', content)

    with open(filepath, 'w') as f:
        f.write(content)

screens_path = 'node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/**/*.kt'
gesture_handler_path = 'node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/**/*.kt'

for file in glob.glob(screens_path, recursive=True):
    strip_delegates(file)
for file in glob.glob(gesture_handler_path, recursive=True):
    strip_delegates(file)

print("Delegates stripped!")

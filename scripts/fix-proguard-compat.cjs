const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = [
  path.join(root, 'android/app/build.gradle'),
  path.join(root, 'android/capacitor-cordova-android-plugins/build.gradle'),
  path.join(root, 'node_modules/@capacitor/app/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/camera/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/geolocation/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/haptics/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/keyboard/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/local-notifications/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/share/android/build.gradle'),
  path.join(root, 'node_modules/@capacitor/status-bar/android/build.gradle'),
  path.join(root, 'node_modules/@capgo/capacitor-pedometer/android/build.gradle'),
  path.join(root, 'node_modules/capacitor-voice-recorder/android/build.gradle'),
];

const from = "getDefaultProguardFile('proguard-android.txt')";
const to = "getDefaultProguardFile('proguard-android-optimize.txt')";
let changed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(from)) continue;
  fs.writeFileSync(file, src.split(from).join(to), 'utf8');
  changed += 1;
  console.log(`patched: ${file}`);
}

console.log(`done. patched files: ${changed}`);

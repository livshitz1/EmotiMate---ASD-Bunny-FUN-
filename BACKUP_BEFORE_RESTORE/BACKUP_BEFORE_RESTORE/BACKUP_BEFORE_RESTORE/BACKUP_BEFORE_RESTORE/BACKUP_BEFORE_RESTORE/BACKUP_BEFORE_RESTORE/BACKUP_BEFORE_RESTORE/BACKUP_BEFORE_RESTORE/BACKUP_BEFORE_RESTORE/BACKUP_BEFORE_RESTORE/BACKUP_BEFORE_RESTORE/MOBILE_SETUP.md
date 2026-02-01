# הוראות להרצת האפליקציה על iOS ו-Android

## דרישות מוקדמות

### ל-iOS:
- Mac עם macOS
- Xcode (מ-App Store)
- CocoaPods: `sudo gem install cocoapods`
- Node.js ו-npm

### ל-Android:
- Android Studio
- Java JDK 11 או גבוה יותר
- Node.js ו-npm

## התקנה והגדרה

### 1. התקנת תלויות
```bash
npm install
```

### 2. בניית האפליקציה
```bash
npm run build
```

### 3. סנכרון עם Capacitor
```bash
# ל-iOS
npm run capacitor:sync:ios

# ל-Android
npm run capacitor:sync:android

# או לשתי הפלטפורמות
npm run capacitor:sync
```

## פתיחת הפרויקט ב-Xcode (iOS)

### שיטה 1: דרך הפקודה
```bash
npm run capacitor:open:ios
```

### שיטה 2: ידנית
1. פתח את התיקייה `ios` ב-Xcode
2. פתח את הקובץ `App.xcworkspace` (לא `.xcodeproj`!)
3. בחר את המכשיר או סימולטור
4. לחץ על Run (▶️)

## פתיחת הפרויקט ב-Android Studio

### שיטה 1: דרך הפקודה
```bash
npm run capacitor:open:android
```

### שיטה 2: ידנית
1. פתח את Android Studio
2. בחר "Open an Existing Project"
3. בחר את התיקייה `android`
4. המתן לסיום הסנכרון של Gradle
5. לחץ על Run (▶️)

## עדכון הקוד

לאחר כל שינוי בקוד:

1. **בנה את הפרויקט:**
   ```bash
   npm run build
   ```

2. **סנכרן עם הפלטפורמות:**
   ```bash
   npm run capacitor:sync
   ```

3. **רענן את האפליקציה** (אם היא כבר רצה)

## פיתוח עם Hot Reload

לפיתוח מהיר יותר, תוכל להריץ:

```bash
# טרמינל 1: הרצת שרת הפיתוח
npm run dev

# טרמינל 2: סנכרון (אחרי שינויים)
npm run capacitor:sync:ios
# או
npm run capacitor:sync:android
```

ואז ב-Xcode/Android Studio, רענן את האפליקציה.

## הגדרות חשובות

### iOS (Info.plist)
הקובץ נמצא ב: `ios/App/App/Info.plist`

ייתכן שתצטרך להוסיף הרשאות:
- `NSCameraUsageDescription` - אם משתמשים במצלמה
- `NSMicrophoneUsageDescription` - אם משתמשים במיקרופון
- `NSPhotoLibraryUsageDescription` - אם משתמשים בתמונות

### Android (AndroidManifest.xml)
הקובץ נמצא ב: `android/app/src/main/AndroidManifest.xml`

ייתכן שתצטרך להוסיף הרשאות:
- `INTERNET` - כבר מוגדר
- `CAMERA` - אם משתמשים במצלמה
- `RECORD_AUDIO` - אם משתמשים במיקרופון

## בנייה לייצור

### iOS:
1. פתח את הפרויקט ב-Xcode
2. בחר "Any iOS Device" או מכשיר ספציפי
3. Product → Archive
4. בחר את ה-Archive ולחץ "Distribute App"

### Android:
```bash
cd android
./gradlew assembleRelease
```

הקובץ APK יהיה ב: `android/app/build/outputs/apk/release/app-release.apk`

## פתרון בעיות

### iOS:
- אם יש שגיאות ב-CocoaPods: `cd ios/App && pod install`
- אם יש בעיות עם signing: בדוק את ה-Signing & Capabilities ב-Xcode

### Android:
- אם יש שגיאות Gradle: `cd android && ./gradlew clean`
- אם יש בעיות עם SDK: פתח את Android Studio ובדוק את ה-SDK Manager

## מידע נוסף

- [תיעוד Capacitor](https://capacitorjs.com/docs)
- [מדריך iOS](https://capacitorjs.com/docs/ios)
- [מדריך Android](https://capacitorjs.com/docs/android)

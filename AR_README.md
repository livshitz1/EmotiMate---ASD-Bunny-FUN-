# הוראות הפעלה - מערכת AR ותלת-ממד (EmotiMate)

הפריטים שביקשת נוצרו בטכנולוגיית **Web-AR** כדי שיוכלו לרוץ בתוך הפרויקט שלך (Capacitor/Vite).

## 📁 מבנה הקבצים שנוצר
1. `src/scenes/BunnyARScene.tsx` - המנוע הגרפי (שווה ערך ל-ViroARScene).
2. `src/screens/BunnyARScreen.tsx` - המסך הראשי והניווט (שווה ערך ל-Navigator).
3. `public/assets/models/` - התיקייה שבה צריכים לשבת המודלים.

## 🛠 פעולות שצריך לעשות (חשוב!)
מכיוון שאני סייען טקסט, אני לא יכול לייצר עבורך קבצי בינאריים של תלת-ממד (כמו `.glb`). אתה צריך להעתיק את הקבצים שקיבלת לתיקיות הבאות:

1. **העתק את המודלים** לתוך: `public/assets/models/`
   - `bunny_temp.glb` (המודל הראשי)
   - `bunny-eating.glb` (המודל האוכל)
   - `bunny-walk.glb` (המודל ההולך)
   
   *שים לב: הקוד מעודכן להשתמש בשמות האנימציות הפנימיים (Walk, Eat, Idle).*

2. **העתק את המרקר** לתוך: `public/assets/markers/`
   - `carrot-marker.jpg`

## 🚀 איך להשתמש בקוד?
כדי להציג את המסך החדש ב-`App.tsx`, ייבא אותו כך:

```tsx
import BunnyARScreen from './components/AR/BunnyARScreen';

// בתוך ה-Component:
const [show3DAR, setShow3DAR] = useState(false);

// ב-UI:
{show3DAR && (
  <BunnyARScreen 
    language={currentLanguage} 
    onClose={() => setShow3DAR(false)} 
  />
)}
```

## ✨ יתרונות הגישה הזו
- **עובד בכל מקום**: עובד גם בדפדפן, גם ב-iOS וגם באנדרואיד.
- **ללא התקנות נייטיב**: לא דורש Viro או Pod install.
- **איכות גבוהה**: משתמש במנוע ה-AR הנייטיבי של הטלפון (Scene Viewer / Quick Look).

import React from 'react';
import { Language } from '../types';

interface TeacherGuideProps {
  language: Language;
}

export const getTeacherGuideText = (language: Language) => {
  const isHebrew = language === 'he';
  
  if (isHebrew) {
    return `שלום! רציתי לשתף אותך בעדכון קטן לגבי הצלחה אישית של התלמיד/ה שלי היום באפליקציית "ארנב הזמן" (Time Bunny).

מה זה?
זהו עדכון על הצלחה אישית שהתלמיד/ה השיגו היום בעזרת האפליקציה, שעוזרת להם לנהל את הזמן והרגשות שלהם בצורה חיובית.

איך להגיב?
מילה טובה כמו "כל הכבוד!" או "ראיתי את מדבקת ההצלחה שלך!" בפעם הבאה שתפגשו אותם תעשה הבדל עצום עבורם.

המטרה:
לחזק את הקשר בין הבית לבית הספר ולתת חיזוקים חיוביים על התנהגות טובה.

תודה על שיתוף הפעולה!`;
  }

  return `Hello! I wanted to share a small update on a personal success your student achieved today with their "Time Bunny" app.

What is this?
An update on a personal success your student achieved today with their 'Time Bunny' app, which helps them manage their time and emotions positively.

How to respond?
A simple 'Great job!' or 'I saw your success sticker!' next time you see them makes a huge difference.

Goal:
To bridge the gap between home and school and reinforce positive behavior.

Thank you for your cooperation!`;
};

export const TeacherGuide: React.FC<TeacherGuideProps> = ({ language }) => {
  const isHebrew = language === 'he';
  const text = getTeacherGuideText(language);

  return (
    <div className={`p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 ${isHebrew ? 'rtl' : 'ltr'}`}>
      <h3 className="text-lg font-bold text-blue-800 mb-4">
        {isHebrew ? 'מדריך למורה' : 'Teacher Guide'}
      </h3>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    </div>
  );
};

export default TeacherGuide;

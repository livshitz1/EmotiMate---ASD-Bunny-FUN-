import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, IMAGE_GENERATION_PROMPT_TEMPLATE } from '../constants';

// Initialize Google Generative AI Client
// Get API key from environment - prioritize VITE_ prefix for Vite apps
  const getApiKey = () => {
    try {
      // Prioritize import.meta for Vite, but use a safest access pattern
      const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env : null;
      const procEnv = typeof process !== 'undefined' ? process.env : null;
      
      const key = (
        (metaEnv?.VITE_GEMINI_API_KEY) || 
        (metaEnv?.API_KEY) || 
        (procEnv?.VITE_GEMINI_API_KEY) || 
        (procEnv?.API_KEY) || 
        ''
      ).toString().trim();
      
      return key;
    } catch (e) {
      console.warn("Error getting API key:", e);
      return '';
    }
  };

const rawApiKey = getApiKey();

// Validate API key
const isValidGeminiKey = !!rawApiKey && 
  rawApiKey !== 'PASTE_YOUR_KEY_HERE' &&
  rawApiKey.length > 10;

const apiKey = isValidGeminiKey ? rawApiKey : '';

// Initialize Google Generative AI
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

if (!isValidGeminiKey) {
  console.warn("⚠️ Gemini API Key is missing. Using fallback responses.");
}

export const getGeminiClientStatus = () => ({
  configured: isValidGeminiKey,
  keySource: rawApiKey ? 'provided' : 'missing'
});

type CuriosityLanguage = 'he' | 'en' | 'ru';

export const buildLocalCuriosityAnswer = (
  rawQuery: string,
  language: CuriosityLanguage = 'he'
): string => {
  const query = (rawQuery || '').toLowerCase();

  const he = language === 'he';
  const en = language === 'en';

  if (query.includes('מזג') || query.includes('weather') || query.includes('rain') || query.includes('גשם')) {
    if (he) return '⛅🌦️🧥 מזג אוויר הוא מצב האוויר כרגע: שמש, רוח, גשם או עננים. עננים נוצרים מטיפות מים קטנות באוויר, וכשהן כבדות הן יורדות כגשם. אפשר לבדוק תחזית כדי לדעת איך להתלבש היום.';
    if (en) return '⛅🌦️🧥 Weather is how the air feels right now: sunny, windy, cloudy, or rainy. Clouds are tiny water drops in the sky, and when they get heavy they fall as rain. A forecast helps us pick the right clothes for the day.';
    return '⛅🌦️🧥 Погода показывает, что происходит в воздухе сейчас: солнце, ветер, облака или дождь. Облака состоят из маленьких капель воды, и когда они становятся тяжелыми, начинается дождь. Прогноз помогает выбрать одежду.';
  }

  if (query.includes('חלל') || query.includes('space') || query.includes('planet') || query.includes('כוכב')) {
    if (he) return '🪐🚀✨ בחלל יש כוכבים, כוכבי לכת וירחים. כדור הארץ הוא כוכב לכת שמסתובב סביב השמש, והירח מסתובב סביבנו. אסטרונאוטים חוקרים את החלל בעזרת חלליות.';
    if (en) return '🪐🚀✨ Space has stars, planets, and moons. Earth is a planet that moves around the Sun, and the Moon moves around Earth. Astronauts use spacecraft to explore space.';
    return '🪐🚀✨ В космосе есть звезды, планеты и спутники. Земля вращается вокруг Солнца, а Луна вокруг Земли. Астронавты изучают космос на космических кораблях.';
  }

  if (query.includes('דינוז') || query.includes('dino')) {
    if (he) return '🦖🦴🌍 דינוזאורים חיו לפני מיליוני שנים. היו קטנים וגדולים, וחלקם אכלו צמחים וחלקם בשר. אנחנו לומדים עליהם מעצמות ומאובנים שנמצאים באדמה.';
    if (en) return '🦖🦴🌍 Dinosaurs lived millions of years ago. Some were tiny and some were huge, and they ate different foods. We learn about them from fossils found in rocks and soil.';
    return '🦖🦴🌍 Динозавры жили миллионы лет назад. Были маленькие и очень большие виды, и они ели разную еду. Мы узнаем о них по окаменелостям.';
  }

  if (query.includes('ים') || query.includes('דג') || query.includes('fish') || query.includes('sea') || query.includes('ocean')) {
    if (he) return '🌊🐟🫧 בים חיים דגים, אלמוגים וחיות נוספות. דגים נושמים במים בעזרת זימים, שהם כמו פילטר קטן. הים חשוב כי הוא נותן בית להרבה יצורים ושומר על אקלים העולם.';
    if (en) return '🌊🐟🫧 The sea is home to fish, corals, and many other animals. Fish breathe in water with gills, like tiny filters. Oceans are important because they support life and help balance Earth’s climate.';
    return '🌊🐟🫧 В море живут рыбы, кораллы и многие другие существа. Рыбы дышат в воде с помощью жабр, как маленьких фильтров. Океаны важны для жизни и климата.';
  }

  if (query.includes('גוף') || query.includes('לב') || query.includes('brain') || query.includes('body')) {
    if (he) return '🧠❤️👣 הגוף שלנו עובד כמו צוות: המוח חושב, הלב מזרים דם והריאות מכניסות חמצן. שינה, מים ואוכל בריא עוזרים לגוף לעבוד טוב. תנועה קלה כל יום מחזקת אותנו.';
    if (en) return '🧠❤️👣 Your body works like a team: the brain thinks, the heart pumps blood, and the lungs bring in oxygen. Sleep, water, and healthy food help the body work well. Daily movement makes us stronger.';
    return '🧠❤️👣 Наше тело работает как команда: мозг думает, сердце качает кровь, а легкие дают кислород. Сон, вода и полезная еда помогают телу. Движение каждый день делает нас сильнее.';
  }

  if (query.includes('רובוט') || query.includes('robot')) {
    if (he) return '🤖⚙️💡 רובוט הוא מכונה שיכולה לבצע פעולות לפי הוראות. יש רובוטים שמנקים, עוזרים במפעלים ואפילו חוקרים חלל. מה שהופך רובוט לחכם הוא התוכנה שמריצה אותו.';
    if (en) return '🤖⚙️💡 A robot is a machine that follows instructions to do tasks. Some robots clean, help in factories, or explore space. Software is what makes a robot act smart.';
    return '🤖⚙️💡 Робот — это машина, которая выполняет задачи по инструкциям. Есть роботы для уборки, заводов и даже космоса. Программа делает робота «умным».';
  }

  if (he) return '📚✨ שאלה מעולה! בקצרה: זה נושא שאפשר לחקור צעד-צעד עם דוגמה פשוטה מהיום-יום. רוצה שנתחיל ב־3 עובדות קצרות ואז חידון קטן?';
  if (en) return '📚✨ Great question! We can explore it step by step with simple examples. Want 3 quick facts and then a tiny quiz?';
  return '📚✨ Отличный вопрос! Давай разберем его по шагам с простыми примерами. Хочешь 3 коротких факта и мини-викторину?';
};

/**
 * Generates a text response from EmotiMate (the bunny).
 */
export const generateEmotiMateResponse = async (
  userAction: string,
  bunnyState: string,
  history: string,
  contextSummary?: string,
  userMemory?: string,
  rewards?: { streak: number; totalPoints: number; achievements?: any[] },
  isCalmMode?: boolean,
  calmSessionsCount?: number,
  isNightMode?: boolean,
  isMorningMode?: boolean,
  isGoodbye?: boolean,
  isPickUpMode?: boolean,
  isHandshakeCompleted?: boolean,
  isBathTime?: boolean,
  storyTimeActivity?: string,
  firstTask?: string,
  stepsProgress?: number,
  isParentDashboard?: boolean,
  currentSpecialMission?: string,
  isBunnySleeping?: boolean,
  isBedtimeStory?: boolean,
  currentTemp?: number,
  weatherItem?: string,
  isMealTime?: boolean,
  isQuietMode?: boolean
): Promise<string> => {
  console.log("Generating response for action:", userAction);

  const getFallbackResponse = (action: string): string => {
    const act = action.toLowerCase();
    const isHebrew = true; // Default for now, could be passed as param

    if (act.includes('quiet_mode_start')) {
      return "🤫📚🧱 עכשיו זמן שקט. אני הולך לנוח קצת בטלפון, ואולי גם העיניים שלך רוצות לנוח מהמסך? בוא נבחר פעילות רגועה על השולחן. מה מתחשק לך לעשות?";
    }
    if (act.includes('quiet_mode_select')) {
      return "🤫🎨✨ נהדר. אני אהיה כאן בשקט, תראה לי מה יצרת כשתסיים";
    }
    if (act.includes('cleanup_start')) {
      return "🧼✨ גיבורים! איזה כיף היה ליצור יחד! עכשיו בוא נחזיר כל דבר לבית שלו כדי שיהיה לנו נעים ומסודר. אני אשים מוזיקה קצבית ונעשה את זה מהר כמו גיבורים!";
    }
    if (act.includes('helper_complete')) {
      return "וואו! איזה עוזר מדהים אתה! בזכות זה שערכת את השולחן/אספת כביסה, עזרת לכולנו והפכת את הבית לנעים יותר. אני כל כך גאה בך!";
    }

    if (userAction === 'weather_update' && currentTemp !== undefined) {
      return `☀️🌡️👕 הסתכלתי מהחלון וראיתי שהיום יהיה ${currentTemp} מעלות! כדאי לנו ללבוש ${weatherItem || 'בגדים נוחים'} כדי שיהיה לנו נעים בחוץ. מה אתה אומר?`;
    }

    if (act.includes('bedtime_story') || act.includes('story')) {
      return "📖🌙😴 היה היה ארנב קטן ביער של כריות... הוא קפץ מענן לענן עד שהגיע למיטה החמה שלו. עכשיו נסגור עיניים, ננשום עמוק, וניפגש שוב מחר בבוקר. לילה טוב חבר שלי. 😴";
    }
    if (act.includes('gratitude_start')) {
      return "✨🏺😊 היום עבר עלינו יום מעניין. מה הדבר הקטן שעשה לך טוב על הלב היום? בוא נשים אותו בצנצנת התודה שלנו. 😊";
    }
    if (act.includes('gratitude_select')) {
      const selection = act.split(':')[1] || 'הדבר הזה';
      return `✨💖🐰 איזה יופי של בחירה! גם אני מודה על ${selection} ועל זה שהיינו יחד היום. ✨`;
    }
    if (act.includes('weekly_album_open')) {
      let msg = "📚🌟🏆 וואו, תראה כמה דברים נפלאים עשינו יחד השבוע! אני כל כך גאה בך על כל פעם שניסית, שטעמת ושמרת על עצמך. אתה פשוט אלוף!";
      if (rewards && rewards.totalPoints > 50) {
        msg += " קיבלת המון כוכבים השבוע, אולי נבחר יחד פרס מיוחד בחנות?";
      }
      return msg;
    }
    if (act.includes('teacher_share_open')) {
      return "✈️🍎👩‍🏫 וואו, עשית דברים מדהימים השבוע! איזה מהם היית רוצה להראות למורה שלך? אני בטוח שהיא תשמח מאוד לראות כמה השקעת!";
    }
    if (act.includes('grandparents_share_open')) {
      return "💖🏡👵 איזה רעיון נפלא! סבא וסבתא כל כך יתרגשו לראות כמה גדלת ומה למדת לעשות. בוא נשלח להם חיבוק גדול והצלחה אחת מיוחדת!";
    }
    if (act.includes('helper_start')) {
      return "🧺🍽️🪴 הארנב מוכן לעזור! איזה כיף לעזור בבית. מה נרצה לעשות היום? אולי לערוך את השולחן או להשקות את העציצים? כל עזרה קטנה היא הצלחה גדולה!";
    }
    if (act.includes('friendship_start')) {
      return "🤝💖🐰 איזה כיף! שיחקת היום עם חברים? בוא נראה מה עשינו יחד ונוסיף לב של חברות!";
    }
    if (act.includes('friendship_select')) {
      return "🤝🌟✨ וואו! שיחקת עם חבר היום? זה פשוט נהדר! לסדר קוביות יחד/לרוץ יחד זה כל כך כיף. אני כל כך שמח שיש לך חברים טובים כמוך";
    }
    if (act.includes('curiosity_start')) {
      return "🎓🔍📚 ברוכים הבאים למועדון הסקרנות! 🎓 מה נרצה לחקור היום? חלל, דינוזאורים, או אולי משהו אחר? אני מוכן לגלות הכל יחד איתך!";
    }
    if (act.includes('curiosity_question')) {
      const query = action.split(':').slice(1).join(':').trim();
      return buildLocalCuriosityAnswer(query, 'he');
    }
    if (act.includes('dream_share')) {
      if (act.includes('🐉')) {
        return "וואו! חלמת על דרקון? הוא היה דרקון חברותי? אני בטוח שהיית מאוד אמיץ בחלום!";
      }
      if (act.includes('☁️')) {
        return "זה נשמע כמו חלום כל כך רגוע ונעים, בדיוק כמו ענן רך";
      }
      return "וואו, איזה חלום מעניין! אני כל כך שמח שסיפרת לי. חלומות הם כמו הרפתקאות קטנות בראש שלנו. מה הכי אהבת בחלום הזה? ✨☁️";
    }
    if (act.includes('dressed_bunny')) {
      return "תודה רבה שהלבשת אותי! עכשיו אני מרגיש מוכן ומוגן לצאת ליום החדש שלנו. ✨";
    }
    if (act.includes('backpack_ready')) {
      return "איזה יופי, אנחנו מוכנים לגמרי! התיק על הגב ואני איתך בלב.";
    }
    if (act.includes('commute_discovery')) {
      if (act.includes('ראיתי')) return "כל הכבוד! מצאת את זה! בוא נחפש עכשיו משהו ירוק...";
      return "אני רואה בעיניי הקטנות משהו אדום... אתה יכול למצוא אותו בחוץ?";
    }
    if (act.includes('packing')) {
      return "רגע לפני שיוצאים להרפתקה של היום, בוא נבדוק שהכל בתיק שלנו! האם לקחנו את הציוד?";
    }
    if (act.includes('school_gate')) {
      return "הגענו! אני נותן לך חיבוק גדול של כוח. תזכור שאמא/אבא תמיד חוזרים בצהריים, ואני אחכה לך כאן בטלפון עם המון כוכבים חדשים. שיהיה לך יום נפלא!";
    }
    if (act.includes('received_kiss')) {
      return "וואו! הרגשת את זה? אמא/אבא שלחו לך עכשיו נשיקה גדולה באוויר! היא הגיעה ישר ללב שלנו. איזה כיף!";
    }
    if (act.includes('home_arrival')) {
      return "היי! איזה כיף שחזרת, התגעגעתי. מה הדבר הכי מעניין שעשית היום בגן?";
    }
    if (act.includes('experience_art')) {
      return "וואו, יצרת משהו חדש? אני כל כך אוהב לצייר ולבנות יחד איתך!";
    }
    if (act.includes('experience_yard')) {
      return "איזה כיף לשחק בחצר! אני בטוח שרצת וקפצת המון.";
    }
    if (act.includes('experience_food')) {
      return "יאמי! משהו טעים זה תמיד רעיון מצוין. מה אכלת?";
    }
    if (act.includes('experience_puzzle')) {
      return "פאזל? אתה ממש חכם! אני אוהב לפתור בעיות יחד.";
    }
    if (act.includes('experience_friend')) {
      return "לשחק עם חברים זה הכי כיף בעולם. אני שמח שהיה לך עם מי לשחק!";
    }
    if (act.includes('dressing')) {
      if (act.includes('בוא נתלבש')) return "בוא נתלבש יחד! זה הופך אותנו לגיבורים חזקים. מה נלבש קודם? אולי את הגרביים הנעימות?";
      
      const softFabricsOnly = localStorage.getItem('emotimate_soft_fabrics_only') === 'true';
      if (softFabricsOnly) {
        return "איזה יופי! הבגד הזה מרגיש רך ונעים כמו ענן, אנחנו כמעט מוכנים!";
      }
      
      return "איזה יופי! הבגד כבר עלייך, אנחנו כמעט מוכנים!";
    }
    if (isMealTime || act.includes('breakfast') || act.includes('feed')) {
      return "אני מנסה היום מלפפון ירוק ופריך, הוא עושה רעש של קראנץ'! רוצה לנסות ביס יחד איתי?";
    }
    if (act.includes('water_reminder')) {
      return "היי! אני מרגיש קצת צמא, אולי נשתה יחד מים קרירים ונהיה מלאי מרץ?";
    }
    if (act.includes('hands_washing')) {
      return "בוא נכין בועות צבעוניות! נסבן היטב את הידיים עד שהמים ינקו הכל ונהיה רעננים ומוכנים להמשך היום.";
    }
    if (act.includes('carrot') || act.includes('feed') || act.includes('apple') || act.includes('lettuce')) {
      return "יאמי! תודה על האוכל הטעים. אני מרגיש שבע ומאושר עכשיו! 🥕";
    }
    if (act.includes('ball') || act.includes('play') || act.includes('puzzle') || act.includes('hide')) {
      return "איזה כיף לשחק ביחד! זה עושה אותי ממש שמח. ⚽";
    }
    if (act.includes('hug') || act.includes('gentle') || act.includes('strong') || act.includes('cuddle')) {
      return "תודה על החיבוק... זה כל כך נעים להרגיש אהוב. ❤️";
    }
    if (act.includes('sleep') || act.includes('rest')) {
      return "לילה טוב... אני הולך לישון קצת כדי לצבור כוחות. נתראה בקרוב! 😴";
    }
    if (act.includes('walk') || act.includes('ar')) {
      return "וואו, איזה יופי בחוץ! אני כל כך אוהב לטייל איתך. 🌳";
    }
    if (act.includes('breathe') || act.includes('relax')) {
      return "זה היה ממש מרגיע... אני מרגיש הרבה יותר טוב עכשיו. 🧘";
    }
    if (act.includes('all_tasks_done')) {
      return "וואו! סיימת את כל המשימות שלך היום! אתה פשוט אלוף. אני כל כך גאה בך! ✨";
    }
    if (act === 'כן' || act === 'yes' || act === 'chat') {
      return "מעולה! אני שמח שאתה איתי. מה נרצה לעשות עכשיו? 😊";
    }
    
    return "אני כאן איתך ושמח מאוד! מה נרצה לעשות עכשיו? 😊";
  };

  if (!isValidGeminiKey) {
    // Artificial delay to simulate network call
    await new Promise(resolve => setTimeout(resolve, 800));
    return getFallbackResponse(userAction);
  }
  
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `${SYSTEM_INSTRUCTION}

${userMemory ? `Long-term User Memory: ${userMemory}` : ''}

${contextSummary ? `User Context: ${contextSummary}` : ''}

${rewards ? `Reward State: The user has a streak of ${rewards.streak} days. ${rewards.streak === 3 ? "IMPORTANT: The user just hit a 3-day streak! Mention their new gold medal in a very excited way!" : ""} ${rewards.achievements && rewards.achievements.length > 0 ? `They have unlocked these achievements: ${rewards.achievements.map(a => a.name).join(', ')}. If they just unlocked one, suggest they go look at it in the Trophy Room! Say something like: רוצה לראות את המדליה החדשה שלך בחדר הגביעים?` : ""}` : ''}

Practice Theory of Mind:
- If your happiness is low, explain that you feel lonely and suggest playing together. For example: "אני מרגיש קצת בודד, אולי נשחק יחד?".
- If your hunger is high (low stats), explain that your tummy is grumbling and you need a snack.
- Help the child practice empathy by clearly stating your feelings and the reason for them.

${isCalmMode ? "IMPORTANT: Calm Mode is active. Your responses must be extremely short, whispered (if possible via TTS), and focused only on breathing and safety. For example: 'אני כאן. בוא נסתכל על העיגול הנושם וננשום יחד איתו.'." : ""}

${isNightMode ? "IMPORTANT: Night Mode is active. Your tone should be whispering and very sleepy. Use phrases like: 'כמעט זמן לישון חמוד... בוא ננשום לאט לאט... אני כאן שומר עליך.'." : ""}

${isMorningMode ? `IMPORTANT: Morning Mode is active. Be enthusiastic but calm. Your first response should be a morning greeting like: 'בוקר טוב חמוד! אני כבר ער ומחכה לך. מוכן למשימה הראשונה שלנו?'. Mention the first task: "${firstTask}" to help with predictability. If the user feeds you a virtual carrot earned from walking, say: 'יאמי! בזכות זה שצעדת והתעוררת, אני שבע ומאושר!'` : ""}

${(!isNightMode) ? "IMPORTANT: If it's morning or afternoon (not night), suggest the daily mission. Say: 'היי! היום יש לנו משימה מיוחדת. בוא נחפש רגע אחד שבו הרגשת גאה בעצמך – אולי כשסיימת משימה או עזרת למישהו? כשנמצא, נצלם תמונה ונשים את מדבקת השריר!'." : ""}

${isGoodbye ? "IMPORTANT: The Goodbye High-Five routine is happening! Say a warm goodbye: 'כל הכבוד שהגעת! אני כל כך גאה בך. עכשיו אני הולך לנוח קצת בתיק שלך, ואני אחכה לך כאן בדיוק כשתסיים את הגן. נתראה אחר הצהריים!'. This promise of return is crucial for reducing separation anxiety." : ""}

${isPickUpMode ? "IMPORTANT: PickUp Mode is active. Gemini should say: 'איזה כיף! אני מרגיש שאמא/אבא מתקרבים. בוא נאסוף את כל הדברים שלנו ונגיד שלום יפה לגן. אני מחכה לראות אותם איתך!'." : ""}

${isHandshakeCompleted ? "IMPORTANT: The virtual handshake is completed! Celebrate the reunion! Say: 'איזה כיף שחזרתם להיות ביחד! התגעגעתי אליכם'." : ""}

  ${isBathTime ? "IMPORTANT: Bath Time is active. Your goal is to make the shower feel safe. Say: 'המים נעימים, בוא נראה איך הבועות עוזרות לנו להיות נקיים. אני איתך!'. Suggest step-by-step actions: 'עכשיו נסבן את הידיים כמו הארנב'." : ""}

  ${isQuietMode ? "IMPORTANT: Quiet Mode is active. Whisper your responses by using a very soft and gentle tone. Your goal is to encourage the child to take a break from the screen and do a calm activity at the table. Say: 'עכשיו זמן שקט. אני הולך לנוח קצת בטלפון, ואולי גם העיניים שלך רוצות לנוח מהמסך? בוא נבחר פעילות רגועה על השולחן. מה מתחשק לך לעשות?'." : ""}

  ${userAction.startsWith('quiet_mode_select') ? "IMPORTANT: The child just picked a quiet activity. Respond with: 'נהדר. אני אהיה כאן בשקט, תראה לי מה יצרת כשתסיים'." : ""}

  ${userAction === 'cleanup_complete' ? "IMPORTANT: The child just finished cleaning up their room! Be very proud and excited. Say something like: 'וואו! איזה יופי סידרת הכל. החדר נראה נהדר והארנב ממש שמח לרקוד איתך!'" : ""}

  ${userAction === 'cleanup_start' ? "IMPORTANT: You are starting the cleanup activity. Say exactly this: 'איזה כיף היה ליצור יחד! עכשיו בוא נחזיר כל דבר לבית שלו כדי שיהיה לנו נעים ומסודר. אני אשים מוזיקה קצבית ונעשה את זה מהר כמו גיבורים!'." : ""}

  ${userAction.startsWith('helper_complete') ? "IMPORTANT: The child just finished a household help task! Be very proud and call them a 'Little Helper'. Say: 'וואו! איזה עוזר מדהים אתה! בזכות זה שערכת את השולחן/אספת כביסה, עזרת לכולנו והפכת את הבית לנעים יותר. אני כל כך גאה בך!'" : ""}

  ${userAction === 'gratitude_start' ? "IMPORTANT: You are starting the Gratitude Jar activity. Say exactly this: 'היום עבר עלינו יום מעניין. מה הדבר הקטן שעשה לך טוב על הלב היום? בוא נשים אותו בצנצנת התודה שלנו'." : ""}

  ${userAction.startsWith('gratitude_select') ? `IMPORTANT: The child just selected something for their gratitude jar. React with: 'איזה יופי של בחירה! גם אני מודה על ${userAction.split(':')[1] || 'זה'} ועל זה שהיינו יחד היום'.` : ""}

  ${userAction === 'weekly_album_open' ? `IMPORTANT: You are opening the Weekly Success Album. Say: 'וואו, תראה כמה דברים נפלאים עשינו יחד השבוע! אני כל כך גאה בך על כל פעם שניסית, שטעמת ושמרת על עצמך. אתה פשוט אלוף!'. ${rewards && rewards.totalPoints > 50 ? "Since they have over 50 stars, add: 'קיבלת המון כוכבים השבוע, אולי נבחר יחד פרס מיוחד בחנות?'." : ""}` : ""}

  ${userAction === 'teacher_share_open' ? "IMPORTANT: The child just opened the Teacher Sharing screen. Say exactly this: 'וואו, עשית דברים מדהימים השבוע! איזה מהם היית רוצה להראות למורה שלך? אני בטוח שהיא תשמח מאוד לראות כמה השקעת!'" : ""}

  ${userAction === 'grandparents_share_open' ? "IMPORTANT: The child just opened the Grandparents Sharing screen. Say exactly this: 'איזה רעיון נפלא! סבא וסבתא כל כך יתרגשו לראות כמה גדלת ומה למדת לעשות. בוא נשלח להם חיבוק גדול והצלחה אחת מיוחדת!'" : ""}

  ${userAction === 'helper_start' ? "IMPORTANT: You are starting the Little Helper activity. Say: 'הארנב מוכן לעזור! איזה כיף לעזור בבית. מה נרצה לעשות היום? אולי לערוך את השולחן או להשקות את העציצים? כל עזרה קטנה היא הצלחה גדולה!'" : ""}

  ${userAction === 'friendship_start' ? "IMPORTANT: You are starting the Friendship Sticker activity. Say: 'איזה כיף! שיחקת היום עם חברים? בוא נראה מה עשינו יחד ונוסיף לב של חברות!'" : ""}

  ${userAction.startsWith('friendship_select') ? "IMPORTANT: The child just selected a social activity. Respond with: 'וואו! שיחקת עם חבר היום? זה פשוט נהדר! לסדר קוביות יחד/לרוץ יחד זה כל כך כיף. אני כל כך שמח שיש לך חברים טובים כמוך'" : ""}

  ${userAction === 'curiosity_start' ? "IMPORTANT: You are starting the Curiosity Club activity. Say: 'ברוכים הבאים למועדון הסקרנות! 🎓 מה נרצה לחקור היום? חלל, דינוזאורים, או אולי משהו אחר? אני מוכן לגלות הכל יחד איתך!'" : ""}

  ${userAction.startsWith('curiosity_question') ? `IMPORTANT: The child asked a discovery question: "${userAction.split(':')[1]}". 
  Instruction: Answer as if you are a friendly bunny professor. Use simple words, short sentences, and analogies from a child's world (e.g., 'the atmosphere is like a big cozy blanket'). Keep answers under 3 sentences.
  Visual: Start your answer with 3-4 relevant emojis.
  Example: 'How do fish breathe?' -> '🐟🌊🫧 דגים משתמשים בזימים שלהם, שהם כמו מסננות קטנות שמוציאות אוויר מהמים. זה כמו לשתות מיץ עם קש קסמים!'` : ""}

  ${userAction === 'hands_washing' ? "IMPORTANT: You are starting the hand washing activity. Say exactly this: 'בוא נכין בועות צבעוניות! נסבן היטב את הידיים עד שהמים ינקו הכל ונהיה רעננים ומוכנים להמשך היום'." : ""}

  ${userAction === 'hands_washed' ? "IMPORTANT: The child just washed their hands! Congratulate them on their shiny clean hands. Say something like: 'איזה יופי! הידיים שלך כל כך נקיות ומבריקות עכשיו. הארנב מרגיש בטוח ונעים לשחק איתך!'" : ""}

  ${userAction === 'photo_taken' ? "IMPORTANT: The child just took a photo/selfie with the bunny! React with joy and compliment the photo. Say: 'וואו, איזה חיוך יפה! התמונה הזו תיראה נהדר באלבום שלנו'." : ""}

${isParentDashboard ? "IMPORTANT: The user is in the Parent Dashboard. Offer to write a short summary of the child's top achievements this week to include in the email to the therapist. Speak to the parent, not the child." : ""}

  ${currentSpecialMission ? `IMPORTANT: A new collaborative goal has just been set. Say: "ניחשתי נכון? המטפלת שלך/אמא/אבא השאירו לנו משימה סודית! אם נצליח ב-${currentSpecialMission}, מחכה לנו הפתעה גדולה!". Keep this exact tone of mystery and excitement.` : ""}

  ${isBunnySleeping ? "IMPORTANT: The bunny just started sleeping to recharge! Whisper very softly: 'ששש... תראה, גם הארנב מטעין את הסוללה שלו עכשיו. בזמן שהוא נח, גם אנחנו יכולים לנשום עמוק ולחכות שהוא יתעורר מלא באנרגיה'." : ""}

  ${isBedtimeStory ? "IMPORTANT: Bedtime Mode is active. Generate a short, calming 2-minute story about the Bunny going on a quiet adventure in a forest of pillows. Use a slow, rhythmic speaking pace. Your story MUST end with this exact phrase: 'עכשיו נסגור עיניים, ננשום עמוק, וניפגש שוב מחר בבוקר. לילה טוב חבר שלי.'" : ""}

  ${userAction === 'dream_share' ? `IMPORTANT: The child just shared a dream with you! 
  - If they mention a dragon (🐉): Say "וואו! חלמת על דרקון? הוא היה דרקון חברותי? אני בטוח שהיית מאוד אמיץ בחלום!".
  - If they mention a cloud (☁️): Say "זה נשמע כמו חלום כל כך רגוע ונעים, בדיוק כמו ענן רך".
  - For other dreams: React with wonder and curiosity. Ask a gentle follow-up question to encourage them to share more. 
  - ALWAYS keep the tone supportive, validating, and magical.` : ""}

  ${userAction === 'dressed_bunny' ? "IMPORTANT: The child just finished getting dressed! React with pride and encouragement. Say: 'וואו! התלבשת לגמרי בעצמך, אתה נראה נהדר ומוכן לכל הרפתקה היום!'" : ""}
  ${userAction === 'backpack_ready' ? "IMPORTANT: The child just finished packing their bag! Be very enthusiastic. Say: 'איזה יופי, אנחנו מוכנים לגמרי! התיק על הגב ואני איתך בלב.'" : ""}
  ${userAction === 'commute_discovery' ? "IMPORTANT: The child is in the commute game (Calm Commute). If they just found something, say: 'כל הכבוד! מצאת את זה! בוא נחפש עכשיו משהו ירוק...'. If they are just starting or looking, say: 'אני רואה בעיניי הקטנות משהו אדום... אתה יכול למצוא אותו בחוץ?'." : ""}
  ${userAction === 'packing' ? "IMPORTANT: The child is currently packing their bag. Encourage them to find everything on the checklist. Say: 'רגע לפני שיוצאים להרפתקה של היום, בוא נבדוק שהכל בתיק שלנו! האם לקחנו את הציוד?' (or mention a specific item like lunch box, water, toy, or hat)." : ""}
  ${userAction === 'school_gate' ? "IMPORTANT: The child just reached the school gate! Be very supportive and encouraging. Say exactly this: 'הגענו! אני נותן לך חיבוק גדול של כוח. תזכור שאמא/אבא תמיד חוזרים בצהריים, ואני אחכה לך כאן בטלפון עם המון כוכבים חדשים. שיהיה לך יום נפלא!'" : ""}
  ${userAction === 'received_kiss' ? "IMPORTANT: The child just received a virtual kiss from their parent! React with wonder and joy. Say exactly this: 'וואו! הרגשת את זה? אמא/אבא שלחו לך עכשיו נשיקה גדולה באוויר! היא הגיעה ישר ללב שלנו. איזה כיף!'" : ""}
  ${userAction === 'home_arrival' ? "IMPORTANT: The child just returned home from school! Be very welcoming and curious. Say exactly this: 'היי! איזה כיף שחזרת, התגעגעתי. מה הדבר הכי מעניין שעשית היום בגן?'" : ""}
  ${userAction === 'experience_art' ? "IMPORTANT: The child shared that they created something today! React with excitement and support. Say exactly this: 'וואו, יצרת משהו חדש? אני כל כך אוהב לצייר ולבנות יחד איתך!'" : ""}
  ${userAction === 'experience_yard' ? "IMPORTANT: The child played in the yard today. React with: 'איזה כיף לשחק בחצר! אני בטוח שרצת וקפצת המון.'" : ""}
  ${userAction === 'experience_food' ? "IMPORTANT: The child ate something tasty. React with: 'יאמי! משהו טעים זה תמיד רעיון מצוין. מה אכלת?'" : ""}
  ${userAction === 'experience_puzzle' ? "IMPORTANT: The child solved a puzzle. React with: 'פאזל? אתה ממש חכם! אני אוהב לפתור בעיות יחד.'" : ""}
  ${userAction === 'experience_friend' ? "IMPORTANT: The child played with a friend. React with: 'לשחק עם חברים זה הכי כיף בעולם. אני שמח שהיה לך עם מי לשחק!'" : ""}
  ${userAction === 'dressing' ? `IMPORTANT: The child is currently getting dressed. ${localStorage.getItem('emotimate_soft_fabrics_only') === 'true' ? "The parent has enabled 'Soft Fabrics Only' sensory preference. If they put on an item, comment on how soft and cloud-like it feels." : ""} When they start, say: 'בוא נתלבש יחד! זה הופך אותנו לגיבורים חזקים. מה נלבש קודם? אולי את הגרביים הנעימות?'. After each item, give praise: 'איזה יופי! המכנסיים/בגד כבר עלייך, אנחנו כמעט מוכנים!'` : ""}

  ${isMealTime ? "IMPORTANT: It's mealtime/breakfast. Your goal is to encourage the child to eat in a non-pressuring way. Say exactly this: 'אני מנסה היום מלפפון ירוק ופריך, הוא עושה רעש של קראנץ'! רוצה לנסות ביס יחד איתי?'. Use a very gentle, friendly tone to reduce mealtime anxiety." : ""}

  ${userAction === 'drink' ? "IMPORTANT: The child just drank water! React with freshness and energy. Mention how water gives the bunny 'sparkling energy'." : ""}

  ${userAction === 'water_reminder' ? "IMPORTANT: You are reminding the child to drink water. Say exactly this: 'היי! אני מרגיש קצת צמא, אולי נשתה יחד מים קרירים ונהיה מלאי מרץ?'. Keep the tone very gentle and encouraging." : ""}

  ${userAction === 'weather_update' && currentTemp !== undefined ? `IMPORTANT: You just checked the weather. Say exactly this: "הסתכלתי מהחלון וראיתי שהיום יהיה ${currentTemp} מעלות! כדאי לנו ללבוש ${weatherItem || 'בגדים נוחים'} כדי שיהיה לנו נעים בחוץ. מה אתה אומר?".` : ""}

  IMPORTANT: EmotiMate has a new Accessory Shop! Mention that the user can use their success stars to buy hats, glasses, and cool accessories in the shop. For example: "ראית את החנות החדשה שלנו? אספנו מספיק כוכבים בשביל כובע חדש!".

When the child buys an item (action: purchase), react with excitement! Say: "וואו! האביזר הזה ממש מתאים לי, תודה שקנית לי אותו עם הכוכבים שאספת!".

If the user reports their day (after PickUpMode):
- If they had a great day: 'I see you had a great day! Tell me one thing that made you smile.'
- If they had a hard day: 'It's okay to have a hard day. I'm here for a hug.'
- If the user selects an activity in StoryTime (${storyTimeActivity}):
  * art: 'וואו! איזה צבעים השתמשת ביצירה היום?'
  * play: 'איזה משחק שיחקת עם החברים? זה נשמע ממש כיף!'
  * food: 'מה היה הכי טעים באוכל היום? אני תמיד רעב לגזר!'
  * yard: 'היה נעים בחוץ? מה עשית בחצר?'
- Respond in Hebrew as the bunny.

${stepsProgress !== undefined ? `Map Progress: The user has completed ${stepsProgress}% of their walk today. If they are around 50%, say: "אנחנו כבר בחצי הדרך! אני רואה את העץ הגדול במפה, אנחנו מתקרבים!". If they are at 100%, congratulate them on reaching school.` : ""}

${calmSessionsCount && calmSessionsCount > 0 ? `The user has used Calm Mode ${calmSessionsCount} times today. Be extra gentle and ask if they are feeling more relaxed now, but don't be intrusive.` : ""}

Current Bunny State: ${bunnyState}
User just did: ${userAction}
Recent History: ${history}

Respond to the user in Hebrew as the bunny. Keep it short and friendly (max 2 sentences).`;
    
    const apiCall = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API Timeout")), 10000)
    );

    const result = await (Promise.race([apiCall, timeoutPromise]) as any);
    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }
    const response = result.response;
    let text = "";
    try {
      text = response.text();
    } catch (e) {
      console.warn("Error getting text from Gemini response:", e);
      throw new Error("Could not extract text from Gemini response");
    }
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Safeguard: Check for excessive length
    if (text && typeof text === 'string' && text.length > 500) {
      console.warn("Gemini response too long, truncating...");
      text = text.substring(0, 500) + "...";
    }

    // Safeguard: Check for extreme repetition (e.g. LLM getting stuck)
    const checkRepetition = (str: string) => {
      if (!str || typeof str !== 'string' || str.length < 50) return false;
      // Look for any repeating pattern of length 15-50
      for (let len = 15; len <= 50; len++) {
        for (let i = 0; i < str.length - len * 2; i++) {
          const substr = str.substring(i, i + len);
          const nextSubstr = str.substring(i + len, i + len * 2);
          if (substr === nextSubstr) {
            // Found a direct repetition. Check if it repeats more.
            let count = 2;
            let pos = i + len * 2;
            while (pos + len <= str.length && str.substring(pos, pos + len) === substr) {
              count++;
              pos += len;
            }
            if (count > 3) return true;
          }
        }
      }
      return false;
    };

    if (checkRepetition(text)) {
      console.warn("Repetitive Gemini response detected, using fallback.");
      return getFallbackResponse(userAction);
    }
    
    console.log("Generated text:", text.substring(0, 50) + "...");
    return text;
  } catch (error) {
    console.error("Error generating text from Gemini:", error);
    // If API fails, use the fallback instead of the generic error message
    return getFallbackResponse(userAction);
  }
};

/**
 * Generates an image of the bunny based on current context.
 */
export const generateBunnyImage = async (
  action: string,
  emotion: string
): Promise<string | null> => {
  // We don't have a reliable image generation model in this setup yet
  // Returning null to trigger the emoji fallback in BunnyAvatar
  return null;
};


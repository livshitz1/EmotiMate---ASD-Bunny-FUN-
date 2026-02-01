import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BunnyState, Emotion, ScheduleItem, TimeOfDay, ChatMessage, RewardState, PetType, Language, AudioProfile, AITResult, CalmLog, Photo, TherapyMission } from './types';
import { translate } from './i18n/translations';
import { INITIAL_BUNNY_STATE, INITIAL_SCHEDULE, INITIAL_REWARD_STATE, ACHIEVEMENTS } from './constants';
import { generateEmotiMateResponse, generateBunnyImage } from './services/geminiService';
import BunnyAvatar from './components/BunnyAvatar';
import BunnyLottie from './components/BunnyLottie';
import BunnyStatus from './components/BunnyStatus';
import SelfCareTasks from './components/SelfCareTasks';
import ARButton from './components/ARButton';
import AudioPlayer from './components/AudioPlayer';
import SoundReinforcement from './components/SoundReinforcement';
import LittleHelper from './components/LittleHelper';
import BackgroundMusic from './components/BackgroundMusic';
import OnboardingScreen from './components/OnboardingScreen';
import WelcomeMessage from './components/WelcomeMessage';
import { getWatchData } from './utils/appleWatchUtils';
import TimeBlindnessExplanation from './components/TimeBlindnessExplanation';
import RewardAnimation from './components/RewardAnimation';
import Settings, { AppSettings } from './components/Settings';
import Controls from './components/Controls';
import FoodSelector from './components/FoodSelector';
import GameSelector from './components/GameSelector';
import HugSelector from './components/HugSelector';
import BreathingExercise from './components/BreathingExercise';
import ResponseButtons from './components/ResponseButtons';
import DailyProgress from './components/DailyProgress';
import DailyWrapUp from './components/DailyWrapUp';
import VirtualHandshake from './components/VirtualHandshake';
import StoryTime from './components/StoryTime';
import DaySummary from './components/DaySummary';
import WeeklySuccessAlbum from './components/WeeklySuccessAlbum';
import TeacherShare from './components/TeacherShare';
import GrandparentsShare from './components/GrandparentsShare';
import UnityARScreen from './components/UnityARScreen';
import ParentDashboard from './components/ParentDashboard';
import BunnyShop, { ShopItem, SHOP_ITEMS } from './components/BunnyShop';
import AccessorySelector from './components/AccessorySelector';
import GratitudeSticker from './components/GratitudeSticker';
import FriendshipSticker from './components/FriendshipSticker';
import CuriosityClub from './components/CuriosityClub';
import BathTimeMode from './components/BathTimeMode';
import BedtimeStory from './components/BedtimeStory';
import DreamJournal from './components/DreamJournal';
import { HealthyPlate } from './components/HealthyPlate';
import GettingDressed from './components/GettingDressed';
import BackpackHero from './components/BackpackHero';
import CalmCommute from './components/CalmCommute';
import CleanupTime from './components/CleanupTime';
import GoodbyeHug from './components/GoodbyeHug';
import BunnySelfie from './components/BunnySelfie';
import PhotoAlbum from './components/PhotoAlbum';
import { EmotionalHub } from './components/EmotionalHub';
import { TherapyMissions } from './components/TherapyMissions';
import { CompanionMenu } from './components/CompanionMenu';
import { ProgressHub } from './components/ProgressHub';
import { SelfExpressionStudio } from './components/SelfExpressionStudio';
import { Psychoeducation } from './components/Psychoeducation';
import CleanHands from './components/CleanHands';
import { StickerOverlay } from './components/StickerOverlay';
import WaterBuddy from './components/WaterBuddy';
import KissAnimation from './components/KissAnimation';
import BunnyExperience from './components/BunnyExperience';
import { AITFrequencyTest } from './components/AITFrequencyTest';
import { AITReportScreen } from './components/AITReportScreen';
import { scheduleMorningNotification, scheduleRecommendationNotification } from './utils/scheduleNotification';

import UnityStyleHugAnimation from './components/UnityStyleHugAnimation';

const App: React.FC = () => {
  // --- State ---
  const [bunny, setBunny] = useState<BunnyState>(() => {
    const saved = localStorage.getItem('emotimate_bunny_customization');
    if (saved) {
      try {
        const customization = JSON.parse(saved);
        return { 
          ...INITIAL_BUNNY_STATE, 
          customization: { 
            ...INITIAL_BUNNY_STATE.customization, 
            ...customization,
            petType: customization.petType || INITIAL_BUNNY_STATE.customization?.petType
          } 
        };
      } catch {
        return INITIAL_BUNNY_STATE;
      }
    }
    return INITIAL_BUNNY_STATE;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const safeChatHistory = Array.isArray(chatHistory) ? chatHistory : [];
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  
  const [rewards, setRewards] = useState<RewardState>(() => {
    const saved = localStorage.getItem('emotimate_rewards');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      const achievements = Array.isArray(parsed.achievements) ? parsed.achievements : ACHIEVEMENTS;
      if (parsed.lastResetDate !== today) {
        return { ...INITIAL_REWARD_STATE, totalPoints: parsed.totalPoints, streak: parsed.streak, achievements, lastResetDate: today };
      }
      return { ...parsed, achievements };
    }
    return { ...INITIAL_REWARD_STATE, achievements: ACHIEVEMENTS };
  });

  const [soundTrigger, setSoundTrigger] = useState<'task_complete' | 'achievement' | 'points' | null>(null);
  const [bunnyAnimation, setBunnyAnimation] = useState<'idle' | 'happy' | 'sad' | 'excited' | 'sleepy' | 'eating' | 'playing' | 'relaxing' | 'task_completed' | 'sleeping_in_bed' | 'dancing' | undefined>(undefined);
  
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('emotimate_language');
    return (saved as Language) || Language.HEBREW;
  });

  const isHebrew = currentLanguage === Language.HEBREW;

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !localStorage.getItem('emotimate_onboarding_completed'));
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(() => !localStorage.getItem('emotimate_welcome_seen') && !!localStorage.getItem('emotimate_onboarding_completed'));
  const [showTimeBlindnessExplanation, setShowTimeBlindnessExplanation] = useState<boolean>(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState<{ points: number; taskName: string; onComplete?: () => void } | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBackgroundMusic, setShowBackgroundMusic] = useState<boolean>(false);
  const [showFoodSelector, setShowFoodSelector] = useState<boolean>(false);
  const [showGameSelector, setShowGameSelector] = useState<boolean>(false);
  const [showHugSelector, setShowHugSelector] = useState<boolean>(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState<boolean>(false);
  const [showDaySummary, setShowDaySummary] = useState<boolean>(false);
  const [showGratitudeSticker, setShowGratitudeSticker] = useState<boolean>(false);
  const [showFriendshipSticker, setShowFriendshipSticker] = useState<boolean>(false);
  const [showCuriosityClub, setShowCuriosityClub] = useState<boolean>(false);
  const [showWeeklyAlbum, setShowWeeklyAlbum] = useState<boolean>(false);
  const [showPhotoAlbum, setShowPhotoAlbum] = useState<boolean>(false);
  const [showBunnySelfie, setShowBunnySelfie] = useState<boolean>(false);
  const [showEmotionalHub, setShowEmotionalHub] = useState<boolean>(false);
  const [showTherapyMissions, setShowTherapyMissions] = useState<boolean>(false);
  const [showCompanionMenu, setShowCompanionMenu] = useState<boolean>(false);
  const [showProgressHub, setShowProgressHub] = useState<boolean>(false);
  const [showSelfExpressionStudio, setShowSelfExpressionStudio] = useState<boolean>(false);
  const [showPsychoeducation, setShowPsychoeducation] = useState<boolean>(false);
  const [showHealthyPlate, setShowHealthyPlate] = useState<boolean>(false);
  const [showWaterBuddy, setShowWaterBuddy] = useState<boolean>(false);
  const [showAITTest, setShowAITTest] = useState<boolean>(false);
  const [showAITReport, setShowAITReport] = useState<boolean>(false);
  const [showHugAnimation, setShowHugAnimation] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('emotimate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [emotionalPoints, setEmotionalPoints] = useState<number>(() => {
    const saved = localStorage.getItem('emotimate_emotional_points');
    return saved ? parseInt(saved) : 0;
  });
  const [unlockedMissions, setUnlockedMissions] = useState<string[]>(() => {
    const saved = localStorage.getItem('emotimate_unlocked_missions');
    return saved ? JSON.parse(saved) : ['breathing_1', 'counting_5'];
  });
  const [calmLogs, setCalmLogs] = useState<CalmLog[]>(() => {
    const saved = localStorage.getItem('emotimate_calm_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTeacherShare, setShowTeacherShare] = useState<boolean>(false);
  const [showGrandparentsShare, setShowGrandparentsShare] = useState<boolean>(false);
  const [showParentDashboard, setShowParentDashboard] = useState<boolean>(false);
  const [showBunnyShop, setShowBunnyShop] = useState<boolean>(false);
  const [showUnityAR, setShowUnityAR] = useState<boolean>(false);
  const [isSafeZone, setIsSafeZone] = useState<boolean>(false);
  const [showAccessorySelector, setShowAccessorySelector] = useState<boolean>(false);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('emotimate_owned_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('photo_album');
    return saved ? JSON.parse(saved) : [];
  });
  const [hasSharedWithTeacher, setHasSharedWithTeacher] = useState<boolean>(() => {
    const saved = localStorage.getItem('emotimate_has_shared_with_teacher');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === today;
    }
    return false;
  });
  const [showBedtimeStory, setShowBedtimeStory] = useState<boolean>(false);
  const [isBedtimeStoryPlaying, setIsBedtimeStoryPlaying] = useState<boolean>(false);
  const [showStoryTime, setShowStoryTime] = useState<boolean>(false);
  const [dailyGratitude, setDailyGratitude] = useState<string>(() => {
    const saved = localStorage.getItem('emotimate_daily_gratitude');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === today ? data.id : '';
    }
    return '';
  });
  const [totalSelfCareCount, setTotalSelfCareCount] = useState<number>(() => {
    const saved = localStorage.getItem('emotimate_stars');
    return saved ? parseInt(saved) : 4; // Default to 4
  });
  const [isQuietMode, setIsQuietMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('emotimate_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved).isQuietMode || false;
      } catch { return false; }
    }
    return false;
  });
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isMorningMode, setIsMorningMode] = useState<boolean>(false);
  const [isCalmMode, setIsCalmMode] = useState<boolean>(false);
  const [isPickUpMode, setIsPickUpMode] = useState<boolean>(false);
  const [isBunnySleeping, setIsBunnySleeping] = useState<boolean>(false);
  const [showBathTime, setShowBathTime] = useState<boolean>(false);
  const [showCleanupTime, setShowCleanupTime] = useState<boolean>(false);
  const [showLittleHelper, setShowLittleHelper] = useState<boolean>(false);
  const [musicSleepTimer, setMusicSleepTimer] = useState<number | null>(null);
  const [completedSelfCareCount, setCompletedSelfCareCount] = useState<number>(() => {
    const saved = localStorage.getItem('emotimate_self_care_completed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastReset = localStorage.getItem('emotimate_self_care_reset_date');
        const today = new Date().toISOString().split('T')[0];
        if (lastReset === today) return parsed.length;
      } catch { return 0; }
    }
    return 0;
  });
  
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('emotimate_app_settings');
    return saved ? JSON.parse(saved) : {
      bedtimeHour: 21,
      petBedtimeHour: 21,
      morningReminderHour: 10,
      afternoonReminderHour: 14,
      eveningReminderHour: 19,
      showRecommendations: true,
      soundVolume: 80,
      animationSpeed: 'normal' as const
    };
  });

  // Refs
  const isMounted = useRef(true);
  const hasInitialized = useRef(false);
  const bunnyRef = useRef<BunnyState>(bunny);
  const chatHistoryRef = useRef<ChatMessage[]>(chatHistory);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [safeChatHistory, isProcessing]);

  // --- Callbacks & Handlers ---
  const addMessage = useCallback((sender: 'user' | 'bot', text: string, audioUrl?: string, imageUrl?: string): string => {
    const messageId = Date.now().toString() + Math.random();
    setChatHistory(prev => [...prev, { id: messageId, sender, text, audioUrl, imageUrl, timestamp: new Date() }]);
    return messageId;
  }, []);

  const updateBunnyStats = useCallback((action: string) => {
    setBunny(prev => {
      let { hunger, energy, happiness } = prev;
      const act = action.toLowerCase();

      if (act.includes('feed') || act.includes('carrot') || act.includes('apple') || act.includes('lettuce')) {
        hunger = Math.min(100, hunger + 25);
        happiness = Math.min(100, happiness + 10);
      } else if (act.includes('play') || act.includes('ball') || act.includes('puzzle')) {
        energy = Math.max(0, energy - 15);
        happiness = Math.min(100, happiness + 20);
      } else if (act.includes('sleep')) {
        energy = Math.min(100, energy + 40);
        hunger = Math.max(0, hunger - 10);
      } else if (act.includes('hug')) {
        happiness = Math.min(100, happiness + 15);
      } else if (act.includes('walk')) {
        energy = Math.max(0, energy - 20);
        happiness = Math.min(100, happiness + 25);
      } else if (act.includes('breathe')) {
        happiness = Math.min(100, happiness + 5);
      } else if (act.includes('plate') || act.includes('healthy')) {
        hunger = Math.min(100, hunger + 20);
        happiness = Math.min(100, happiness + 15);
      } else if (act.includes('water')) {
        happiness = Math.min(100, happiness + 5);
        energy = Math.min(100, energy + 5);
      } else if (act.includes('chat_guided') || act.includes('how_help') || act.includes('bunny_feelings') || act.includes('grow_together')) {
        happiness = Math.min(100, happiness + 10);
        energy = Math.max(0, energy - 5);
      }

      // Determine emotion based on stats
      let currentEmotion = Emotion.NEUTRAL;
      if (hunger < 30) currentEmotion = Emotion.HUNGRY;
      else if (energy < 30) currentEmotion = Emotion.TIRED;
      else if (happiness > 80) currentEmotion = Emotion.HAPPY;
      else if (happiness < 40) currentEmotion = Emotion.SAD;

      return { ...prev, hunger, energy, happiness, currentEmotion };
    });
  }, []);

  const handleLogEmotion = useCallback((mood: string, notes?: string) => {
    const newLog: CalmLog = {
      timestamp: new Date().toISOString(),
      duration: 0,
      type: 'emotion_check',
      mood: mood as any,
      notes: notes
    };
    const updatedLogs = [...calmLogs, newLog];
    setCalmLogs(updatedLogs);
    localStorage.setItem('emotimate_calm_logs', JSON.stringify(updatedLogs));
    
    // Reward for emotional awareness
    setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + 10 }));
    setEmotionalPoints(prev => {
      const newVal = prev + 15;
      localStorage.setItem('emotimate_emotional_points', newVal.toString());
      return newVal;
    });
    setSoundTrigger('points');
    
    // Feedback
    addMessage('bot', currentLanguage === Language.HEBREW 
      ? `תודה ששיתפת אותי שאתה מרגיש ${translate(mood as any, currentLanguage)}. זה מאוד עוזר!` 
      : `Thanks for sharing that you feel ${translate(mood as any, currentLanguage)}. It helps a lot!`
    );
  }, [calmLogs, currentLanguage, addMessage]);

  const handleInteraction = useCallback(async (actionType: string, customInput?: string) => {
    // identify the actual content to display
    let contentToDisplay = customInput || actionType;
    
    // Translate common types to Hebrew labels for the chat
    if (currentLanguage === Language.HEBREW) {
      const translations: Record<string, string> = {
        'carrot': 'גזר 🥕',
        'water': 'מים 💧',
        'lettuce': 'חסה 🥬',
        'apple': 'תפוח 🍎',
        'ball': 'כדור ⚽',
        'puzzle': 'פאזל 🧩',
        'hide_and_seek': 'מחבואים 🫣',
        'gentle': 'חיבוק עדין 🤗',
        'strong': 'חיבוק חזק 💪',
        'cuddle': 'חיבוק חם 🥰',
        'walk': 'טיול 🌳',
        'sleep': 'לישון 😴',
        'feed': 'להאכיל 🥕',
        'play': 'לשחק ⚽',
        'hug': 'לחבק ❤️',
        'breathing': 'נשימה 🧘',
        'chat_guided': 'בוא נדבר 💬',
        'how_help': 'איך אני יכול לעזור? ❤️',
        'bunny_feelings': 'איך אתה מרגיש היום? 🤔',
        'grow_together': 'איך גדלנו היום? 🌱'
      };
      
      if (translations[contentToDisplay]) {
        contentToDisplay = translations[contentToDisplay];
      }
    }

    // Logic Advancement: Check for specific emotional inputs to update state
    if (contentToDisplay.includes('שמח') || contentToDisplay.toLowerCase().includes('happy')) {
      setBunny(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }));
      handleLogEmotion('happy', 'Selected from chat');
    } else if (contentToDisplay.includes('עצוב') || contentToDisplay.toLowerCase().includes('sad')) {
      setBunny(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 10) }));
      handleLogEmotion('sad', 'Selected from chat');
    } else if (contentToDisplay.includes('עייף') || contentToDisplay.toLowerCase().includes('tired')) {
      setBunny(prev => ({ ...prev, energy: Math.max(0, prev.energy - 15) }));
      handleLogEmotion('tired', 'Selected from chat');
    } else if (contentToDisplay.includes('רגוע') || contentToDisplay.toLowerCase().includes('calm')) {
      setBunny(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
      handleLogEmotion('calm', 'Selected from chat');
    }

    if (actionType !== 'start') {
      addMessage('user', contentToDisplay);
      if (['chat_guided', 'how_help', 'bunny_feelings', 'grow_together'].includes(actionType)) {
        setSoundTrigger('points');
      }
    }

    if (isProcessing) return;
    setIsProcessing(true);

    // Update bunny stats based on the action
    updateBunnyStats(customInput || actionType);

    try {
      const stateDescription = `Hunger: ${bunnyRef.current.hunger}, Energy: ${bunnyRef.current.energy}, Happiness: ${bunnyRef.current.happiness}, Emotion: ${bunnyRef.current.currentEmotion}`;
      const recentHistory = chatHistoryRef.current.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');
      
      // We pass the RAW actionType/customInput to Gemini so it knows the intent, 
      // but use the translated text for the chat display.
      const textResponse = await generateEmotiMateResponse(
        customInput || actionType, 
        stateDescription, 
        recentHistory,
        undefined, // contextSummary
        undefined, // userMemory
        rewards,
        isCalmMode,
        undefined, // calmSessionsCount
        isNightMode,
        isMorningMode,
        false, // isGoodbye
        isPickUpMode,
        false, // isHandshakeCompleted
        showBathTime,
        undefined, // storyTimeActivity
        undefined, // firstTask
        undefined, // stepsProgress
        false, // isParentDashboard
        undefined, // currentSpecialMission
        isBunnySleeping,
        showBedtimeStory,
        undefined, // currentTemp
        undefined, // weatherItem
        false, // isMealTime
        isQuietMode
      );
      const petType = bunnyRef.current.customization?.petType || 'bunny';
      
      const [imageUrl] = await Promise.all([
        generateBunnyImage(actionType, bunnyRef.current.currentEmotion)
      ]);

    if (isMounted.current) {
      if (imageUrl) setCurrentImage(imageUrl);
      
      // Adapt response length/tone by age group
      let adaptedResponse = textResponse;
      const age = appSettings.childAge;
      if (age === '0-3') {
        adaptedResponse = textResponse.length > 60 ? textResponse.substring(0, 60) + '...' : textResponse;
      } else if (age === '3-6') {
        adaptedResponse = textResponse.length > 120 ? textResponse.substring(0, 120) + '...' : textResponse;
      }

      addMessage('bot', adaptedResponse, undefined, imageUrl || undefined);
    }
    } catch (e) {
      console.error("Interaction failed", e);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  }, [isProcessing, addMessage, currentLanguage, rewards, isCalmMode, isNightMode, isMorningMode, isPickUpMode, showBathTime, isBunnySleeping, showBedtimeStory, isQuietMode, updateBunnyStats, handleLogEmotion]);

  const handleShopPurchase = (item: ShopItem) => {
    setTotalSelfCareCount(prev => prev - item.price);
    setUnlockedItems(prev => {
      const updated = [...prev, item.id];
      localStorage.setItem('emotimate_owned_items', JSON.stringify(updated));
      return updated;
    });
    setBunny(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [item.category === 'bowtie' ? 'bow' : item.category]: item.id
      },
      currentAnimation: 'excited'
    }));
    handleInteraction('purchase', item.id);
    setSoundTrigger('points');
    setTimeout(() => {
      setBunny(prev => ({ ...prev, currentAnimation: 'idle' }));
    }, 3000);
  };

  const handleOnboardingComplete = (selectedPet: PetType, audioProfile: AudioProfile, age: AgeGroup) => {
    setBunny(prev => ({ ...prev, customization: { ...prev.customization, petType: selectedPet } }));
    setAppSettings(prev => ({ ...prev, childAge: age }));
    localStorage.setItem('emotimate_app_settings', JSON.stringify({ ...appSettings, childAge: age }));
    localStorage.setItem('emotimate_audio_profile', JSON.stringify(audioProfile));
    localStorage.setItem('emotimate_onboarding_completed', 'true');
    setShowOnboarding(false);
    setTimeout(() => setShowWelcomeMessage(true), 500);
  };

  const handleCompleteTherapyMission = (mission: TherapyMission) => {
    const newLog: CalmLog = {
      timestamp: new Date().toISOString(),
      duration: 5, // Estimated duration
      type: 'therapy_mission',
      label: mission.titleEn,
      activity: mission.id
    };
    const updatedLogs = [...calmLogs, newLog];
    setCalmLogs(updatedLogs);
    localStorage.setItem('emotimate_calm_logs', JSON.stringify(updatedLogs));

    // Unlock next mission if applicable
    if (mission.id === 'counting_5') {
       const newUnlocked = [...unlockedMissions, 'focus_butterfly'];
       setUnlockedMissions(newUnlocked);
       localStorage.setItem('emotimate_unlocked_missions', JSON.stringify(newUnlocked));
       
       // Schedule recommendation notification
       scheduleRecommendationNotification(
         currentLanguage === Language.HEBREW ? "משימה חדשה נפתחה! 🎯" : "New Mission Unlocked! 🎯",
         currentLanguage === Language.HEBREW ? "הארנב מחכה לך עם משימת הפרפר! 🦋" : "The Bunny is waiting for you with the Butterfly mission! 🦋",
         60 // 1 hour later
       );
    } else if (mission.id === 'focus_butterfly') {
       const newUnlocked = [...unlockedMissions, 'slow_turtle'];
       setUnlockedMissions(newUnlocked);
       localStorage.setItem('emotimate_unlocked_missions', JSON.stringify(newUnlocked));

       // Schedule recommendation notification
       scheduleRecommendationNotification(
         currentLanguage === Language.HEBREW ? "משימה חדשה נפתחה! 🎯" : "New Mission Unlocked! 🎯",
         currentLanguage === Language.HEBREW ? "הארנב מחכה לך עם משימת הצב! 🐢" : "The Bunny is waiting for you with the Turtle mission! 🐢",
         60 // 1 hour later
       );
    }

    setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + mission.points }));
    setEmotionalPoints(prev => {
      const newVal = prev + 20;
      localStorage.setItem('emotimate_emotional_points', newVal.toString());
      return newVal;
    });
    setSoundTrigger('achievement');
    setBunnyAnimation('happy');
    
    addMessage('bot', currentLanguage === Language.HEBREW 
      ? `כל הכבוד! סיימת את המשימה ${mission.titleHe}. קיבלת ${mission.points} כוכבים!` 
      : `Well done! You finished the ${mission.titleEn} mission. You earned ${mission.points} stars!`
    );
  };

  const handleShareWithGrandparents = () => {
    setShowGrandparentsShare(true);
    handleInteraction('grandparents_share_open');
    
    // Play triumph sound and show kisses
    setSoundTrigger('achievement');
    setBunnyAnimation('dancing'); 
    
    // Trigger kiss hearts animation
    const kissEvent = new CustomEvent('emotimate_show_kisses');
    window.dispatchEvent(kissEvent);
    
    // After a delay, revert animation
    setTimeout(() => {
      setBunnyAnimation(undefined);
    }, 5000);
  };

  const handleSavePhoto = (imageData: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: imageData,
      timestamp: new Date().toISOString()
    };
    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    localStorage.setItem('photo_album', JSON.stringify(updatedPhotos));
    setShowBunnySelfie(false);
    setSoundTrigger('achievement');
  };

  const handleDeletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem('photo_album', JSON.stringify(updatedPhotos));
  };

  const openParentGate = (callback: () => void) => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = prompt(currentLanguage === Language.HEBREW ? `כמה זה ${a} + ${b}?` : `What is ${a} + ${b}?`);
    if (parseInt(answer || '') === a + b) {
      callback();
    } else {
      alert(currentLanguage === Language.HEBREW ? 'תשובה לא נכונה' : 'Wrong answer');
    }
  };

  const handleEmergencyReset = () => {
    setShowFoodSelector(false);
    setShowGameSelector(false);
    setShowHugSelector(false);
    setIsNightMode(false);
    setShowSettings(false);
    setShowBackgroundMusic(false);
    setShowBreathingExercise(false);
    setShowDaySummary(false);
    setShowGratitudeSticker(false);
    setShowFriendshipSticker(false);
    setShowCuriosityClub(false);
    setShowWeeklyAlbum(false);
    setShowPhotoAlbum(false);
    setShowBunnySelfie(false);
    setShowTeacherShare(false);
    setShowGrandparentsShare(false);
    setShowParentDashboard(false);
    setShowBunnyShop(false);
    setShowAccessorySelector(false);
    setShowUnityAR(false);
    setShowCleanupTime(false);
    setShowLittleHelper(false);
    setShowStoryTime(false);
    setShowBedtimeStory(false);
    setShowAITTest(false);
    setShowAITReport(false);
    setIsProcessing(false);
    handleInteraction('reset_view');

  const handleFullReset = () => {
    const keysToRemove = [
      'emotimate_bunny_customization', 'emotimate_rewards', 'emotimate_language',
      'emotimate_onboarding_completed', 'emotimate_welcome_seen', 'emotimate_owned_items',
      'photo_album', 'emotimate_has_shared_with_teacher', 'emotimate_daily_gratitude',
      'emotimate_stars', 'emotimate_app_settings', 'emotimate_self_care_completed',
      'emotimate_self_care_reset_date', 'emotimate_audio_profile', 'emotimate_gratitude_history',
      'emotimate_star_history', 'daily_summaries', 'calm_logs', 'parent_voice_note',
      'current_collaborative_goal', 'emotimate_grand_prize', 'emotimate_soft_fabrics_only',
      'emotimate_last_kiss_sent', 'emotimate_ait_results', 'emotimate_calm_logs'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };
  };

  const handleSettingsChange = useCallback((s: AppSettings) => { 
    setAppSettings(s); 
    if (s.isQuietMode !== undefined && s.isQuietMode !== isQuietMode) {
      setIsQuietMode(s.isQuietMode);
      if (s.isQuietMode) {
        handleInteraction('quiet_mode_start');
      } else {
        // Trigger cleanup automatically when exiting Quiet Mode
        setShowCleanupTime(true);
        handleInteraction('cleanup_start');
      }
    }
    localStorage.setItem('emotimate_app_settings', JSON.stringify(s)); 

    // Sync Coordinates for Unity PlayerPrefs
    // Unity's BunnyARController expects SchoolLat, SchoolLon
    if (s.schoolLat && s.schoolLon) {
      localStorage.setItem('SchoolLat', s.schoolLat);
      localStorage.setItem('SchoolLon', s.schoolLon);
    }
    
    if (s.homeLat && s.homeLon) {
      localStorage.setItem('HomeLat', s.homeLat);
      localStorage.setItem('HomeLon', s.homeLon);
    }
  }, [isQuietMode, handleInteraction]);

  // GPS-Based Trigger Helper
  const checkIsSafeZone = (location: { lat: number; lng: number }) => {
    // Placeholder logic for Safe Zone (Home/School)
    // In a real app, we'd compare against appSettings.homeAddress/schoolName coordinates
    console.log("Checking GPS Location:", location);
    return true; // Default to true for now
  };

  const handleOpenAR = () => {
    // Toggle logic: If already open, close it. Otherwise, check safe zone and open.
    if (showUnityAR) {
      setShowUnityAR(false);
      return;
    }

    // GPS-Based Trigger: AR bunny should only spawn if in a 'Safe Zone'
    if (isSafeZone || true) { // Defaulting to true for demo
      setShowUnityAR(true);
      handleInteraction('ar_world_open');
    } else {
      alert(currentLanguage === Language.HEBREW ? 'מחוץ לאזור בטוח! אי אפשר להוציא את הארנב כאן' : 'Outside safe zone! Cannot spawn bunny here.');
    }
  };

  // --- Audio Initialization ---
  useEffect(() => {
    const resumeAudio = async () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        setAudioStarted(true);
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  useEffect(() => { bunnyRef.current = bunny; }, [bunny]);
  useEffect(() => { 
    if (bunny.customization) {
      localStorage.setItem('emotimate_bunny_customization', JSON.stringify(bunny.customization)); 
    }
  }, [bunny.customization]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { localStorage.setItem('emotimate_rewards', JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem('emotimate_language', currentLanguage); }, [currentLanguage]);
  useEffect(() => { localStorage.setItem('emotimate_stars', totalSelfCareCount.toString()); }, [totalSelfCareCount]);

  // --- Apple Watch Data Polling ---
  useEffect(() => {
    if (appSettings.appleWatchEnabled) {
      const interval = setInterval(async () => {
        const data = await getWatchData();
        if (data && data.heartRate > 100) {
          // If heart rate is high, bunny might suggest breathing
          handleInteraction('high_heart_rate', data.heartRate.toString());
        }
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [appSettings.appleWatchEnabled, handleInteraction]);

  const handleLogMusicChoice = useCallback((trackId: string, trackTitle: string) => {
    if (trackId === 'off') return;
    
    const newLog: CalmLog = {
      timestamp: new Date().toISOString(),
      duration: 0,
      type: 'music_choice',
      activity: trackId,
      label: trackTitle
    };
    setCalmLogs(prev => {
      const updated = [...prev, newLog];
      localStorage.setItem('emotimate_calm_logs', JSON.stringify(updated));
      return updated;
    });
    
    console.log(`Logged music choice: ${trackTitle} (${trackId})`);
  }, []);

  // --- Unity-React Bridge ---
  useEffect(() => {
    const handleUnityMessage = (event: MessageEvent) => {
      // Unity communications usually come through postMessage in WebGL or custom bridge in Native
      // The payload is typically in event.data
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      const { type, action, value, location } = data;

      // 1. Sync GPS Location from Unity's GPSManager
      if (type === 'UNITY_GPS_UPDATE' && location) {
        const isSafe = checkIsSafeZone(location);
        setIsSafeZone(isSafe);
      }

      // 2. Sync Bunny Stats from AR Interactions
      // User preferred logic for 'feed_grass'
      if (action === 'feed_grass' || (type === 'UNITY_AR_INTERACTION' && action === 'feed' && value === 'grass')) {
        updateBunnyStats('feed'); // Update bunny hunger via React helper
        setTotalSelfCareCount(prev => prev + 10); // Bonus for outdoor AR activity
        setSoundTrigger('points');
        handleInteraction('ar_feed_grass');
      } else if (type === 'UNITY_AR_INTERACTION') {
        if (action === 'drink' && value === 'water') {
          setBunny(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
          handleInteraction('ar_drink_water');
        }
      }

      // 3. Handle AR Failures/Unsupported
      if (type === 'UNITY_AR_ERROR') {
        console.error("Unity AR Error:", value);
        setShowUnityAR(false);
      }
    };

    window.addEventListener('message', handleUnityMessage);
    return () => window.removeEventListener('message', handleUnityMessage);
  }, [handleInteraction, updateBunnyStats]);

  // Initial setup
  useEffect(() => {
    // Setup scheduled notifications on mount with a small delay to ensure platform is ready
    const timer = setTimeout(() => {
      scheduleMorningNotification();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    if (!hasInitialized.current && !showOnboarding) {
      hasInitialized.current = true;
      handleInteraction('start', translate('welcome', currentLanguage));
    }
    return () => { isMounted.current = false; };
  }, [showOnboarding, currentLanguage, handleInteraction]);

  // UI Helpers
  const getBackgroundStyle = () => {
    const bg = bunny.customization?.background;
    switch (bg) {
      case 'garden':
        return 'bg-gradient-to-b from-green-400 via-emerald-500 to-teal-900';
      case 'space':
        return 'bg-gradient-to-b from-slate-950 via-purple-950 to-black';
      case 'beach':
        return 'bg-gradient-to-b from-sky-400 via-blue-200 to-amber-100';
      case 'underwater':
        return 'bg-gradient-to-b from-cyan-600 via-blue-700 to-indigo-900';
      default:
        return 'bg-[#1e1e1e]';
    }
  };

  const renderBackgroundElements = () => {
    const bg = bunny.customization?.background;
    if (bg === 'space') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>
      );
    }
    if (bg === 'underwater') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute bg-white/40 rounded-full"
              initial={{ y: '110%', x: Math.random() * 100 + '%' }}
              animate={{ y: '-10%' }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 20
              }}
              style={{
                width: Math.random() * 20 + 10 + 'px',
                height: Math.random() * 20 + 10 + 'px',
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  // UI
  return (
    <div className={`min-h-screen ${getBackgroundStyle()} text-white flex flex-col transition-all duration-1000 relative overflow-hidden`}>
      {renderBackgroundElements()}
      {showOnboarding ? (
        <OnboardingScreen language={currentLanguage} onComplete={handleOnboardingComplete} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-hidden relative">
          <div className="w-full mb-4 z-50">
             <div 
               ref={menuScrollRef}
               className="flex flex-nowrap overflow-x-auto gap-5 px-6 py-3 scrollbar-hide w-full items-center touch-pan-x whitespace-nowrap"
             >
                <button 
                  onClick={() => {
                    setIsProcessing(false);
                    setShowCompanionMenu(true);
                  }} 
                  className="p-2 bg-purple-600/80 rounded-full hover:bg-purple-700 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={isHebrew ? 'החבר שלי' : 'My Companion'}
                >
                  ❤️
                </button>
                <button 
                  onClick={() => setShowEmotionalHub(true)} 
                  className="p-2 bg-pink-600/80 rounded-full hover:bg-pink-700 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={isHebrew ? 'יומן רגשות' : 'Emotional Hub'}
                >
                  🎭
                </button>
                <button 
                  onClick={() => setShowTherapyMissions(true)} 
                  className="p-2 bg-indigo-500/80 rounded-full hover:bg-indigo-600 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={isHebrew ? 'משימות ריפוי' : 'Therapy Missions'}
                >
                  🎯
                </button>
                <button 
                  onClick={() => setShowSettings(true)} 
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all shadow-lg flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('customize', currentLanguage)}
                >
                  ⚙️
                </button>
                <button 
                  onClick={() => {
                    setIsProcessing(false);
                    setShowBackgroundMusic(true);
                  }} 
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all shadow-lg flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('music', currentLanguage)}
                >
                  🎵
                </button>
                <button 
                  onClick={handleOpenAR} 
                  className="p-2 bg-green-600/80 rounded-full hover:bg-green-700 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('walk', currentLanguage)}
                >
                  ✨
                </button>
                <button 
                  onClick={() => setShowParentDashboard(true)} 
                  className="p-2 bg-indigo-600/80 rounded-full hover:bg-indigo-700 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('parentDashboard', currentLanguage)}
                >
                  📊
                </button>
                <button 
                  onClick={() => setShowProgressHub(true)} 
                  className="p-2 bg-blue-500/80 rounded-full hover:bg-blue-600 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('achievements', currentLanguage)}
                >
                  🏆
                </button>
                <button 
                  onClick={() => setShowBunnyShop(true)} 
                  className="p-2 bg-yellow-600/80 rounded-full hover:bg-yellow-700 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('rewards', currentLanguage)}
                >
                  🛒
                </button>
                <button 
                  onClick={() => setShowAccessorySelector(true)} 
                  className="p-2 bg-blue-400/80 rounded-full hover:bg-blue-500 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('customize', currentLanguage)}
                >
                  👕
                </button>
                <button 
                  onClick={() => setShowBunnySelfie(true)} 
                  className="p-2 bg-pink-500/80 rounded-full hover:bg-pink-600 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('selfie', currentLanguage)}
                >
                  🤳
                </button>
                <button 
                  onClick={() => setShowPhotoAlbum(true)} 
                  className="p-2 bg-purple-500/80 rounded-full hover:bg-purple-600 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={translate('photoAlbum', currentLanguage)}
                >
                  📸
                </button>
                <button 
                  onClick={() => setShowSelfExpressionStudio(true)} 
                  className="p-2 bg-pink-400/80 rounded-full hover:bg-pink-500 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={isHebrew ? 'סטודיו לביטוי עצמי' : 'Expression Studio'}
                >
                  🎨
                </button>
                <button 
                  onClick={() => setShowPsychoeducation(true)} 
                  className="p-2 bg-emerald-500/80 rounded-full hover:bg-emerald-600 transition-all shadow-lg text-xl flex-shrink-0 w-12 h-12 flex items-center justify-center"
                  title={isHebrew ? 'לומדים רגשות' : 'Learning Emotions'}
                >
                  📖
                </button>
             </div>
          </div>

          <div className="w-full max-w-md flex-1 flex flex-col min-h-0 space-y-2">
            {/* Bunny Status Overlay - Now at the top */}
            <div className="flex-shrink-0 pt-2 opacity-80 hover:opacity-100 transition-opacity">
              <BunnyStatus bunny={bunny} language={currentLanguage} />
            </div>

            {/* 1. Bunny Avatar Section - Flexible */}
            <div className="flex-1 min-h-0 flex items-center justify-center py-1 relative">
              <div className="transform scale-90 sm:scale-100">
                <BunnyLottie 
                  mood={bunny.currentEmotion} 
                  customization={bunny.customization}
                />
              </div>
              
              {/* Music Timer Floating Overlay */}
              {musicSleepTimer !== null && musicSleepTimer > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-4 right-4 bg-purple-600/80 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl shadow-lg border border-white/20 flex items-center gap-2 z-20 cursor-pointer"
                  onClick={() => setShowBackgroundMusic(true)}
                >
                  <span className="text-sm">🎶</span>
                  <span className="font-mono text-xs font-bold">
                    {Math.floor(musicSleepTimer)} דק׳
                  </span>
                </motion.div>
              )}
            </div>

            {/* 2. Chat History Section - Scrollable & Fixed Height Screen */}
            <div className="h-44 bg-black/40 rounded-3xl p-4 overflow-y-auto space-y-3 border-2 border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative flex-shrink-0 backdrop-blur-sm">
              {safeChatHistory.length === 0 ? (
                <div className="text-center text-white/30 my-auto italic py-10">
                  {translate('bunnyWaiting', currentLanguage)}
                </div>
              ) : (
                <div className="flex flex-col space-y-4 pb-2">
                  {safeChatHistory.map((msg, index) => {
                    const isLatestBotMessage = msg.sender === 'bot' && 
                      index === safeChatHistory.length - 1;
                    
                    return (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-lg ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border-b-4 border-gray-200'
                        }`}>
                          <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                          {/* Removed ResponseButtons from here as they were redundant and didn't advance logic */}
                        </div>
                      </div>
                    );
                  })}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none shadow-md">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 3. Interaction Controls */}
            <div className="flex-shrink-0 bg-white/10 p-3 rounded-3xl border border-white/20 shadow-xl backdrop-blur-lg">
              <Controls 
                language={currentLanguage}
                disabled={isProcessing}
                onAction={(action) => handleInteraction(action)}
                onFeedClick={() => { setIsProcessing(false); setShowFoodSelector(true); }}
                onPlayClick={() => { setIsProcessing(false); setShowGameSelector(true); }}
                onHugClick={() => { setIsProcessing(false); setShowHugSelector(true); }}
                onBreathingClick={() => { setIsProcessing(false); setShowBreathingExercise(true); }}
                onGratitudeClick={() => {
                  setIsProcessing(false);
                  setShowGratitudeSticker(true);
                  handleInteraction('gratitude_start');
                }}
                onFriendshipClick={() => {
                  setIsProcessing(false);
                  setShowFriendshipSticker(true);
                  handleInteraction('friendship_start');
                }}
                onCuriosityClick={() => {
                  setIsProcessing(false);
                  setShowCuriosityClub(true);
                  handleInteraction('curiosity_start');
                }}
                onHelperClick={() => {
                  setIsProcessing(false);
                  setShowLittleHelper(true);
                  handleInteraction('helper_start');
                }}
                onMusicClick={() => {
                  setIsProcessing(false); 
                  setShowBackgroundMusic(true);
                  handleInteraction('music_picker_open');
                }}
                onBedtimeStoryClick={() => {
                  setIsProcessing(false);
                  setShowBedtimeStory(true);
                  handleInteraction('bedtime_story_start');
                }}
                onHealthyPlateClick={() => {
                  setIsProcessing(false);
                  setShowHealthyPlate(true);
                  handleInteraction('healthy_plate_open');
                }}
                onWaterBuddyClick={() => {
                  setIsProcessing(false);
                  setShowWaterBuddy(true);
                  handleInteraction('water_buddy_open');
                }}
              />
            </div>

            {/* 4. Self Care Tasks Section */}
            <div className="flex-shrink-0 space-y-4">
              <DailyProgress 
                completedTasks={completedSelfCareCount} 
                totalTasks={4} 
                bunnyMood={bunny.currentEmotion} 
                language={currentLanguage} 
              />
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                <SelfCareTasks 
                  language={currentLanguage}
                  onTasksChange={(completedIds) => setCompletedSelfCareCount(completedIds.length)}
                  onTaskComplete={(taskLabel, allCompleted) => {
                    setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + 5, dailyPoints: prev.dailyPoints + 5 }));
                    setSoundTrigger('points');
                    setBunnyAnimation('happy');
                    setTimeout(() => setBunnyAnimation(undefined), 2000);
                    
                    const feedback = translate('taskCompleted', currentLanguage, { task: taskLabel, points: '5' });
                    addMessage('bot', feedback);

                  // Trigger celebration if all tasks are completed
                  if (allCompleted) {
                    setBunnyAnimation('satisfied');
                    setTimeout(() => {
                      handleInteraction('all_tasks_done', translate('allTasksCompleted', currentLanguage));
                    }, 1500);

                    // Schedule recommendation for bedtime/relaxation
                    scheduleRecommendationNotification(
                      currentLanguage === Language.HEBREW ? "סיימת את כל המשימות! ✨" : "All Tasks Completed! ✨",
                      currentLanguage === Language.HEBREW ? "זה זמן מעולה להקשיב לסיפור לפני השינה עם הארנב 📚" : "Great time to listen to a bedtime story with the Bunny 📚",
                      120 // 2 hours later
                    );
                  }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      {!showOnboarding && showWelcomeMessage && (
        <WelcomeMessage language={currentLanguage} onClose={() => { setShowWelcomeMessage(false); localStorage.setItem('emotimate_welcome_seen', 'true'); }} />
      )}
      {showSettings && (
        <Settings 
          onFullReset={handleFullReset}
          language={currentLanguage} 
          onClose={() => setShowSettings(false)} 
          onSettingsChange={handleSettingsChange} 
          onEmergencyReset={handleEmergencyReset}
          onLanguageChange={(lang) => {
            setCurrentLanguage(lang);
            localStorage.setItem('emotimate_language', lang);
          }}
          onOpenAITTest={() => {
            setShowSettings(false);
            setShowAITTest(true);
          }}
          onOpenAITReport={() => {
            setShowSettings(false);
            setShowAITReport(true);
          }}
        />
      )}

      <AnimatePresence>
        {showHugAnimation && (
          <UnityStyleHugAnimation onComplete={() => setShowHugAnimation(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAITTest && (
          <AITFrequencyTest 
            language={currentLanguage}
            onClose={() => setShowAITTest(false)}
            onComplete={(results) => {
              localStorage.setItem('emotimate_ait_results', JSON.stringify(results));
              handleInteraction('ait_test_complete');
              
              const newLog: CalmLog = {
                timestamp: new Date().toISOString(),
                duration: 0,
                type: 'therapy_mission',
                label: 'Auditory Sensitivity Test',
                activity: 'ait_test'
              };
              setCalmLogs(prev => [...prev, newLog]);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAITReport && (
          <AITReportScreen 
            language={currentLanguage}
            onClose={() => setShowAITReport(false)}
          />
        )}
      </AnimatePresence>
      {showRewardAnimation && (
        <RewardAnimation 
          points={showRewardAnimation.points} 
          taskName={showRewardAnimation.taskName} 
          onComplete={() => setShowRewardAnimation(null)} 
          language={currentLanguage} 
          lowVisualOverload={appSettings.lowVisualOverload}
        />
      )}
      
      {/* Interaction Modals */}
      {showFoodSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <FoodSelector 
              language={currentLanguage} 
              onSelect={(food) => {
                handleInteraction('feed', food);
                setShowFoodSelector(false);
              }} 
              onClose={() => setShowFoodSelector(false)} 
            />
            <button onClick={() => setShowFoodSelector(false)} className="w-full mt-4 p-3 bg-white/20 rounded-xl text-white font-bold">ביטול</button>
          </div>
        </div>
      )}
      {showGameSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <GameSelector 
              language={currentLanguage} 
              onSelect={(game) => {
                handleInteraction('play', game);
                setShowGameSelector(false);
              }} 
              onClose={() => setShowGameSelector(false)} 
            />
            <button onClick={() => setShowGameSelector(false)} className="w-full mt-4 p-3 bg-white/20 rounded-xl text-white font-bold">ביטול</button>
          </div>
        </div>
      )}
      {showHugSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <HugSelector 
              language={currentLanguage} 
              onSelect={(hug) => {
                handleInteraction('hug', hug);
                setShowHugSelector(false);
                setShowHugAnimation(true);
              }} 
              onClose={() => setShowHugSelector(false)} 
            />
            <button onClick={() => setShowHugSelector(false)} className="w-full mt-4 p-3 bg-white/20 rounded-xl text-white font-bold">ביטול</button>
          </div>
        </div>
      )}
      {showBreathingExercise && (
        <BreathingExercise 
          language={currentLanguage} 
          onClose={() => setShowBreathingExercise(false)} 
        />
      )}

      {showHealthyPlate && (
        <HealthyPlate
          language={currentLanguage}
          onClose={() => setShowHealthyPlate(false)}
          onReward={(pts) => setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + pts }))}
          onAction={(text) => addMessage('bot', text)}
        />
      )}

      {showWaterBuddy && (
        <WaterBuddy
          language={currentLanguage}
          onClose={() => setShowWaterBuddy(false)}
          onDrink={() => setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + 2 }))}
          onAction={(text) => addMessage('bot', text)}
        />
      )}
      
      {/* Background Systems */}
      <AudioPlayer 
        volume={isQuietMode ? 0.2 : (appSettings.soundVolume / 100)}
        enabled={!isQuietMode || appSettings.soundVolume > 0}
      />
      <SoundReinforcement 
        trigger={soundTrigger} 
        onComplete={() => setSoundTrigger(null)} 
        volume={isQuietMode ? 0.1 : (appSettings.soundVolume / 300)} 
      />
      <BackgroundMusic 
        language={currentLanguage} 
        onClose={() => setShowBackgroundMusic(false)} 
        show={showBackgroundMusic}
        isQuietMode={isQuietMode}
        isAROpen={showUnityAR}
        isStoryPlaying={isBedtimeStoryPlaying}
        sleepTimer={musicSleepTimer}
        onStartSleepTimer={(mins) => setMusicSleepTimer(mins)}
        onSelectTrack={handleLogMusicChoice}
      />
      
      {/* New Overlays */}
      <AnimatePresence>
        {showCleanupTime && (
          <CleanupTime 
            language={currentLanguage}
            onClose={() => setShowCleanupTime(false)}
            onComplete={() => {
              setTotalSelfCareCount(prev => prev + 5);
              setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + 5 }));
              handleInteraction('cleanup_complete');
              addMessage('bot', currentLanguage === Language.HEBREW 
                ? 'וואו! איזה יופי סידרת הכל. קיבלת 5 כוכבי אחריות! ⭐⭐⭐⭐⭐' 
                : 'Wow! You cleaned up everything so nicely. You earned 5 Responsibility Stars! ⭐⭐⭐⭐⭐'
              );
              setTimeout(() => setShowCleanupTime(false), 3000);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLittleHelper && (
          <LittleHelper
            language={currentLanguage}
            onClose={() => setShowLittleHelper(false)}
            onComplete={(taskId, points) => {
              setTotalSelfCareCount(prev => prev + 10); // Award 10 stars per task as requested
              setRewards(prev => ({ ...prev, totalPoints: prev.totalPoints + 10 }));
              handleInteraction(`helper_complete:${taskId}`);
              setSoundTrigger('points');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDaySummary && (
          <DaySummary 
            language={currentLanguage}
            onClose={() => setShowDaySummary(false)}
            onSave={(summary) => {
              setTotalSelfCareCount(prev => prev + 10);
              setTimeout(() => setShowStoryTime(true), 2000);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGratitudeSticker && (
          <GratitudeSticker 
            language={currentLanguage}
            onClose={() => setShowGratitudeSticker(false)}
            onComplete={(id) => {
              setDailyGratitude(id);
              handleInteraction(`gratitude_select:${id}`);
              setTimeout(() => {
                setShowGratitudeSticker(false);
                setShowBedtimeStory(true);
              }, 2000);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFriendshipSticker && (
          <FriendshipSticker 
            language={currentLanguage}
            onClose={() => setShowFriendshipSticker(false)}
            onComplete={(id) => {
              handleInteraction(`friendship_select:${id}`);
              setTimeout(() => setShowFriendshipSticker(false), 2500);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCuriosityClub && (
          <CuriosityClub 
            language={currentLanguage}
            onClose={() => setShowCuriosityClub(false)}
            bunnyState={JSON.stringify(bunny)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWeeklyAlbum && (
          <WeeklySuccessAlbum 
            language={currentLanguage} 
            onClose={() => setShowWeeklyAlbum(false)}
            onShareWithTeacher={() => {
              setShowTeacherShare(true);
              handleInteraction('teacher_share_open');
            }}
            onShareWithGrandparents={handleShareWithGrandparents}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeacherShare && (
          <TeacherShare 
            language={currentLanguage}
            onClose={() => setShowTeacherShare(false)}
            onShareSuccess={() => {
              setHasSharedWithTeacher(true);
              // Achievement unlock logic would go here
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGrandparentsShare && (
          <GrandparentsShare
            language={currentLanguage}
            photos={photos}
            onClose={() => setShowGrandparentsShare(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBunnyShop && (
          <BunnyShop
            language={currentLanguage}
            currency={totalSelfCareCount}
            onPurchase={handleShopPurchase}
            onClose={() => setShowBunnyShop(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccessorySelector && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AccessorySelector
              language={currentLanguage}
              currentAccessory={bunny.customization?.hat || 'none'}
              unlockedItems={unlockedItems}
              onSelect={(accId) => {
                if (accId === 'none') {
                  setBunny(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization,
                      hat: 'none',
                      glasses: 'none',
                      bow: 'none'
                    }
                  }));
                } else {
                  const item = SHOP_ITEMS.find(i => i.id === accId);
                  if (item) {
                    setBunny(prev => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        [item.category === 'bowtie' ? 'bow' : item.category]: item.id
                      }
                    }));
                  }
                }
                setShowAccessorySelector(false);
              }}
              onOpenShop={() => {
                setShowAccessorySelector(false);
                setShowBunnyShop(true);
              }}
              onClose={() => setShowAccessorySelector(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showParentDashboard && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <ParentDashboard 
              language={currentLanguage}
              onClose={() => setShowParentDashboard(false)}
              onOpenWeeklyAlbum={() => {
                setShowParentDashboard(false);
                setShowWeeklyAlbum(true);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPhotoAlbum && (
          <PhotoAlbum
            language={currentLanguage}
            photos={photos}
            onClose={() => setShowPhotoAlbum(false)}
            onDelete={handleDeletePhoto}
            onOpenParentGate={openParentGate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBunnySelfie && (
          <BunnySelfie
            language={currentLanguage}
            bunnyComponent={<BunnyLottie mood={bunny.currentEmotion} customization={bunny.customization} />}
            onSave={handleSavePhoto}
            onClose={() => setShowBunnySelfie(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnityAR && (
          <UnityARScreen 
            language={currentLanguage}
            bunny={bunny}
            settings={appSettings}
            onClose={() => setShowUnityAR(false)}
            onError={(err) => {
              console.error(err);
              setShowUnityAR(false);
              alert(currentLanguage === Language.HEBREW ? 'אופס! ה-AR לא עובד במכשיר זה. עוברים לארנב הדו-ממדי' : 'Oops! AR not working on this device. Switching to 2D Bunny.');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPsychoeducation && (
          <Psychoeducation
            language={currentLanguage}
            onClose={() => setShowPsychoeducation(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSelfExpressionStudio && (
          <SelfExpressionStudio 
            language={currentLanguage}
            onClose={() => setShowSelfExpressionStudio(false)}
            bunny={bunny}
            onUpdateBunny={(customization) => setBunny(prev => ({ ...prev, customization: { ...prev.customization, ...customization } }))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProgressHub && (
          <ProgressHub 
            language={currentLanguage}
            onClose={() => setShowProgressHub(false)}
            rewardState={rewards}
            emotionalPoints={emotionalPoints}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompanionMenu && (
          <CompanionMenu
            language={currentLanguage}
            onClose={() => setShowCompanionMenu(false)}
            onSelectAction={(action) => handleInteraction(action)}
            bunny={bunny}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmotionalHub && (
          <EmotionalHub 
            language={currentLanguage}
            onClose={() => setShowEmotionalHub(false)}
            onLogEmotion={handleLogEmotion}
            logs={calmLogs}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTherapyMissions && (
          <TherapyMissions 
            language={currentLanguage}
            onClose={() => setShowTherapyMissions(false)}
            onCompleteMission={handleCompleteTherapyMission}
            unlockedMissions={unlockedMissions}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStoryTime && (
          <StoryTime 
            language={currentLanguage}
            onClose={() => setShowStoryTime(false)}
            onSelect={(id, label) => {
              setShowStoryTime(false);
              if (id === 'friends') {
                setShowFriendshipSticker(true);
                handleInteraction('friendship_start');
              } else if (id === 'helper') {
                setShowLittleHelper(true);
                handleInteraction('helper_start');
              } else {
                handleInteraction(`experience_${id}`);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBedtimeStory && (
          <BedtimeStory
            language={currentLanguage}
            onClose={() => {
              setShowBedtimeStory(false);
              setIsBedtimeStoryPlaying(false);
            }}
            onStartStory={() => setIsBedtimeStoryPlaying(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

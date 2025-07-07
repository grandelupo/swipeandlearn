import { NativeModules, Platform } from 'react-native';

type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [locale: string]: TranslationKeys;
};

const translations: Translations = {
  en: {
    // NewStory screen
    createNewStory: 'Create New Story',
    allowInappropriateLanguage: 'Allow inappropriate language',
    storyTitlePlaceholder: 'Story title (optional)',
    storyThemePlaceholder: 'Story theme (optional, e.g. Adventure, Mystery)',
    addTargetWords: 'Add Target Words',
    chooseWordPackage: 'Choose a Word Package:',
    customWords: 'Custom Words',
    enterWord: 'Enter a word',
    done: 'Done',
    creatingStory: 'Creating Story...',
    createStory: 'Create Story',
    generateCoverImage: 'Generate cover image',
    generatingTitle: 'Generating title...',
    generatingCover: 'Generating cover...',
    generatingPageNumber: 'Generating page {0} out of 4...',
    generatingStory: 'Generating story...',
    defaultStyle: 'Default style',
    defaultStyleDesc: 'Clear, straightforward storytelling with balanced description and action.',
    hemingwayStyle: 'Ernest Hemingway',
    hemingwayStyleDesc: 'Short, powerful sentences with focus on action and dialogue. Known for the "iceberg theory" of writing.',
    pratchettStyle: 'Terry Pratchett',
    pratchettStyleDesc: 'Witty and satirical with clever wordplay, blending fantasy with social commentary.',
    adamsStyle: 'Douglas Adams',
    adamsStyleDesc: 'Absurdist humor with unexpected twists and philosophical musings.',
    orwellStyle: 'George Orwell',
    orwellStyleDesc: 'Clear, precise language with political themes and stark imagery.',
    didionStyle: 'Joan Didion',
    didionStyleDesc: 'Elegant prose with psychological depth and atmospheric descriptions.',
    mickiewiczStyle: 'Adam Mickiewicz',
    mickiewiczStyleDesc: 'Rich, poetic language with romantic themes and emotional imagery.',
    dumasStyle: 'Alexandre Dumas',
    dumasStyleDesc: 'Dramatic, sweeping prose with adventure and historical settings.',
    nabokovStyle: 'Vladimir Nabokov',
    nabokovStyleDesc: 'Intricate, layered prose with psychological complexity and wordplay.',
    wildeStyle: 'Oscar Wilde',
    wildeStyleDesc: 'Witty, epigrammatic prose with social satire and clever dialogue.',
    fitzgeraldStyle: 'F. Scott Fitzgerald',
    fitzgeraldStyleDesc: 'Lyrical, descriptive prose with themes of wealth and the American Dream.',
    
    // Difficulty levels
    beginner: 'Beginner',
    elementary: 'Elementary',
    intermediate: 'Intermediate',
    upperIntermediate: 'Upper Intermediate',
    advanced: 'Advanced',
    mastery: 'Mastery',
    divine: 'Divine - Beyond Mortal Understanding',
    
    // Difficulty descriptions
    beginnerDesc: 'Basic phrases and everyday expressions. Can introduce themselves and interact in a simple way.',
    elementaryDesc: 'Familiar topics and routine matters. Can describe aspects of their background and immediate environment.',
    intermediateDesc: 'Main points on familiar matters. Can deal with most situations likely to arise while traveling.',
    upperIntermediateDesc: 'Complex texts and technical discussions. Can interact with fluency and spontaneity.',
    advancedDesc: 'Complex and demanding texts. Can use language flexibly for social, academic and professional purposes.',
    masteryDesc: 'Virtually everything heard or read. Can express themselves spontaneously, very fluently and precisely.',
    divineDesc: 'Transcends conventional language mastery. Features archaic forms, complex metaphysical concepts, and intricate literary devices beyond classical epics. Challenges even educated native speakers.',

    // Word packages
    administrationPackage: 'Administration & Taxes',
    medicinePackage: 'Medicine & Healthcare',
    chemistryPackage: 'Chemistry',
    businessPackage: 'Business & Finance',
    technologyPackage: 'Technology & IT',
    lawPackage: 'Law & Legal',
    engineeringPackage: 'Engineering',
    psychologyPackage: 'Psychology',
    economicsPackage: 'Economics',

    // Error messages
    errorCreatingStory: 'Failed to create story',
    errorUnknown: 'Unknown error',
    errorCheckConsole: 'Please check console for details.',
    insufficientCoinsTitle: 'Insufficient Coins',
    insufficientCoinsForCover: 'You don\'t have enough coins ({0}) to generate a cover image. Would you like to continue without a cover?',
    errorFetchingStories: 'Error fetching stories',
    errorArchivingStory: 'Failed to archive story',
    errorUploadingImage: 'Failed to upload image',
    errorLoadingProfile: 'Failed to load profile',
    errorSigningOut: 'Failed to sign out',
    errorUpdatingTranslationLanguage: 'Failed to update translation language',
    errorUpdatingModelPreference: 'Failed to update AI model preference',
    errorLoadingStory: 'Error loading story',
    errorGeneratingPage: 'Error generating page',
    errorGeneratingAudio: 'Error generating audio',
    errorFetchingDefinitions: 'Error fetching definitions',
    errorFetchingArchivedStories: 'Error fetching archived stories',
    errorUnarchivingStory: 'Failed to unarchive story',

    // Common actions and states
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    add: 'Add',
    remove: 'Remove',

    // Navigation
    back: 'Back',
    profile: 'Profile',
    archive: 'Archive',
    bookshelf: 'Bookshelf',
    story: 'Story',

    // Tutorial
    gotIt: 'Got it!',
    next: 'Next',
    skip: 'Skip',
    finish: 'Finish',

    // Profile screen
    profileSettings: 'Profile Settings',
    email: 'Email',
    totalStoriesCreated: 'Total stories created',
    preferredTranslationLanguage: 'Preferred translation language',
    viewArchivedStories: 'View Archived Stories',
    logout: 'Logout',
    loadingProfile: 'Loading profile...',

    // Bookshelf screen
    myStories: 'My Stories',
    pages: 'Pages',
    generatingFirstPage: 'Generating first page...',
    noStoriesMessage: 'You haven\'t created any stories yet. Click the + button to create a new story.',

    // Archive screen
    archivedStories: 'Archived Stories',
    noArchivedStories: 'You haven\'t archived any stories yet.',
    unarchiveStory: 'Unarchive Story',
    loadingArchivedStories: 'Loading archived stories...',

    // StoryReader screen
    loadingStory: 'Loading story...',
    generatingPage: 'Generating page...',
    personalizeStory: 'Personalize Story',
    addTargetWord: 'Add Target Word',
    targetWords: 'Target Words',
    generateAudio: 'Generate Audio',
    changeVoice: 'Change Voice',
    playAudio: 'Play Audio',
    pauseAudio: 'Pause Audio',
    stopAudio: 'Stop Audio',
    translating: 'Translating...',
    tapWordForTranslation: 'Tap a word to see its translation',
    longPressForDictionary: 'Long press a word to see its definition',
    noDefinitionsFound: 'No definitions found',
    previousPage: 'Previous Page',
    nextPage: 'Next Page',
    page: 'Page',
    of: 'of',
    dictionary: 'Dictionary',
    defaultDictionary: 'Default',
    wiktionary: 'Wiktionary',
    diki: 'Diki (polski)',
    wordNotFoundInDictionary: 'Word not found in dictionary',

    // Components - AudioPlayer
    generatingAudio: 'Generating audio...',
    selectVoice: 'Select Voice',

    // Components - CoinCounter
    buyCoins: 'Buy Coins',
    yourBalance: 'Your Balance',
    loadingPackages: 'Loading packages...',
    noPackagesAvailable: 'No packages available at the moment.',
    retry: 'Retry',
    buy: 'Buy',
    purchaseDisclaimer: 'Purchases will be charged to your App Store or Google Play account. All purchases are subject to our Terms of Service and Privacy Policy.',
    coins: 'Coins',
    // Components - Dictionary
    examples: 'Examples',
    relatedWords: 'Related Words',

    // Components - FeedbackButton
    sendFeedback: 'Send Feedback',
    feedbackDescription: "We'd love to hear your thoughts! Please share any feedback, suggestions, or issues you've encountered.",
    feedbackPlaceholder: 'Type your feedback here...',
    submitting: 'Submitting...',
    submitFeedback: 'Submit Feedback',
    feedbackSuccess: 'Thank you for your feedback!',
    feedbackError: 'Failed to submit feedback. Please try again.',
    enterFeedback: 'Please enter your feedback',

    // Components - TutorialOverlay
    selectLanguage: 'Select your preferred language',

    // Voice descriptions
    voiceAutumn: 'Friendly, narrative female voice',
    voiceLaura: 'Relaxing female ASMR voice',
    voiceRoger: 'Deep, authoritative male voice',
    voiceBill: 'Calm, relaxing male voice',
    voiceAdam: 'Deep British voice',
    voiceAllisson: 'Expressive female millennial voice',
    voiceDakota: 'African-American female voice in her 30s',
    voiceEmily: 'Friendly young female voice',
    voiceFrederick: 'Professional British voice',
    voiceJohn: 'Narrative male voice',
    voiceJason: 'Neutral Australian male voice',
    voiceAgatka: 'Bright and cheerful Polish female voice',

    // StoryReader additional translations
    continueReading: 'Continue Reading',
    storyNotFound: 'Story not found',
    pageNotFound: 'Page {0} not found',
    goToLastPage: 'Go to last page',
    words: 'Words',
    addTargetWordsTitle: 'Add Target Words',
    addTargetWordsDescription: 'Enter words you want to focus on learning in this story.',
    wordInputPlaceholder: 'Enter a word',
    addWord: 'Add Word',
    wordAlreadyExists: 'This word is already in your target list',
    maximumWordsReached: 'Maximum number of target words reached (10)',
    minimumCharacters: 'Word must be at least 2 characters long',

    // Authentication screens
    login: 'Login',
    register: 'Register',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    resetPassword: 'Reset Password',
    resetPasswordDescription: 'Enter your email address and we will send you instructions to reset your password.',
    resetPasswordSuccess: 'Password reset instructions have been sent to your email.',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters long',
    passwordsDontMatch: 'Passwords do not match',
    invalidCredentials: 'Invalid email or password',
    termsAndConditions: 'By signing up, you agree to our Terms and Conditions',
    privacyPolicy: 'Privacy Policy',

    // Tutorial steps - AudioPlayer
    audioPlayerTutorialVoiceChange: 'You can change the voice by clicking on the voice name.',

    // Tutorial steps - Bookshelf
    bookshelfTutorialFeedback: 'You can send feedback to the developer by clicking the button in the top right corner. Thank you!',
    bookshelfTutorialAddStory: 'Click the + button to create a new story.',

    // Tutorial steps - NewStory
    newStoryTutorialTargetWords: 'Click on "Add Target Words" to add words that will be used in the story.',

    // Tutorial steps - StoryReader
    storyReaderTutorialTranslation: 'Click once on any word to translate it to your preferred language. Double-tap for a sentence translation.',
    storyReaderTutorialDictionary: 'Long-press on any word to see its dictionary definition.',
    storyReaderTutorialLanguageSelect: 'What is your preferred language for translations?',
    storyReaderTutorialAudiobook: 'Click the headphones button to generate an audiobook version of the story.',

    // languages
    english: 'English 🇬🇧',
    spanish: 'Spanish 🇪🇸',
    french: 'French 🇫🇷',
    german: 'German 🇩🇪',
    italian: 'Italian 🇮🇹',
    portuguese: 'Portuguese 🇵🇹',
    chinese: 'Chinese 🇨🇳',
    japanese: 'Japanese 🇯🇵',
    korean: 'Korean 🇰🇷',
    russian: 'Russian 🇷🇺',
    arabic: 'Arabic 🇸🇦',
    polish: 'Polish 🇵🇱',

    // Alerts
    error: 'Error',
    success: 'Success',
    insufficientCoins: 'Insufficient coins',
    insufficientCoinsMessage: 'You need {0} coins to {1}. Would you like to buy more coins?',
    cancelAlert: 'Cancel',
    getCoins: 'Get Coins',
    fnameGenerateStory: 'generate story',
    fnameGenerateCover: 'generate cover',
    fnameGenerateAudio: 'generate audio',
    fnameGenerateNewPage: 'generate new page',
    errorTranslatingSentence: 'Failed to translate sentence',

    // Ad rewards
    watchAdForCoins: 'Watch an ad to get {0} coins',
    loadingAd: 'Loading ad...',
    adRewardSuccess: 'You received {0} coins!',
    adError: 'Failed to show ad. Please try again later.',
    adCooldown: 'Please wait an hour between watching ads', 
    
  },
  pl: {
    // NewStory screen
    createNewStory: 'Stwórz nową historię',
    allowInappropriateLanguage: 'Zezwól na niestosowny język',
    storyTitlePlaceholder: 'Tytuł historii (opcjonalnie)',
    storyThemePlaceholder: 'Motyw historii (opcjonalnie, np. przygodowa, tajemnicza)',
    addTargetWords: 'Dodaj słowa docelowe',
    chooseWordPackage: 'Wybierz pakiet słów:',
    customWords: 'Własne słowa',
    enterWord: 'Wprowadź słowo',
    done: 'Gotowe',
    creatingStory: 'Tworzenie historii...',
    createStory: 'Stwórz historię',
    generateCoverImage: 'Wygeneruj okładkę',
    generatingTitle: 'Generowanie tytułu...',
    generatingCover: 'Generowanie okładki...',
    generatingPageNumber: 'Generowanie strony {0} z 4...',
    generatingStory: 'Generowanie historii...',
    defaultStyle: 'Domyślny styl',
    defaultStyleDesc: 'Jasna, bezpośrednia narracja z wyważonym opisem i akcją.',
    hemingwayStyle: 'Ernest Hemingway',
    hemingwayStyleDesc: 'Krótkie, mocne zdania skupione na akcji i dialogu. Znany z "teorii góry lodowej" w pisaniu.',
    pratchettStyle: 'Terry Pratchett',
    pratchettStyleDesc: 'Dowcipna i satyryczna z inteligentną grą słów, łącząca fantasy z komentarzem społecznym.',
    adamsStyle: 'Douglas Adams',
    adamsStyleDesc: 'Absurdalny humor z nieoczekiwanymi zwrotami akcji i filozoficznymi rozważaniami.',
    orwellStyle: 'George Orwell',
    orwellStyleDesc: 'Jasny, precyzyjny język z tematami politycznymi i surowymi obrazami.',
    didionStyle: 'Joan Didion',
    didionStyleDesc: 'Elegancka proza z psychologiczną głębią i atmosferycznymi opisami.',
    mickiewiczStyle: 'Adam Mickiewicz',
    mickiewiczStyleDesc: 'Bogaty, poetycki język z romantycznymi motywami i emocjonalnymi obrazami.',
    dumasStyle: 'Alexandre Dumas',
    dumasStyleDesc: 'Dramatyczna, rozległa proza z przygodą i historycznymi sceneriami.',
    nabokovStyle: 'Vladimir Nabokov',
    nabokovStyleDesc: 'Złożona, wielowarstwowa proza z psychologiczną złożonością i grą słów.',
    wildeStyle: 'Oscar Wilde',
    wildeStyleDesc: 'Dowcipna, epigramatyczna proza z satyrą społeczną i inteligentnym dialogiem.',
    fitzgeraldStyle: 'F. Scott Fitzgerald',
    fitzgeraldStyleDesc: 'Liryczna, opisowa proza z tematami bogactwa i amerykańskiego snu.',
    
    // Difficulty levels
    beginner: 'Początkujący',
    elementary: 'Podstawowy',
    intermediate: 'Średniozaawansowany',
    upperIntermediate: 'Średnio-wyższy',
    advanced: 'Zaawansowany',
    mastery: 'Mistrzowski',
    divine: 'Boski - Poza ludzkim pojmowaniem',
    
    // Difficulty descriptions
    beginnerDesc: 'Podstawowe zwroty i codzienne wyrażenia. Możliwość przedstawienia się i prostej interakcji.',
    elementaryDesc: 'Znajome tematy i rutynowe sprawy. Możliwość opisania aspektów swojego otoczenia i środowiska.',
    intermediateDesc: 'Główne punkty znajomych spraw. Radzenie sobie z większością sytuacji podczas podróży.',
    upperIntermediateDesc: 'Złożone teksty i dyskusje techniczne. Możliwość płynnej i spontanicznej interakcji.',
    advancedDesc: 'Złożone i wymagające teksty. Elastyczne używanie języka w celach społecznych, akademickich i zawodowych.',
    masteryDesc: 'Praktycznie wszystko, co słyszane lub czytane. Możliwość spontanicznego, bardzo płynnego i precyzyjnego wyrażania się.',
    divineDesc: 'Wykracza poza konwencjonalne opanowanie języka. Zawiera archaiczne formy, złożone koncepcje metafizyczne i skomplikowane środki literackie wykraczające poza klasyczne eposy. Stanowi wyzwanie nawet dla wykształconych native speakerów.',

    // Word packages
    administrationPackage: 'Administracja i podatki',
    medicinePackage: 'Medycyna i ochrona zdrowia',
    chemistryPackage: 'Chemia',
    businessPackage: 'Biznes i finanse',
    technologyPackage: 'Technologia i IT',
    lawPackage: 'Prawo',
    engineeringPackage: 'Inżynieria',
    psychologyPackage: 'Psychologia',
    economicsPackage: 'Ekonomia',

    // Error messages
    errorCreatingStory: 'Błąd podczas tworzenia historii',
    errorUnknown: 'Nieznany błąd',
    errorCheckConsole: 'Sprawdź konsolę, aby uzyskać więcej szczegółów.',
    insufficientCoinsTitle: 'Niewystarczająca liczba monet',
    insufficientCoinsForCover: 'Nie masz wystarczającej liczby monet ({0}) aby wygenerować okładkę. Czy chcesz kontynuować bez okładki?',
    errorFetchingStories: 'Błąd podczas pobierania historii',
    errorArchivingStory: 'Nie udało się zarchiwizować historii',
    errorUploadingImage: 'Nie udało się wgrać obrazu',
    errorLoadingProfile: 'Nie udało się załadować profilu',
    errorSigningOut: 'Nie udało się wylogować',
    errorUpdatingTranslationLanguage: 'Nie udało się zaktualizować języka tłumaczenia',
    errorUpdatingModelPreference: 'Nie udało się zaktualizować preferencji modelu AI',
    errorLoadingStory: 'Błąd podczas ładowania historii',
    errorGeneratingPage: 'Błąd podczas generowania strony',
    errorGeneratingAudio: 'Błąd podczas generowania audio',
    errorFetchingDefinitions: 'Błąd podczas pobierania definicji',
    errorFetchingArchivedStories: 'Błąd podczas pobierania zarchiwizowanych historii',
    errorUnarchivingStory: 'Nie udało się przywrócić historii',

    // Common actions and states
    cancel: 'Anuluj',
    save: 'Zapisz',
    delete: 'Usuń',
    edit: 'Edytuj',
    close: 'Zamknij',
    confirm: 'Potwierdź',
    loading: 'Ładowanie...',
    add: 'Dodaj',
    remove: 'Usuń',

    // Navigation
    back: 'Wróć',
    profile: 'Profil',
    archive: 'Archiwum',
    bookshelf: 'Biblioteka',
    story: 'Historia',

    // Tutorial
    gotIt: 'Rozumiem!',
    next: 'Dalej',
    skip: 'Pomiń',
    finish: 'Zakończ',

    // Profile screen
    profileSettings: 'Ustawienia profilu',
    email: 'Email',
    totalStoriesCreated: 'Łączna liczba utworzonych historii',
    preferredTranslationLanguage: 'Preferowany język tłumaczenia',
    viewArchivedStories: 'Zobacz zarchiwizowane historie',
    logout: 'Wyloguj się',
    loadingProfile: 'Ładowanie profilu...',

    // Archive screen
    archivedStories: 'Zarchiwizowane historie',
    noArchivedStories: 'Nie masz jeszcze zarchiwizowanych historii.',
    unarchiveStory: 'Przywróć historię',
    loadingArchivedStories: 'Ładowanie zarchiwizowanych historii...',

    // Bookshelf screen
    myStories: 'Moje historie',
    pages: 'strony',
    generatingFirstPage: 'Generowanie pierwszej strony...',
    noStoriesMessage: 'Nie masz jeszcze żadnych historii. Kliknij przycisk + aby stworzyć nową historię.',

    // StoryReader screen
    loadingStory: 'Ładowanie historii...',
    generatingPage: 'Generowanie strony...',
    storyNotFound: 'Historia nie znaleziona',
    pageNotFound: 'Strona {0} nie znaleziona',
    goToLastPage: 'Idź do ostatniej strony',
    personalizeStory: 'Personalizuj historię',
    addTargetWord: 'Dodaj słowo docelowe',
    targetWords: 'Słowa docelowe',
    generateAudio: 'Generuj audio',
    changeVoice: 'Zmień głos',
    playAudio: 'Odtwórz audio',
    pauseAudio: 'Zatrzymaj audio',
    stopAudio: 'Zatrzymaj audio',
    translating: 'Tłumaczenie...',
    tapWordForTranslation: 'Dotknij słowo, aby zobaczyć tłumaczenie',
    longPressForDictionary: 'Przytrzymaj słowo, aby zobaczyć definicję',
    noDefinitionsFound: 'Nie znaleziono definicji',
    previousPage: 'Poprzednia strona',
    nextPage: 'Następna strona',
    page: 'Strona',
    of: 'z',
    dictionary: 'Słownik',
    defaultDictionary: 'Domyślny',
    wiktionary: 'Wikisłownik',
    diki: 'Diki (polski)',
    wordNotFoundInDictionary: 'Słowo nie znalezione w słowniku',
    

    // Components - AudioPlayer
    generatingAudio: 'Generowanie audio...',
    selectVoice: 'Wybierz głos',

    // Components - CoinCounter
    buyCoins: 'Kup monety',
    yourBalance: 'Twoje saldo',
    loadingPackages: 'Ładowanie pakietów...',
    noPackagesAvailable: 'Brak dostępnych pakietów w tym momencie.',
    retry: 'Spróbuj ponownie',
    buy: 'Kup',
    purchaseDisclaimer: 'Zakupy zostaną pobrane z Twojego konta App Store lub Google Play. Wszystkie zakupy podlegają naszemu Regulaminowi i Polityce Prywatności.',
    coins: 'monety',

    // Components - Dictionary
    examples: 'Przykłady',
    relatedWords: 'Powiązane słowa',

    // Components - FeedbackButton
    sendFeedback: 'Wyślij opinię',
    feedbackDescription: 'Chcielibyśmy poznać Twoje zdanie! Podziel się swoimi uwagami, sugestiami lub napotykanymi problemami.',
    feedbackPlaceholder: 'Wpisz swoją opinię tutaj...',
    submitting: 'Wysyłanie...',
    submitFeedback: 'Wyślij opinię',
    feedbackSuccess: 'Dziękujemy za Twoją opinię!',
    feedbackError: 'Nie udało się wysłać opinii. Spróbuj ponownie.',
    enterFeedback: 'Proszę wprowadzić opinię',

    // Components - TutorialOverlay
    selectLanguage: 'Wybierz preferowany język',

    // Voice descriptions
    voiceAutumn: 'Miły, narracyjny głos kobiecy',
    voiceLaura: 'Relaksujący głos kobiecy ASMR',
    voiceRoger: 'Głęboki, autorytatywny głos męski',
    voiceBill: 'Spokojny, relaksujący głos męski',
    voiceAdam: 'Głęboki głos brytyjski',
    voiceAllisson: 'Ekspresyjny głos kobiecy millenialsów',
    voiceDakota: 'Afroamerykańska głos kobiety w średnim wieku',
    voiceEmily: 'Przyjazny głos młodej kobiety',
    voiceFrederick: 'Profesjonalny, dobrze wysławiający się głos brytyjski',
    voiceJohn: 'Narracyjny głos mężczyzny w średnim wieku',
    voiceJason: 'Neutralny, wyraźny męski głos australijski',
    voiceAgatka: 'Jasny, ciepły głos kobiety z Polski',
    


    // StoryReader additional translations
    continueReading: 'Czytaj dalej',
    words: 'Słowa',
    addTargetWordsTitle: 'Dodaj słowa docelowe',
    addTargetWordsDescription: 'Wprowadź słowa, których chcesz się nauczyć w tej historii.',
    wordInputPlaceholder: 'Wprowadź słowo',
    addWord: 'Dodaj słowo',
    wordAlreadyExists: 'To słowo jest już na twojej liście',
    maximumWordsReached: 'Osiągnięto maksymalną liczbę słów docelowych (10)',
    minimumCharacters: 'Słowo musi mieć co najmniej 2 znaki',

    // Authentication screens
    login: 'Logowanie',
    register: 'Rejestracja',
    password: 'Hasło',
    confirmPassword: 'Potwierdź hasło',
    forgotPassword: 'Zapomniałeś hasła?',
    dontHaveAccount: 'Nie masz konta?',
    alreadyHaveAccount: 'Masz już konto?',
    signUp: 'Zarejestruj się',
    signIn: 'Zaloguj się',
    resetPassword: 'Zresetuj hasło',
    resetPasswordDescription: 'Wprowadź swój adres email, a wyślemy Ci instrukcje resetowania hasła.',
    resetPasswordSuccess: 'Instrukcje resetowania hasła zostały wysłane na Twój email.',
    invalidEmail: 'Wprowadź poprawny adres email',
    passwordTooShort: 'Hasło musi mieć co najmniej 6 znaków',
    passwordsDontMatch: 'Hasła nie są takie same',
    invalidCredentials: 'Nieprawidłowy email lub hasło',
    termsAndConditions: 'Rejestrując się, zgadzasz się z naszym Regulaminem',
    privacyPolicy: 'Polityką Prywatności',

    // Tutorial steps - AudioPlayer
    audioPlayerTutorialVoiceChange: 'Możesz zmienić głos klikając na nazwę głosu.',

    // Tutorial steps - Bookshelf
    bookshelfTutorialFeedback: 'Możesz wysłać opinię do dewelopera klikając przycisk w prawym górnym rogu. Dziękujemy!',
    bookshelfTutorialAddStory: 'Kliknij przycisk + aby stworzyć nową historię.',

    // Tutorial steps - NewStory
    newStoryTutorialTargetWords: 'Kliknij "Dodaj słowa docelowe" aby dodać słowa, które zostaną użyte w historii.',

    // Tutorial steps - StoryReader
    storyReaderTutorialTranslation: 'Kliknij raz na dowolne słowo, aby zobaczyć jego tłumaczenie. Kliknij dwa razy, aby przetłumaczyć całe zdanie.',
    storyReaderTutorialDictionary: 'Przytrzymaj słowo, aby zobaczyć jego definicję w słowniku.',
    storyReaderTutorialLanguageSelect: 'Jaki jest Twój preferowany język tłumaczenia?',
    storyReaderTutorialAudiobook: 'Kliknij przycisk słuchawek, aby wygenerować wersję audio historii.',

    // languages
    english: 'Angielski 🇬🇧',
    spanish: 'Hiszpański 🇪🇸',
    french: 'Francuski 🇫🇷',
    german: 'Niemiecki 🇩🇪',
    italian: 'Włoski 🇮🇹',
    portuguese: 'Portugalski 🇵🇹',
    chinese: 'Chiński 🇨🇳',
    japanese: 'Japoński 🇯🇵',
    korean: 'Koreański 🇰🇷',
    russian: 'Rosyjski 🇷🇺',
    arabic: 'Arabski 🇸🇦',
    polish: 'Polski 🇵🇱',

    // Alerts
    error: 'Błąd',
    success: 'Zrobione!',
    insufficientCoins: 'Niewystarczająca liczba monet',
    insufficientCoinsMessage: 'Potrzebujesz {0} monet na {1}. Czy chcesz kupić więcej monet?',
    cancelAlert: 'Anuluj',
    getCoins: 'Kup monety',
    fnameGenerateStory: 'wygenerowanie historii',
    fnameGenerateCover: 'wygenerowanie okładki',
    fnameGenerateAudio: 'wygenerowanie audio',
    fnameGenerateNewPage: 'wygenerowanie nowej strony',
    errorTranslatingSentence: 'Nie udało się przetłumaczyć zdania',

    // Ad rewards
    watchAdForCoins: 'Obejrzyj reklamę, aby dostać {0} monet',
    loadingAd: 'Ładowanie reklamy...',
    adRewardSuccess: 'Otrzymałeś {0} monet!',
    adError: 'Nie udało się wyświetlić reklamy. Proszę spróbować ponownie później.',
    adCooldown: 'Proszę poczekać godzinę między oglądaniem reklam', 

  }
};

// Get the device language
const getDeviceLanguage = (): string => {
  try {
    if (Platform.OS === 'ios') {
      const locale = 
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        'pl';
      return locale.substring(0, 2);
    }
    
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier || 'pl';
      return locale.substring(0, 2);
    }
    
    return 'pl';
  } catch (error) {
    console.warn('Error getting device language:', error);
    return 'pl';
  }
};

const currentLanguage = getDeviceLanguage();

export const t = (key: string, ...args: any[]): string => {
  try {
    let value = translations[currentLanguage]?.[key] || translations.pl[key] || key;
    
    // Handle parameter replacement if any
    if (args.length > 0) {
      args.forEach((arg, index) => {
        value = value.replace(`{${index}}`, arg.toString());
      });
    }

    return value;
  } catch (error) {
    console.warn('Translation error:', error);
    return key;
  }
};

export const getCurrentLanguage = () => currentLanguage;

export default { t, getCurrentLanguage }; 
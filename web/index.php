<?php
// Language detection
function detectLanguage() {
    if (isset($_GET['lang'])) {
        return $_GET['lang'] === 'pl' ? 'pl' : 'en';
    }
    
    $acceptLanguage = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    return strpos($acceptLanguage, 'pl') !== false ? 'pl' : 'en';
}

$lang = detectLanguage();

// Translations
$translations = [
    'en' => [
        'title' => 'Swipe and Learn - AI-Powered Language Learning Through Stories',
        'description' => 'Learn languages through AI-generated personalized stories. Choose from 12 languages, multiple difficulty levels, and famous author writing styles. Coming Soon!',
        'keywords' => 'language learning, AI stories, vocabulary building, translation app, language education, coming soon',
        'og_title' => 'Swipe and Learn - AI-Powered Language Learning',
        'og_description' => 'Revolutionary language learning through AI-generated personalized stories - Coming Soon!',
        'twitter_title' => 'Swipe and Learn - AI-Powered Language Learning',
        'twitter_description' => 'Revolutionary language learning through AI-generated personalized stories - Coming Soon!',
        
        // Navigation
        'nav_features' => 'Features',
        'nav_languages' => 'Languages',
        'nav_coming_soon' => 'Coming Soon',
        'nav_faq' => 'FAQ',
        'nav_privacy' => 'Privacy',
        'nav_terms' => 'Terms',
        'nav_join_waitlist' => 'Join Waitlist',
        
        // Hero Section
        'hero_title' => 'Learn Languages Through AI-Generated Stories',
        'hero_description' => 'Revolutionary language learning that adapts to you. Create personalized stories with your target vocabulary, choose from famous author styles, and learn through immersive storytelling.',
        'hero_join_waitlist' => 'Join Waitlist',
        'hero_see_features' => 'See Features',
        
        // Features Section
        'features_title' => 'Powerful Features for Effective Learning',
        'features_subtitle' => 'Everything you need to master new languages through engaging, personalized content',
        
        'feature_stories_title' => 'AI-Generated Stories',
        'feature_stories_desc' => 'Create unlimited personalized stories in your target language, perfectly tailored to your vocabulary goals and skill level.',
        
        'feature_vocabulary_title' => 'Professional Word Packages',
        'feature_vocabulary_desc' => 'Choose from specialized vocabulary sets for medicine, law, business, technology, and more. Your chosen words are naturally woven into engaging stories.',
        
        'feature_translation_title' => 'Instant Translation',
        'feature_translation_desc' => 'Tap any word for instant translation, double-tap sentences for full translation. Context-aware translations ensure accuracy.',
        
        'feature_audio_title' => 'AI-Generated Audiobooks',
        'feature_audio_desc' => 'Listen to your stories with high-quality AI voices. Multiple voice options including native speakers in various languages and accents.',
        
        'feature_authors_title' => 'Famous Author Styles',
        'feature_authors_desc' => 'Learn through the writing styles of literary masters like Hemingway, Orwell, Terry Pratchett, and more. Each brings their unique voice to your learning.',
        
        'feature_personalized_title' => 'Personalized Learning',
        'feature_personalized_desc' => 'Choose your language, difficulty level from A1 to "Divine", themes, and target vocabulary. Every story is unique and tailored to your learning goals.',
        
        // Unique Features
        'unique_title' => 'What Makes Us Different',
        'unique_subtitle' => 'Features you won\'t find anywhere else in language learning',
        
        'unique_divine_title' => '"Divine" Difficulty Level',
        'unique_divine_desc' => 'Beyond traditional levels - master archaic forms, complex metaphysical concepts, and literary devices that challenge even native speakers.',
        
        'unique_authors_title' => 'Famous Author Styles',
        'unique_authors_desc' => 'Learn through the lens of literary masters like Hemingway, Orwell, Terry Pratchett, and more. Each brings their unique voice to your learning.',
        
        'unique_professional_title' => 'Professional Word Packages',
        'unique_professional_desc' => 'Specialized vocabulary sets for medicine, law, business, technology, and more. Perfect for career-focused language learning.',
        
        'unique_ai_title' => 'Context-Aware AI',
        'unique_ai_desc' => 'Our AI understands word position and context, providing more accurate translations and definitions than traditional apps.',
        
        // Languages
        'languages_title' => '12 Languages Supported',
        'languages_subtitle' => 'From beginner to native-level proficiency across major world languages',
        
        // Coming Soon
        'coming_soon_title' => 'Coming Soon!',
        'coming_soon_desc' => 'Swipe and Learn is currently in development. Join our waitlist to be the first to know when we launch.',
        'waitlist_form_title' => 'Join the Waitlist',
        'waitlist_form_desc' => 'Be among the first to experience revolutionary AI-powered language learning',
        'waitlist_email_label' => 'Email Address',
        'waitlist_email_placeholder' => 'your@email.com',
        'waitlist_name_label' => 'Name (Optional)',
        'waitlist_name_placeholder' => 'Your name',
        'waitlist_language_label' => 'Preferred Language to Learn',
        'waitlist_language_placeholder' => 'e.g. Spanish, French, German...',
        'waitlist_submit' => 'Join Waitlist',
        
        // FAQ
        'faq_title' => 'Frequently Asked Questions',
        'faq_subtitle' => 'Everything you need to know about Swipe and Learn',
        
        'faq_when_q' => 'When will Swipe and Learn be available?',
        'faq_when_a' => 'We\'re currently in active development and plan to launch in 2024. Join our waitlist to be the first to know when we\'re ready for beta testing and the official launch.',
        
        'faq_ai_q' => 'How does the AI story generation work?',
        'faq_ai_a' => 'Our AI uses advanced language models (GPT-4 and Grok) to create personalized stories based on your chosen difficulty level, target vocabulary, and preferred author style. The AI carefully weaves your target words into engaging narratives that feel natural and contextually appropriate.',
        
        'faq_divine_q' => 'What makes the "Divine" difficulty level special?',
        'faq_divine_a' => 'The Divine level goes beyond traditional language learning. It features archaic forms, complex metaphysical concepts, and intricate literary devices that challenge even educated native speakers. It\'s perfect for those who want to master the deepest nuances of a language.',
        
        'faq_free_q' => 'Will there be a free version?',
        'faq_free_a' => 'Yes! We plan to offer a freemium model with a coin system. You\'ll get free coins to start, and basic features will be available for free. Premium features like cover image generation, advanced voices, and unlimited story creation will require coins, which can be earned or purchased.',
        
        'faq_authors_q' => 'What author styles will be available?',
        'faq_authors_a' => 'You\'ll be able to choose from various famous author styles including Ernest Hemingway (concise, powerful), Terry Pratchett (witty, satirical), Douglas Adams (absurdist humor), George Orwell (clear, political), Joan Didion (elegant, psychological), and many more. Each style brings unique linguistic patterns to your learning.',
        
        'faq_professional_q' => 'Can I learn professional vocabulary?',
        'faq_professional_a' => 'Absolutely! We\'ll offer specialized word packages for various fields including medicine, law, business, technology, engineering, psychology, and more. These packages contain industry-specific vocabulary that gets naturally integrated into your stories.',
        
        'faq_platforms_q' => 'Which platforms will be supported?',
        'faq_platforms_a' => 'Swipe and Learn will be available on both iOS and Android devices. We\'re building with React Native to ensure a consistent, high-quality experience across both platforms.',
        
        'faq_updates_q' => 'How can I stay updated on the development?',
        'faq_updates_a' => 'Join our waitlist to receive email updates about our progress, beta testing opportunities, and launch announcement. You can also follow the development on our GitHub repository and visit the developer\'s portfolio for updates.',
        
        // Footer
        'footer_description' => 'Revolutionary AI-powered language learning through personalized storytelling. Master new languages with engaging, contextual content tailored to your goals.',
        'footer_developer' => 'Full-Stack Developer & Creator',
        'footer_portfolio' => 'Visit Portfolio →',
        'footer_features' => 'Features',
        'footer_support' => 'Support',
        'footer_connect' => 'Connect',
        'footer_copyright' => '2024 Swipe and Learn. Created by',
        'footer_rights' => 'All rights reserved.',
        
        // Footer Links
        'footer_ai_stories' => 'AI Story Generation',
        'footer_translation' => 'Instant Translation',
        'footer_audiobooks' => 'Audio Books',
        'footer_dictionary' => 'Dictionary Integration',
        'footer_author_styles' => 'Author Styles',
        'footer_professional_vocab' => 'Professional Vocabulary',
        'footer_contact_support' => 'Contact Support',
        'footer_privacy_policy' => 'Privacy Policy',
        'footer_terms_service' => 'Terms of Service',
        'footer_github' => 'GitHub',
        'footer_developer_portfolio' => 'Developer Portfolio',
        'footer_email_developer' => 'Email Developer',
    ],
    'pl' => [
        'title' => 'Swipe and Learn - Nauka Języków z AI przez Opowiadania',
        'description' => 'Ucz się języków przez personalizowane opowiadania generowane przez AI. Wybieraj spośród 12 języków, wielu poziomów trudności i stylów słynnych autorów. Już wkrótce!',
        'keywords' => 'nauka języków, opowiadania AI, budowanie słownictwa, aplikacja do tłumaczeń, edukacja językowa, już wkrótce',
        'og_title' => 'Swipe and Learn - Nauka Języków z AI',
        'og_description' => 'Rewolucyjna nauka języków przez personalizowane opowiadania generowane przez AI - Już wkrótce!',
        'twitter_title' => 'Swipe and Learn - Nauka Języków z AI',
        'twitter_description' => 'Rewolucyjna nauka języków przez personalizowane opowiadania generowane przez AI - Już wkrótce!',
        
        // Navigation
        'nav_features' => 'Funkcje',
        'nav_languages' => 'Języki',
        'nav_coming_soon' => 'Już Wkrótce',
        'nav_faq' => 'FAQ',
        'nav_privacy' => 'Prywatność',
        'nav_terms' => 'Regulamin',
        'nav_join_waitlist' => 'Dołącz do Listy',
        
        // Hero Section
        'hero_title' => 'Ucz się Języków przez Opowiadania Generowane przez AI',
        'hero_description' => 'Rewolucyjna nauka języków, która dostosowuje się do Ciebie. Twórz personalizowane opowiadania z docelowym słownictwem, wybieraj style słynnych autorów i ucz się przez immersyjne narracje.',
        'hero_join_waitlist' => 'Dołącz do Listy',
        'hero_see_features' => 'Zobacz Funkcje',
        
        // Features Section
        'features_title' => 'Potężne Funkcje dla Skutecznej Nauki',
        'features_subtitle' => 'Wszystko czego potrzebujesz do opanowania nowych języków przez angażujące, personalizowane treści',
        
        'feature_stories_title' => 'Opowiadania Generowane przez AI',
        'feature_stories_desc' => 'Twórz nieograniczoną liczbę personalizowanych opowiadań w docelowym języku, idealnie dopasowanych do Twoich celów słownikowych i poziomu umiejętności.',
        
        'feature_vocabulary_title' => 'Profesjonalne Pakiety Słów',
        'feature_vocabulary_desc' => 'Wybieraj ze specjalistycznych zestawów słownictwa dla medycyny, prawa, biznesu, technologii i więcej. Twoje wybrane słowa są naturalnie wplecione w angażujące opowiadania.',
        
        'feature_translation_title' => 'Natychmiastowe Tłumaczenie',
        'feature_translation_desc' => 'Dotknij dowolnego słowa dla natychmiastowego tłumaczenia, podwójnie dotknij zdania dla pełnego tłumaczenia. Kontekstowe tłumaczenia zapewniają dokładność.',
        
        'feature_audio_title' => 'Audiobooki Generowane przez AI',
        'feature_audio_desc' => 'Słuchaj swoich opowiadań z wysokiej jakości głosami AI. Wiele opcji głosowych, w tym rodzimi mówcy w różnych językach i akcentach.',
        
        'feature_authors_title' => 'Style Słynnych Autorów',
        'feature_authors_desc' => 'Ucz się przez style pisarskie mistrzów literatury jak Hemingway, Orwell, Terry Pratchett i wielu innych. Każdy wnosi swój unikalny głos do Twojej nauki.',
        
        'feature_personalized_title' => 'Personalizowana Nauka',
        'feature_personalized_desc' => 'Wybierz język, poziom trudności od A1 do "Boskiego", tematy i docelowe słownictwo. Każde opowiadanie jest unikalne i dostosowane do Twoich celów nauki.',
        
        // Unique Features
        'unique_title' => 'Co Nas Wyróżnia',
        'unique_subtitle' => 'Funkcje, których nie znajdziesz nigdzie indziej w nauce języków',
        
        'unique_divine_title' => 'Poziom Trudności "Boski"',
        'unique_divine_desc' => 'Poza tradycyjnymi poziomami - opanuj archaiczne formy, złożone koncepcje metafizyczne i środki stylistyczne, które stanowią wyzwanie nawet dla rodzimych mówców.',
        
        'unique_authors_title' => 'Style Słynnych Autorów',
        'unique_authors_desc' => 'Ucz się przez pryzmat mistrzów literatury jak Hemingway, Orwell, Terry Pratchett i wielu innych. Każdy wnosi swój unikalny głos do Twojej nauki.',
        
        'unique_professional_title' => 'Profesjonalne Pakiety Słów',
        'unique_professional_desc' => 'Specjalistyczne zestawy słownictwa dla medycyny, prawa, biznesu, technologii i więcej. Idealne dla nauki języka ukierunkowanej na karierę.',
        
        'unique_ai_title' => 'AI Świadome Kontekstu',
        'unique_ai_desc' => 'Nasze AI rozumie pozycję słów i kontekst, zapewniając dokładniejsze tłumaczenia i definicje niż tradycyjne aplikacje.',
        
        // Languages
        'languages_title' => '12 Obsługiwanych Języków',
        'languages_subtitle' => 'Od poziomu początkującego do biegłości na poziomie rodzimego mówcy w głównych językach świata',
        
        // Coming Soon
        'coming_soon_title' => 'Już Wkrótce!',
        'coming_soon_desc' => 'Swipe and Learn jest obecnie w fazie rozwoju. Dołącz do naszej listy oczekujących, aby być pierwszym, który dowie się o naszym uruchomieniu.',
        'waitlist_form_title' => 'Dołącz do Listy Oczekujących',
        'waitlist_form_desc' => 'Bądź wśród pierwszych, którzy doświadczą rewolucyjnej nauki języków z AI',
        'waitlist_email_label' => 'Adres Email',
        'waitlist_email_placeholder' => 'twoj@email.com',
        'waitlist_name_label' => 'Imię (Opcjonalne)',
        'waitlist_name_placeholder' => 'Twoje imię',
        'waitlist_language_label' => 'Preferowany Język do Nauki',
        'waitlist_language_placeholder' => 'np. Hiszpański, Francuski, Niemiecki...',
        'waitlist_submit' => 'Dołącz do Listy',
        
        // FAQ
        'faq_title' => 'Często Zadawane Pytania',
        'faq_subtitle' => 'Wszystko co musisz wiedzieć o Swipe and Learn',
        
        'faq_when_q' => 'Kiedy Swipe and Learn będzie dostępne?',
        'faq_when_a' => 'Obecnie jesteśmy w aktywnej fazie rozwoju i planujemy uruchomienie w 2024 roku. Dołącz do naszej listy oczekujących, aby być pierwszym, który dowie się o gotowości do testów beta i oficjalnego uruchomienia.',
        
        'faq_ai_q' => 'Jak działa generowanie opowiadań przez AI?',
        'faq_ai_a' => 'Nasze AI używa zaawansowanych modeli językowych (GPT-4 i Grok) do tworzenia personalizowanych opowiadań na podstawie wybranego poziomu trudności, docelowego słownictwa i preferowanego stylu autora. AI starannie wplata Twoje docelowe słowa w angażujące narracje, które wydają się naturalne i kontekstowo odpowiednie.',
        
        'faq_divine_q' => 'Co czyni poziom trudności "Boski" wyjątkowym?',
        'faq_divine_a' => 'Poziom Boski wykracza poza tradycyjną naukę języków. Zawiera archaiczne formy, złożone koncepcje metafizyczne i skomplikowane środki stylistyczne, które stanowią wyzwanie nawet dla wykształconych rodzimych mówców. Jest idealny dla tych, którzy chcą opanować najgłębsze niuanse języka.',
        
        'faq_free_q' => 'Czy będzie darmowa wersja?',
        'faq_free_a' => 'Tak! Planujemy oferować model freemium z systemem monet. Otrzymasz darmowe monety na start, a podstawowe funkcje będą dostępne za darmo. Funkcje premium jak generowanie okładek, zaawansowane głosy i nieograniczone tworzenie opowiadań będą wymagać monet, które można zdobyć lub kupić.',
        
        'faq_authors_q' => 'Jakie style autorów będą dostępne?',
        'faq_authors_a' => 'Będziesz mógł wybierać z różnych stylów słynnych autorów, włączając Ernesta Hemingwaya (zwięzły, mocny), Terry\'ego Pratchetta (dowcipny, satyryczny), Douglasa Adamsa (absurdalny humor), George\'a Orwella (jasny, polityczny), Joan Didion (elegancki, psychologiczny) i wielu innych. Każdy styl wnosi unikalne wzorce językowe do Twojej nauki.',
        
        'faq_professional_q' => 'Czy mogę uczyć się profesjonalnego słownictwa?',
        'faq_professional_a' => 'Absolutnie! Będziemy oferować specjalistyczne pakiety słów dla różnych dziedzin, włączając medycynę, prawo, biznes, technologię, inżynierię, psychologię i więcej. Te pakiety zawierają słownictwo specyficzne dla branży, które naturalnie integruje się z Twoimi opowiadaniami.',
        
        'faq_platforms_q' => 'Które platformy będą obsługiwane?',
        'faq_platforms_a' => 'Swipe and Learn będzie dostępne na urządzeniach iOS i Android. Budujemy z React Native, aby zapewnić spójne, wysokiej jakości doświadczenie na obu platformach.',
        
        'faq_updates_q' => 'Jak mogę być na bieżąco z rozwojem?',
        'faq_updates_a' => 'Dołącz do naszej listy oczekujących, aby otrzymywać emailowe aktualizacje o naszym postępie, możliwościach testów beta i ogłoszeniu uruchomienia. Możesz też śledzić rozwój w naszym repozytorium GitHub i odwiedzać portfolio developera dla aktualizacji.',
        
        // Footer
        'footer_description' => 'Rewolucyjna nauka języków z AI przez personalizowane narracje. Opanuj nowe języki z angażującymi, kontekstowymi treściami dostosowanymi do Twoich celów.',
        'footer_developer' => 'Full-Stack Developer i Twórca',
        'footer_portfolio' => 'Odwiedź Portfolio →',
        'footer_features' => 'Funkcje',
        'footer_support' => 'Wsparcie',
        'footer_connect' => 'Kontakt',
        'footer_copyright' => '2024 Swipe and Learn. Stworzone przez',
        'footer_rights' => 'Wszystkie prawa zastrzeżone.',
        
        // Footer Links
        'footer_ai_stories' => 'Generowanie Opowiadań AI',
        'footer_translation' => 'Natychmiastowe Tłumaczenie',
        'footer_audiobooks' => 'Audiobooki',
        'footer_dictionary' => 'Integracja ze Słownikiem',
        'footer_author_styles' => 'Style Autorów',
        'footer_professional_vocab' => 'Profesjonalne Słownictwo',
        'footer_contact_support' => 'Kontakt z Wsparciem',
        'footer_privacy_policy' => 'Polityka Prywatności',
        'footer_terms_service' => 'Regulamin',
        'footer_github' => 'GitHub',
        'footer_developer_portfolio' => 'Portfolio Developera',
        'footer_email_developer' => 'Email do Developera',
    ]
];

$t = $translations[$lang];
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $t['title']; ?></title>
    <meta name="description" content="<?php echo $t['description']; ?>">
    <meta name="keywords" content="<?php echo $t['keywords']; ?>">
    
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    <link rel="apple-touch-icon" href="assets/images/icon.png">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary-color: #FF6F1A;
            --secondary-color: #1A1A1A;
            --accent-color: #4A90E2;
            --text-dark: #2C2C2C;
            --text-light: #666666;
            --background-light: #FAFAFA;
            --card-background: #FFFFFF;
            --border-color: #E5E5E5;
            --gradient-primary: linear-gradient(135deg, #FF6F1A 0%, #FF8A47 100%);
            --gradient-secondary: linear-gradient(135deg, #4A90E2 0%, #5BA3F5 100%);
            --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.15);
            --shadow-heavy: 0 8px 30px rgba(0, 0, 0, 0.2);
            --success-color: #28a745;
            --error-color: #dc3545;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .language-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: white;
            border-radius: 25px;
            box-shadow: var(--shadow-light);
            padding: 8px;
            display: flex;
            gap: 4px;
        }

        .language-switcher a {
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .language-switcher a.active {
            background: var(--primary-color);
            color: white;
        }

        .language-switcher a:not(.active) {
            color: var(--text-light);
        }

        .language-switcher a:not(.active):hover {
            background: var(--background-light);
            color: var(--primary-color);
        }

        /* Header - Increased height */
        header {
            background: var(--card-background);
            box-shadow: var(--shadow-light);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0; /* Increased from 1rem */
            min-height: 80px; /* Added minimum height */
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
        }

        .logo img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--text-dark);
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--primary-color);
        }

        .download-btn {
            background: var(--gradient-primary);
            color: white;
            padding: 16px 28px; /* Increased padding */
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-medium);
        }

        .mobile-menu-toggle {
            display: none;
            font-size: 1.5rem;
            color: var(--text-dark);
            cursor: pointer;
        }

        .mobile-menu {
            display: none;
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            box-shadow: var(--shadow-medium);
            z-index: 999;
            padding: 1rem 0;
        }

        .mobile-menu.active {
            display: block;
        }

        .mobile-menu .mobile-nav-links {
            display: flex;
            flex-direction: column;
            padding: 0 20px;
        }

        .mobile-menu .mobile-nav-links a {
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
            text-decoration: none;
            color: var(--text-dark);
            font-weight: 500;
        }

        .mobile-menu .mobile-nav-links a:last-child {
            border-bottom: none;
        }

        .mobile-language-switcher {
            display: flex;
            gap: 1rem;
            padding: 1rem 20px;
            border-top: 2px solid var(--primary-color);
            margin-top: 1rem;
        }

        .mobile-language-switcher a {
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
        }

        .mobile-language-switcher a.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .mobile-language-switcher a:not(.active) {
            color: var(--text-light);
        }

        .mobile-language-switcher a:not(.active):hover {
            background: var(--background-light);
            color: var(--primary-color);
        }

        /* Hero Section */
        .hero {
            background: var(--gradient-primary);
            color: white;
            padding: 140px 0 80px; /* Increased top padding for taller header */
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.1;
        }

        .hero-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            position: relative;
            z-index: 1;
        }

        .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }

        .hero-text p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            line-height: 1.6;
        }

        .hero-cta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn-primary {
            background: white;
            color: var(--primary-color);
            padding: 16px 32px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-heavy);
        }

        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
            padding: 14px 30px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: white;
            color: var(--primary-color);
        }

        .hero-image {
            text-align: center;
            position: relative;
        }

        .hero-image img {
            max-width: 100%;
            height: auto;
            max-height: 50rem;
            filter: drop-shadow(0 8px 30px rgba(0, 0, 0, 0.2));
            transform: perspective(1000px) rotateY(-5deg);
            transition: transform 0.3s ease;
        }

        .hero-image img:hover {
            transform: perspective(1000px) rotateY(0deg);
        }

        /* Features Section */
        .features {
            padding: 100px 0;
            background: var(--card-background); /* Changed to white background */
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-dark);
        }

        .section-header p {
            font-size: 1.2rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: var(--background-light); /* Light background for cards */
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: var(--shadow-light);
            transition: all 0.3s ease;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-medium);
        }

        .feature-screenshot {
            width: 200px;
            height: auto;
            margin: 0 auto 1.5rem;
            border-radius: 15px;
            overflow: hidden;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            /* make sure to show the shadow */
            overflow: visible;
        }

        .feature-screenshot img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.20));
        }

        .feature-icon {
            width: 80px;
            height: 80px;
            background: var(--gradient-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: white;
        }

        .feature-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-dark);
        }

        .feature-card p {
            color: var(--text-light);
            line-height: 1.6;
        }

        /* Unique Features Section */
        .unique-features {
            padding: 100px 0;
            background: var(--background-light);
        }

        .unique-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 3rem;
            margin-top: 3rem;
            justify-content: center;
        }

        .unique-card {
            flex: 0 0 300px;
        }

        .unique-card {
            text-align: center;
            padding: 2rem;
        }

        .unique-icon {
            width: 100px;
            height: 100px;
            background: var(--gradient-secondary);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: white;
        }

        .unique-card h3 {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-dark);
        }

        .unique-card p {
            color: var(--text-light);
            line-height: 1.6;
        }

        /* Languages Section */
        .languages {
            padding: 100px 0;
            background: var(--card-background);
        }

        .languages-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-top: 3rem;
            justify-content: center;
        }

        .language-card {
            flex: 0 0 200px;
            background: var(--background-light);
            padding: 1.5rem;
            border-radius: 15px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-light);
        }

        .language-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-medium);
        }

        .language-flag {
            width: 100px;
            height: 70px;
            margin: 0 auto 0.5rem;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .language-flag img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .language-name {
            font-weight: 600;
            color: var(--text-dark);
        }

        /* Coming Soon Section */
        .coming-soon {
            padding: 100px 0;
            background: var(--gradient-secondary);
            color: white;
            text-align: center;
        }

        .coming-soon h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .coming-soon p {
            font-size: 1.2rem;
            margin-bottom: 3rem;
            opacity: 0.9;
        }

        .waiting-list-form {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: var(--shadow-heavy);
        }

        .waiting-list-form h3 {
            color: var(--text-dark);
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .waiting-list-form p {
            color: var(--text-light);
            margin-bottom: 2rem;
            font-size: 1rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-dark);
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .form-submit {
            background: var(--gradient-secondary);
            color: white;
            padding: 14px 32px;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .form-submit:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-medium);
        }

        .form-submit:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .form-message {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            font-weight: 500;
        }

        .form-message.success {
            background: #d4edda;
            color: var(--success-color);
            border: 1px solid var(--success-color);
        }

        .form-message.error {
            background: #f8d7da;
            color: var(--error-color);
            border: 1px solid var(--error-color);
        }

        /* FAQ Section */
        .faq {
            padding: 100px 0;
            background: var(--background-light);
        }

        .faq-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .faq-item {
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            overflow: hidden;
        }

        .faq-question {
            background: var(--card-background);
            padding: 1.5rem;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.3s ease;
        }

        .faq-question:hover {
            background: #f0f0f0;
        }

        .faq-answer {
            padding: 0 1.5rem;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .faq-answer.active {
            padding: 1.5rem;
            max-height: 500px;
        }

        .faq-toggle {
            transition: transform 0.3s ease;
        }

        .faq-toggle.active {
            transform: rotate(180deg);
        }

        /* Footer */
        footer {
            background: var(--secondary-color);
            color: white;
            padding: 60px 0 20px;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 2rem;
        }

        .footer-section h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
        }

        .footer-section p,
        .footer-section a {
            color: #cccccc;
            text-decoration: none;
            line-height: 1.8;
            transition: color 0.3s ease;
        }

        .footer-section a:hover {
            color: var(--primary-color);
        }

        .footer-links {
            list-style: none;
        }

        .footer-links li {
            margin-bottom: 0.5rem;
        }

        .developer-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
        }

        .developer-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid var(--primary-color);
        }

        .developer-details h4 {
            color: white;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .developer-details p {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .footer-bottom {
            border-top: 1px solid #333;
            padding-top: 2rem;
            text-align: center;
            color: #999;
        }

        .footer-bottom a {
            color: var(--primary-color);
            text-decoration: none;
            transition: opacity 0.3s ease;
        }

        .footer-bottom a:hover {
            opacity: 0.8;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .language-switcher {
                display: none;
            }

            .nav-links {
                display: none;
            }

            .download-btn {
                display: none;
            }

            .hero-image img {
                height: 30rem;
            }

            .hero-image {
                height: 15rem;
            }

            .mobile-menu-toggle {
                display: block;
            }

            nav {
                padding: 1rem 0; /* Reduced padding on mobile */
                min-height: 60px;
            }

            .hero {
                padding: 100px 0 60px; /* Adjusted for mobile */
            }

            .hero-content {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 2rem;
            }

            .hero-text h1 {
                font-size: 2.5rem;
            }

            .hero-cta {
                justify-content: center;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .unique-grid {
                grid-template-columns: 1fr;
            }

            .language-card {
                flex: 0 0 150px;
            }

            .footer-content {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .developer-info {
                justify-content: center;
            }
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
        }

        /* Scroll animations */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }

        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <!-- Language Switcher -->
    <div class="language-switcher">
        <a href="?lang=en" class="<?php echo $lang === 'en' ? 'active' : ''; ?>">EN</a>
        <a href="?lang=pl" class="<?php echo $lang === 'pl' ? 'active' : ''; ?>">PL</a>
    </div>

    <!-- Header -->
    <header>
        <nav class="container">
            <a href="#" class="logo">
                <img src="assets/images/icon.png" alt="Swipe and Learn">
                Swipe and Learn
            </a>
            <ul class="nav-links">
                <li><a href="#features"><?php echo $t['nav_features']; ?></a></li>
                <li><a href="#languages"><?php echo $t['nav_languages']; ?></a></li>
                <li><a href="#coming-soon"><?php echo $t['nav_coming_soon']; ?></a></li>
                <li><a href="#faq"><?php echo $t['nav_faq']; ?></a></li>
                <li><a href="privacy.php?lang=<?php echo $lang; ?>"><?php echo $t['nav_privacy']; ?></a></li>
                <li><a href="terms.php?lang=<?php echo $lang; ?>"><?php echo $t['nav_terms']; ?></a></li>
            </ul>
            <a href="#coming-soon" class="download-btn"><?php echo $t['nav_join_waitlist']; ?></a>
            <i class="fas fa-bars mobile-menu-toggle" onclick="toggleMobileMenu()"></i>
        </nav>
    </header>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-nav-links">
            <a href="#features"><?php echo $t['nav_features']; ?></a>
            <a href="#languages"><?php echo $t['nav_languages']; ?></a>
            <a href="#coming-soon"><?php echo $t['nav_coming_soon']; ?></a>
            <a href="#faq"><?php echo $t['nav_faq']; ?></a>
            <a href="privacy.php?lang=<?php echo $lang; ?>"><?php echo $t['nav_privacy']; ?></a>
            <a href="terms.php?lang=<?php echo $lang; ?>"><?php echo $t['nav_terms']; ?></a>
            <a href="#coming-soon"><?php echo $t['nav_join_waitlist']; ?></a>
        </div>
        <div class="mobile-language-switcher">
            <a href="?lang=en" class="<?php echo $lang === 'en' ? 'active' : ''; ?>">EN</a>
            <a href="?lang=pl" class="<?php echo $lang === 'pl' ? 'active' : ''; ?>">PL</a>
        </div>
    </div>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1><?php echo $t['hero_title']; ?></h1>
                    <p><?php echo $t['hero_description']; ?></p>
                    <div class="hero-cta">
                        <a href="#coming-soon" class="btn-primary">
                            <i class="fas fa-bell"></i>
                            <?php echo $t['hero_join_waitlist']; ?>
                        </a>
                        <a href="#features" class="btn-secondary"><?php echo $t['hero_see_features']; ?></a>
                    </div>
                </div>
                <div class="hero-image">
                    <img src="assets/images/screenshot-library.png" alt="Swipe and Learn App Screenshot" />
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="container">
            <div class="section-header animate-on-scroll">
                <h2><?php echo $t['features_title']; ?></h2>
                <p><?php echo $t['features_subtitle']; ?></p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-library.png" alt="AI-Generated Stories Library" />
                    </div>
                    <h3><?php echo $t['feature_stories_title']; ?></h3>
                    <p><?php echo $t['feature_stories_desc']; ?></p>
                </div>

                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-vocabulary.png" alt="Target Vocabulary Selection" />
                    </div>
                    <h3><?php echo $t['feature_vocabulary_title']; ?></h3>
                    <p><?php echo $t['feature_vocabulary_desc']; ?></p>
                </div>

                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-translation.png" alt="Instant Translation Feature" />
                    </div>
                    <h3><?php echo $t['feature_translation_title']; ?></h3>
                    <p><?php echo $t['feature_translation_desc']; ?></p>
                </div>

                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-voices.png" alt="AI Voice Selection" />
                    </div>
                    <h3><?php echo $t['feature_audio_title']; ?></h3>
                    <p><?php echo $t['feature_audio_desc']; ?></p>
                </div>

                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-authors.png" alt="Author Style Selection" />
                    </div>
                    <h3><?php echo $t['feature_authors_title']; ?></h3>
                    <p><?php echo $t['feature_authors_desc']; ?></p>
                </div>

                <div class="feature-card animate-on-scroll">
                    <div class="feature-screenshot">
                        <img src="assets/images/screenshot-create.png" alt="Story Creation Interface" />
                    </div>
                    <h3><?php echo $t['feature_personalized_title']; ?></h3>
                    <p><?php echo $t['feature_personalized_desc']; ?></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Unique Features Section -->
    <section class="unique-features" id="unique">
        <div class="container">
            <div class="section-header animate-on-scroll">
                <h2><?php echo $t['unique_title']; ?></h2>
                <p><?php echo $t['unique_subtitle']; ?></p>
            </div>
            
            <div class="unique-grid">
                <div class="unique-card animate-on-scroll">
                    <div class="unique-icon">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3><?php echo $t['unique_divine_title']; ?></h3>
                    <p><?php echo $t['unique_divine_desc']; ?></p>
                </div>

                <div class="unique-card animate-on-scroll">
                    <div class="unique-icon">
                        <i class="fas fa-feather-alt"></i>
                    </div>
                    <h3><?php echo $t['unique_authors_title']; ?></h3>
                    <p><?php echo $t['unique_authors_desc']; ?></p>
                </div>

                <div class="unique-card animate-on-scroll">
                    <div class="unique-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <h3><?php echo $t['unique_professional_title']; ?></h3>
                    <p><?php echo $t['unique_professional_desc']; ?></p>
                </div>

                <div class="unique-card animate-on-scroll">
                    <div class="unique-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3><?php echo $t['unique_ai_title']; ?></h3>
                    <p><?php echo $t['unique_ai_desc']; ?></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Languages Section -->
    <section class="languages" id="languages">
        <div class="container">
            <div class="section-header animate-on-scroll">
                <h2><?php echo $t['languages_title']; ?></h2>
                <p><?php echo $t['languages_subtitle']; ?></p>
            </div>
            
            <div class="languages-grid">
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/gb.svg" alt="English Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Angielski' : 'English'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/es.svg" alt="Spanish Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Hiszpański' : 'Spanish'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/fr.svg" alt="French Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Francuski' : 'French'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/de.svg" alt="German Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Niemiecki' : 'German'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/it.svg" alt="Italian Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Włoski' : 'Italian'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/pt.svg" alt="Portuguese Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Portugalski' : 'Portuguese'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/cn.svg" alt="Chinese Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Chiński' : 'Chinese'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/jp.svg" alt="Japanese Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Japoński' : 'Japanese'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/kr.svg" alt="Korean Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Koreański' : 'Korean'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/ru.svg" alt="Russian Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Rosyjski' : 'Russian'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/sa.svg" alt="Arabic Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Arabski' : 'Arabic'; ?></div>
                </div>
                <div class="language-card animate-on-scroll">
                    <div class="language-flag">
                        <img src="assets/images/flags/pl.svg" alt="Polish Flag">
                    </div>
                    <div class="language-name"><?php echo $lang === 'pl' ? 'Polski' : 'Polish'; ?></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Coming Soon Section -->
    <section class="coming-soon" id="coming-soon">
        <div class="container">
            <h2><?php echo $t['coming_soon_title']; ?></h2>
            <p><?php echo $t['coming_soon_desc']; ?></p>
            
            <div class="waiting-list-form">
                <h3><?php echo $t['waitlist_form_title']; ?></h3>
                <p><?php echo $t['waitlist_form_desc']; ?></p>
                
                <form id="waitlistForm">
                    <div class="form-group">
                        <label for="email"><?php echo $t['waitlist_email_label']; ?></label>
                        <input type="email" id="email" name="email" required placeholder="<?php echo $t['waitlist_email_placeholder']; ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="name"><?php echo $t['waitlist_name_label']; ?></label>
                        <input type="text" id="name" name="name" placeholder="<?php echo $t['waitlist_name_placeholder']; ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="language"><?php echo $t['waitlist_language_label']; ?></label>
                        <input type="text" id="language" name="language" placeholder="<?php echo $t['waitlist_language_placeholder']; ?>">
                    </div>
                    
                    <button type="submit" class="form-submit" id="submitBtn">
                        <?php echo $t['waitlist_submit']; ?>
                    </button>
                </form>
                
                <div id="formMessage" class="form-message" style="display: none;"></div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq" id="faq">
        <div class="container">
            <div class="section-header animate-on-scroll">
                <h2><?php echo $t['faq_title']; ?></h2>
                <p><?php echo $t['faq_subtitle']; ?></p>
            </div>
            
            <div class="faq-container">
                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_when_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_when_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_ai_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_ai_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_divine_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_divine_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_free_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_free_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_authors_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_authors_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_professional_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_professional_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_platforms_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_platforms_a']; ?></p>
                    </div>
                </div>

                <div class="faq-item animate-on-scroll">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span><?php echo $t['faq_updates_q']; ?></span>
                        <i class="fas fa-chevron-down faq-toggle"></i>
                    </div>
                    <div class="faq-answer">
                        <p><?php echo $t['faq_updates_a']; ?></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Swipe and Learn</h3>
                    <p><?php echo $t['footer_description']; ?></p>
                    <div class="developer-info">
                        <img src="assets/images/profile.gif" alt="Karol Krakowski" class="developer-avatar">
                        <div class="developer-details">
                            <h4>Karol Krakowski</h4>
                            <p><?php echo $t['footer_developer']; ?></p>
                            <a href="https://karolkrakowski.pl" target="_blank"><?php echo $t['footer_portfolio']; ?></a>
                        </div>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h3><?php echo $t['footer_features']; ?></h3>
                    <ul class="footer-links">
                        <li><a href="#features"><?php echo $t['footer_ai_stories']; ?></a></li>
                        <li><a href="#features"><?php echo $t['footer_translation']; ?></a></li>
                        <li><a href="#features"><?php echo $t['footer_audiobooks']; ?></a></li>
                        <li><a href="#features"><?php echo $t['footer_dictionary']; ?></a></li>
                        <li><a href="#unique"><?php echo $t['footer_author_styles']; ?></a></li>
                        <li><a href="#unique"><?php echo $t['footer_professional_vocab']; ?></a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3><?php echo $t['footer_support']; ?></h3>
                    <ul class="footer-links">
                        <li><a href="#faq"><?php echo $t['nav_faq']; ?></a></li>
                        <li><a href="mailto:karol@karolkrakowski.pl"><?php echo $t['footer_contact_support']; ?></a></li>
                        <li><a href="privacy.php?lang=<?php echo $lang; ?>"><?php echo $t['footer_privacy_policy']; ?></a></li>
                        <li><a href="terms.php?lang=<?php echo $lang; ?>"><?php echo $t['footer_terms_service']; ?></a></li>
                        <li><a href="#coming-soon"><?php echo $t['nav_join_waitlist']; ?></a></li>
                        <li><a href="influencer-login.php">Influencer Dashboard</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3><?php echo $t['footer_connect']; ?></h3>
                    <ul class="footer-links">
                        <li><a href="https://karolkrakowski.pl" target="_blank"><?php echo $t['footer_developer_portfolio']; ?></a></li>
                        <li><a href="mailto:karol@karolkrakowski.pl"><?php echo $t['footer_email_developer']; ?></a></li>
                        <li><a href="#coming-soon"><?php echo $t['nav_join_waitlist']; ?></a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; <?php echo $t['footer_copyright']; ?> <a href="https://karolkrakowski.pl" target="_blank">Karol Krakowski</a>. <?php echo $t['footer_rights']; ?></p>
            </div>
        </div>
    </footer>

    <script>
        // FAQ Toggle
        function toggleFaq(element) {
            const answer = element.nextElementSibling;
            const toggle = element.querySelector('.faq-toggle');
            
            answer.classList.toggle('active');
            toggle.classList.toggle('active');
        }

        // Mobile Menu Toggle
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('active');
        }

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll Animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = '#ffffff';
                header.style.backdropFilter = 'none';
            }
        });

        // Waitlist Form Handler
        document.getElementById('waitlistForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const formMessage = document.getElementById('formMessage');
            const email = document.getElementById('email').value;
            const name = document.getElementById('name').value;
            const language = document.getElementById('language').value;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = '<?php echo $lang === 'pl' ? 'Dołączanie...' : 'Joining...'; ?>';
            formMessage.style.display = 'none';
            
            try {
                // Send to waitlist API endpoint
                const response = await fetch('api/waitlist.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        name: name,
                        language: language
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show success message
                    formMessage.className = 'form-message success';
                    formMessage.textContent = data.message;
                    formMessage.style.display = 'block';
                    
                    // Reset form
                    this.reset();
                    
                    // Optional: Track successful submission
                    console.log('Waitlist submission successful');
                    
                } else {
                    // Show error message from server
                    formMessage.className = 'form-message error';
                    if (response.status === 409) {
                        formMessage.textContent = '<?php echo $lang === 'pl' ? 'Ten email jest już na naszej liście oczekujących!' : 'This email is already on our waitlist!'; ?>';
                    } else {
                        formMessage.textContent = data.error || '<?php echo $lang === 'pl' ? 'Przepraszamy, wystąpił błąd podczas dołączania do listy. Spróbuj ponownie.' : 'Sorry, there was an error joining the waitlist. Please try again.'; ?>';
                    }
                    formMessage.style.display = 'block';
                }
                
            } catch (error) {
                // Show network/general error message
                formMessage.className = 'form-message error';
                formMessage.textContent = '<?php echo $lang === 'pl' ? 'Przepraszamy, wystąpił błąd połączenia. Sprawdź internet i spróbuj ponownie.' : 'Sorry, there was a connection error. Please check your internet and try again.'; ?>';
                formMessage.style.display = 'block';
                console.error('Waitlist submission error:', error);
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = '<?php echo $t['waitlist_submit']; ?>';
            }
        });
    </script>
</body>
</html> 
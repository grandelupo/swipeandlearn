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
        'title' => 'Privacy Policy - Swipe and Learn',
        'description' => 'Privacy Policy for Swipe and Learn - AI-powered language learning app',
        'main_title' => 'Privacy Policy',
        'subtitle' => 'How we collect, use, and protect your information',
        'back_link' => '← Back to Home',
        'content' => '
            <p class="last-updated"><strong>Last Updated:</strong> January 2024</p>

            <h2>1. Introduction</h2>
            <p>Welcome to Swipe and Learn ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service").</p>
            <p>By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <ul>
                <li><strong>Account Information: Email address, username, and profile preferences</strong></li>
                <li><strong>Learning Data: Language preferences, difficulty levels, target vocabulary, and story themes</strong></li>
                <li><strong>Progress Data: Reading progress, completed stories, translation history, and learning statistics</strong></li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <ul>
                <li><strong>App Usage: Features used, time spent in app, and interaction patterns</strong></li>
                <li><strong>Device Information: Device type, operating system, app version, and unique device identifiers</strong></li>
                <li><strong>Performance Data: Crash reports and app performance metrics (anonymized)</strong></li>
            </ul>

            <h3>2.3 Content Data</h3>
            <ul>
                <li><strong>Generated Content: AI-generated stories, translations, and audio files you create</strong></li>
                <li><strong>User Input: Custom vocabulary words, story themes, and feedback submissions</strong></li>
                <li><strong>Preferences: Author styles, voice selections, and language settings</strong></li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
                <li><strong>Service Provision: To provide and maintain our language learning service</strong></li>
                <li><strong>Personalization: To customize content and improve learning experiences</strong></li>
                <li><strong>AI Services: To generate personalized stories, translations, and audio content</strong></li>
                <li><strong>Progress Tracking: To track and display your learning progress</strong></li>
                <li><strong>Communication: To send important updates and respond to support requests</strong></li>
                <li><strong>Improvement: To analyze usage patterns and improve our Service</strong></li>
                <li><strong>Security: To detect and prevent fraud and abuse</strong></li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            
            <h3>4.1 Third-Party Services</h3>
            <p>We work with trusted third-party services to provide our features:</p>
            <ul>
                <li><strong>OpenAI: For AI story generation and translation services</strong></li>
                <li><strong>ElevenLabs: For AI voice generation and audio synthesis</strong></li>
                <li><strong>Supabase: For secure data storage and authentication</strong></li>
                <li><strong>RevenueCat: For in-app purchase processing</strong></li>
                <li><strong>Google Mobile Ads: For advertising services (if applicable)</strong></li>
            </ul>

            <h3>4.2 Data Processing</h3>
            <p>When you generate content through our app:</p>
            <ul>
                <li>Your vocabulary and theme inputs are sent to AI services to generate personalized stories</li>
                <li>Story text is processed for translation and audio generation</li>
                <li>All generated content is stored securely in your personal account</li>
                <li>We do not share your personal content with other users</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose your information if required by law or to:</p>
            <ul>
                <li>Comply with legal obligations or court orders</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate potential violations of our Terms of Service</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your information:</p>
            <ul>
                <li><strong>Encryption: Data transmission and storage are encrypted</strong></li>
                <li><strong>Access Control: Strict access controls limit who can view your data</strong></li>
                <li><strong>Regular Audits: We regularly review and update our security practices</strong></li>
                <li><strong>Secure Infrastructure: We use enterprise-grade cloud infrastructure</strong></li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>We retain your information for as long as necessary to provide our services:</p>
            <ul>
                <li><strong>Account Data: Retained while your account is active</strong></li>
                <li><strong>Learning Content: Stories and progress data retained for your continued use</strong></li>
                <li><strong>Analytics Data: Anonymized usage data may be retained longer for improvement purposes</strong></li>
                <li><strong>Legal Requirements: Some data may be retained longer if required by law</strong></li>
            </ul>

            <h2>7. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
                <li><strong>Access: Request a copy of your personal data</strong></li>
                <li><strong>Correction: Update or correct inaccurate information</strong></li>
                <li><strong>Deletion: Request deletion of your account and associated data</strong></li>
                <li><strong>Portability: Export your learning data in a structured format</strong></li>
                <li><strong>Opt-out: Unsubscribe from promotional communications</strong></li>
            </ul>

            <h2>8. Children\'s Privacy</h2>
            <p>Our Service is designed for users aged 13 and older. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will promptly delete such information.</p>

            <h2>9. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.</p>

            <h2>10. Updates to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
            <ul>
                <li>Posting the updated policy in the app</li>
                <li>Sending an email notification (if applicable)</li>
                <li>Providing in-app notifications of significant changes</li>
            </ul>

            <h2>11. Third-Party Links</h2>
            <p>Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.</p>

            <div class="contact-info">
                <h3>Contact Us</h3>
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <ul>
                    <li><strong>Email:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Developer:</strong> Karol Krakowski</li>
                    <li><strong>Website:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>We will respond to privacy-related inquiries within 30 days.</p>
            </div>
        '
    ],
    'pl' => [
        'title' => 'Polityka Prywatności - Swipe and Learn',
        'description' => 'Polityka Prywatności dla Swipe and Learn - aplikacji do nauki języków z AI',
        'main_title' => 'Polityka Prywatności',
        'subtitle' => 'Jak gromadzimy, używamy i chronimy Twoje informacje',
        'back_link' => '← Powrót do Strony Głównej',
        'content' => '
            <p class="last-updated"><strong>Ostatnia Aktualizacja:</strong> Styczeń 2024</p>

            <h2>1. Wprowadzenie</h2>
            <p>Witamy w Swipe and Learn ("my", "nas" lub "nasz"). Ta Polityka Prywatności wyjaśnia, jak gromadzimy, używamy, ujawniamy i chronimy Twoje informacje podczas korzystania z naszej aplikacji mobilnej i powiązanych usług (łącznie "Usługa").</p>
            <p>Korzystając z naszej Usługi, zgadzasz się na gromadzenie i wykorzystywanie informacji zgodnie z niniejszą Polityką Prywatności.</p>

            <h2>2. Informacje Które Gromadzimy</h2>
            
            <h3>2.1 Informacje Osobiste</h3>
            <ul>
                <li><strong>Informacje o Koncie: Adres e-mail, nazwa użytkownika i preferencje profilu</strong></li>
                <li><strong>Dane Nauki: Preferencje językowe, poziomy trudności, docelowe słownictwo i tematy opowiadań</strong></li>
                <li><strong>Dane Postępów: Postęp w czytaniu, ukończone opowiadania, historia tłumaczeń i statystyki nauki</strong></li>
            </ul>

            <h3>2.2 Informacje o Użytkowaniu</h3>
            <ul>
                <li><strong>Użytkowanie Aplikacji: Używane funkcje, czas spędzony w aplikacji i wzorce interakcji</strong></li>
                <li><strong>Informacje o Urządzeniu: Typ urządzenia, system operacyjny, wersja aplikacji i unikalne identyfikatory urządzenia</strong></li>
                <li><strong>Dane Wydajności: Raporty awarii i metryki wydajności aplikacji (zanonimizowane)</strong></li>
            </ul>

            <h3>2.3 Dane Treści</h3>
            <ul>
                <li><strong>Wygenerowane Treści: Opowiadania, tłumaczenia i pliki audio generowane przez AI, które tworzysz</strong></li>
                <li><strong>Dane Wejściowe Użytkownika: Niestandardowe słowa słownictwa, tematy opowiadań i przesłane opinie</strong></li>
                <li><strong>Preferencje: Style autorów, wybór głosów i ustawienia językowe</strong></li>
            </ul>

            <h2>3. Jak Używamy Twoich Informacji</h2>
            <p>Używamy zebranych informacji do następujących celów:</p>
            <ul>
                <li><strong>Świadczenie Usług: Aby zapewnić i utrzymać naszą usługę nauki języków</strong></li>
                <li><strong>Personalizacja: Aby dostosować treści i poprawić doświadczenia nauki</strong></li>
                <li><strong>Usługi AI: Aby generować personalizowane opowiadania, tłumaczenia i treści audio</strong></li>
                <li><strong>Śledzenie Postępów: Aby śledzić i wyświetlać Twój postęp w nauce</strong></li>
                <li><strong>Komunikacja: Aby wysyłać ważne aktualizacje i odpowiadać na prośby o wsparcie</strong></li>
                <li><strong>Ulepszanie: Aby analizować wzorce użytkowania i ulepszać naszą Usługę</strong></li>
                <li><strong>Bezpieczeństwo: Aby wykrywać i zapobiegać oszustwom i nadużyciom</strong></li>
            </ul>

            <h2>4. Udostępnianie i Ujawnianie Informacji</h2>
            
            <h3>4.1 Usługi Stron Trzecich</h3>
            <p>Współpracujemy z zaufanymi usługami stron trzecich, aby zapewnić nasze funkcje:</p>
            <ul>
                <li><strong>OpenAI: Do generowania opowiadań AI i usług tłumaczenia</strong></li>
                <li><strong>ElevenLabs: Do generowania głosu AI i syntezy audio</strong></li>
                <li><strong>Supabase: Do bezpiecznego przechowywania danych i uwierzytelniania</strong></li>
                <li><strong>RevenueCat: Do przetwarzania zakupów w aplikacji</strong></li>
                <li><strong>Google Mobile Ads: Do usług reklamowych (jeśli dotyczy)</strong></li>
            </ul>

            <h3>4.2 Przetwarzanie Danych</h3>
            <p>Kiedy generujesz treści przez naszą aplikację:</p>
            <ul>
                <li>Twoje słownictwo i dane tematyczne są wysyłane do usług AI w celu generowania personalizowanych opowiadań</li>
                <li>Tekst opowiadań jest przetwarzany do tłumaczenia i generowania audio</li>
                <li>Wszystkie wygenerowane treści są bezpiecznie przechowywane na Twoim osobistym koncie</li>
                <li>Nie udostępniamy Twoich osobistych treści innym użytkownikom</li>
            </ul>

            <h3>4.3 Wymogi Prawne</h3>
            <p>Możemy ujawnić Twoje informacje, jeśli wymaga tego prawo lub aby:</p>
            <ul>
                <li>Przestrzegać zobowiązań prawnych lub nakazów sądowych</li>
                <li>Chronić nasze prawa, własność lub bezpieczeństwo</li>
                <li>Badać potencjalne naruszenia naszego Regulaminu</li>
            </ul>

            <h2>5. Bezpieczeństwo Danych</h2>
            <p>Wdrażamy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich informacji:</p>
            <ul>
                <li><strong>Szyfrowanie: Transmisja i przechowywanie danych są szyfrowane</strong></li>
                <li><strong>Kontrola Dostępu: Ścisłe kontrole dostępu ograniczają, kto może przeglądać Twoje dane</strong></li>
                <li><strong>Regularne Audyty: Regularnie przeglądamy i aktualizujemy nasze praktyki bezpieczeństwa</strong></li>
                <li><strong>Bezpieczna Infrastruktura: Używamy infrastruktury chmurowej klasy przedsiębiorstwa</strong></li>
            </ul>

            <h2>6. Przechowywanie Danych</h2>
            <p>Przechowujemy Twoje informacje tak długo, jak to konieczne do świadczenia naszych usług:</p>
            <ul>
                <li><strong>Dane Konta: Przechowywane podczas gdy Twoje konto jest aktywne</strong></li>
                <li><strong>Treści Nauki: Opowiadania i dane postępów przechowywane dla Twojego dalszego użytku</strong></li>
                <li><strong>Dane Analityczne: Zanonimizowane dane użytkowania mogą być przechowywane dłużej w celach ulepszania</strong></li>
                <li><strong>Wymogi Prawne: Niektóre dane mogą być przechowywane dłużej, jeśli wymaga tego prawo</strong></li>
            </ul>

            <h2>7. Twoje Prawa i Wybory</h2>
            <p>Masz następujące prawa dotyczące Twoich danych osobowych:</p>
            <ul>
                <li><strong>Dostęp: Żądanie kopii Twoich danych osobowych</strong></li>
                <li><strong>Korekta: Aktualizacja lub korekta nieprawidłowych informacji</strong></li>
                <li><strong>Usunięcie: Żądanie usunięcia Twojego konta i powiązanych danych</strong></li>
                <li><strong>Przenośność: Eksport Twoich danych nauki w strukturalnym formacie</strong></li>
                <li><strong>Rezygnacja: Wypisanie się z komunikacji promocyjnej</strong></li>
            </ul>

            <h2>8. Prywatność Dzieci</h2>
            <p>Nasza Usługa jest przeznaczona dla użytkowników w wieku 13 lat i starszych. Nie gromadzimy świadomie danych osobowych od dzieci poniżej 13 roku życia. Jeśli odkryjemy, że zebraliśmy informacje od dziecka poniżej 13 roku życia, niezwłocznie usuniemy takie informacje.</p>

            <h2>9. Międzynarodowe Transfery Danych</h2>
            <p>Twoje informacje mogą być przekazywane i przetwarzane w krajach innych niż Twój własny. Zapewniamy odpowiednie zabezpieczenia w celu ochrony Twoich informacji zgodnie z obowiązującymi przepisami o ochronie danych.</p>

            <h2>10. Aktualizacje tej Polityki</h2>
            <p>Możemy od czasu do czasu aktualizować tę Politykę Prywatności. Powiadomimy Cię o wszelkich istotnych zmianach przez:</p>
            <ul>
                <li>Opublikowanie zaktualizowanej polityki w aplikacji</li>
                <li>Wysłanie powiadomienia e-mail (jeśli dotyczy)</li>
                <li>Dostarczenie powiadomień w aplikacji o znaczących zmianach</li>
            </ul>

            <h2>11. Linki do Stron Trzecich</h2>
            <p>Nasza Usługa może zawierać linki do stron internetowych lub usług stron trzecich. Nie jesteśmy odpowiedzialni za praktyki prywatności tych stron trzecich. Zachęcamy do przejrzenia ich polityk prywatności przed podaniem jakichkolwiek informacji.</p>

            <div class="contact-info">
                <h3>Skontaktuj się z Nami</h3>
                <p>Jeśli masz pytania dotyczące tej Polityki Prywatności lub naszych praktyk dotyczących danych, skontaktuj się z nami:</p>
                <ul>
                    <li><strong>Email:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Developer:</strong> Karol Krakowski</li>
                    <li><strong>Strona:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>Odpowiemy na zapytania dotyczące prywatności w ciągu 30 dni.</p>
            </div>
        '
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
    
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary-color: #FF6F1A;
            --text-dark: #2C2C2C;
            --text-light: #666666;
            --background-light: #FAFAFA;
            --card-background: #FFFFFF;
            --border-color: #E5E5E5;
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
            background: var(--background-light);
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .language-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: white;
            border-radius: 25px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--primary-color);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .header p {
            color: var(--text-light);
            font-size: 1.1rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            margin-bottom: 2rem;
            transition: opacity 0.3s ease;
        }

        .back-link:hover {
            opacity: 0.8;
        }

        .content {
            background: var(--card-background);
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 2rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .content h2:first-child {
            margin-top: 0;
        }

        .content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 1.5rem 0 0.5rem 0;
        }

        .content p {
            margin-bottom: 1rem;
            color: var(--text-light);
        }

        .content ul {
            margin: 1rem 0 1rem 2rem;
            color: var(--text-light);
        }

        .content li {
            margin-bottom: 0.5rem;
        }

        .content strong {
            color: var(--text-dark);
        }

        .last-updated {
            font-style: italic;
            color: var(--text-light);
            margin-bottom: 2rem;
        }

        .contact-info {
            background: var(--background-light);
            padding: 1.5rem;
            border-radius: 10px;
            margin-top: 2rem;
        }

        .contact-info h3 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        .mobile-menu-toggle {
            display: none;
            font-size: 1.5rem;
            color: var(--text-dark);
            cursor: pointer;
            position: fixed;
            top: 25px;
            right: 20px;
            z-index: 1002;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
        }

        .mobile-menu.active {
            display: block;
        }

        .mobile-menu-content {
            position: absolute;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 1rem 0;
        }

        .mobile-nav-links {
            display: flex;
            flex-direction: column;
            padding: 0 20px;
        }

        .mobile-nav-links a {
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
            text-decoration: none;
            color: var(--text-dark);
            font-weight: 500;
        }

        .mobile-nav-links a:last-child {
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

        @media (max-width: 768px) {
            .language-switcher {
                display: none;
            }

            .mobile-menu-toggle {
                display: block;
            }

            .container {
                padding: 20px 15px;
            }

            .content {
                padding: 2rem 1.5rem;
            }

            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <!-- Language Switcher -->
    <div class="language-switcher">
        <a href="?lang=en" class="<?php echo $lang === 'en' ? 'active' : ''; ?>">EN</a>
        <a href="?lang=pl" class="<?php echo $lang === 'pl' ? 'active' : ''; ?>">PL</a>
    </div>

    <!-- Mobile Menu Toggle -->
    <i class="fas fa-bars mobile-menu-toggle" onclick="toggleMobileMenu()"></i>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu" onclick="closeMobileMenu(event)">
        <div class="mobile-menu-content">
            <div class="mobile-nav-links">
                <a href="index.php?lang=<?php echo $lang; ?>">Home</a>
                <a href="index.php?lang=<?php echo $lang; ?>#features"><?php echo $lang === 'pl' ? 'Funkcje' : 'Features'; ?></a>
                <a href="index.php?lang=<?php echo $lang; ?>#languages"><?php echo $lang === 'pl' ? 'Języki' : 'Languages'; ?></a>
                <a href="index.php?lang=<?php echo $lang; ?>#coming-soon"><?php echo $lang === 'pl' ? 'Już Wkrótce' : 'Coming Soon'; ?></a>
                <a href="index.php?lang=<?php echo $lang; ?>#faq">FAQ</a>
                <a href="terms.php?lang=<?php echo $lang; ?>"><?php echo $lang === 'pl' ? 'Regulamin' : 'Terms'; ?></a>
            </div>
            <div class="mobile-language-switcher">
                <a href="?lang=en" class="<?php echo $lang === 'en' ? 'active' : ''; ?>">EN</a>
                <a href="?lang=pl" class="<?php echo $lang === 'pl' ? 'active' : ''; ?>">PL</a>
            </div>
        </div>
    </div>

    <div class="container">
        <a href="index.php?lang=<?php echo $lang; ?>" class="back-link">
            <?php echo $t['back_link']; ?>
        </a>
        
        <div class="header">
            <h1><?php echo $t['main_title']; ?></h1>
            <p><?php echo $t['subtitle']; ?></p>
        </div>

        <div class="content">
            <?php echo $t['content']; ?>
        </div>
    </div>

    <script>
        // Mobile Menu Toggle
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('active');
        }

        // Close mobile menu when clicking on overlay
        function closeMobileMenu(event) {
            if (event.target.id === 'mobileMenu') {
                const mobileMenu = document.getElementById('mobileMenu');
                mobileMenu.classList.remove('active');
            }
        }
    </script>
</body>
</html> 
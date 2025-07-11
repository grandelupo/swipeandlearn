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
        'title' => 'Terms of Service - Swipe and Learn',
        'description' => 'Terms of Service for Swipe and Learn - AI-powered language learning app',
        'main_title' => 'Terms of Service',
        'subtitle' => 'Terms and conditions for using Swipe and Learn',
        'back_link' => '← Back to Home',
        'content' => '
            <p class="last-updated"><strong>Last Updated:</strong> January 2024</p>

            <div class="highlight">
                <p><strong>Important:</strong> By downloading, installing, or using the Swipe and Learn app, you agree to be bound by these Terms of Service. Please read them carefully.</p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User" or "you") and Karol Krakowski ("we," "us," or "our") regarding your use of the Swipe and Learn mobile application and related services (collectively, the "Service").</p>
            <p>If you do not agree to these Terms, you may not access or use our Service.</p>

            <h2>2. Description of Service</h2>
            <p>Swipe and Learn is an AI-powered language learning application that provides:</p>
            <ul>
                <li>Personalized story generation in multiple languages</li>
                <li>Interactive translation and dictionary services</li>
                <li>AI-generated audiobook functionality</li>
                <li>Progress tracking and learning analytics</li>
                <li>Premium features through a coin-based system</li>
            </ul>

            <h2>3. User Accounts and Registration</h2>
            
            <h3>3.1 Account Creation</h3>
            <p>To access certain features of our Service, you must create an account by providing accurate and complete information, including a valid email address.</p>
            
            <h3>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h3>3.3 Age Requirements</h3>
            <p>You must be at least 13 years old to use our Service. Users under 18 require parental consent.</p>

            <h2>4. Acceptable Use</h2>
            
            <h3>4.1 Permitted Use</h3>
            <p>You may use our Service for personal, non-commercial language learning purposes in accordance with these Terms.</p>
            
            <h3>4.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Generate content that is offensive, harmful, or inappropriate</li>
                <li>Attempt to reverse engineer, decompile, or hack the Service</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the Service</li>
                <li>Circumvent any limitations or restrictions we place on your account</li>
                <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>5. AI-Generated Content</h2>
            
            <h3>5.1 Content Generation</h3>
            <p>Our Service uses artificial intelligence to generate stories, translations, and audio content. While we strive for accuracy and appropriateness, AI-generated content may occasionally:</p>
            <ul>
                <li>Contain inaccuracies or errors</li>
                <li>Include unexpected or inappropriate content</li>
                <li>Reflect biases present in training data</li>
            </ul>

            <h3>5.2 Content Responsibility</h3>
            <p>You acknowledge that:</p>
            <ul>
                <li>AI-generated content is created based on your inputs and preferences</li>
                <li>We cannot guarantee the accuracy or appropriateness of all generated content</li>
                <li>You use AI-generated content at your own discretion</li>
                <li>We are not responsible for decisions made based on AI-generated content</li>
            </ul>

            <h2>6. Premium Features and Payments</h2>
            
            <h3>6.1 Coin System</h3>
            <p>Certain features require "coins" which can be:</p>
            <ul>
                <li>Earned through app usage and achievements</li>
                <li>Purchased through in-app purchases</li>
                <li>Obtained through promotional offers</li>
            </ul>

            <h3>6.2 In-App Purchases</h3>
            <p>Payments for coins are processed through your device\'s app store (Apple App Store or Google Play Store) and are subject to their respective terms and conditions.</p>

            <h3>6.3 Refunds</h3>
            <p>Refund requests must be made through the respective app store. We do not directly process refunds for in-app purchases.</p>

            <h2>7. Intellectual Property</h2>
            
            <h3>7.1 Our Rights</h3>
            <p>We own all rights, title, and interest in the Swipe and Learn app, including:</p>
            <ul>
                <li>Software code and algorithms</li>
                <li>User interface and design</li>
                <li>Trademarks and branding</li>
                <li>Documentation and content</li>
            </ul>

            <h3>7.2 Your Content</h3>
            <p>You retain ownership of any original content you input into the Service. However, you grant us a license to:</p>
            <ul>
                <li>Process your inputs to generate personalized content</li>
                <li>Store and display generated content in your account</li>
                <li>Use anonymized data for service improvement</li>
            </ul>

            <h3>7.3 Generated Content</h3>
            <p>Content generated by our AI based on your inputs is considered your personal content for your use within the Service.</p>

            <h2>8. Privacy and Data Protection</h2>
            <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>

            <h2>9. Third-Party Services</h2>
            <p>Our Service integrates with third-party services including:</p>
            <ul>
                <li><strong>OpenAI: For AI content generation</strong></li>
                <li><strong>ElevenLabs: For voice synthesis</strong></li>
                <li><strong>Supabase: For data storage and authentication</strong></li>
                <li><strong>RevenueCat: For subscription management</strong></li>
            </ul>
            <p>Your use of these integrated services is subject to their respective terms and conditions.</p>

            <h2>10. Service Availability</h2>
            
            <h3>10.1 Availability</h3>
            <p>We strive to maintain service availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to:</p>
            <ul>
                <li>Scheduled maintenance</li>
                <li>Technical difficulties</li>
                <li>Third-party service issues</li>
                <li>Force majeure events</li>
            </ul>

            <h3>10.2 Updates and Changes</h3>
            <p>We may update the Service from time to time to:</p>
            <ul>
                <li>Improve functionality and performance</li>
                <li>Add new features</li>
                <li>Address security issues</li>
                <li>Comply with legal requirements</li>
            </ul>

            <h2>11. Disclaimers and Limitations</h2>
            
            <h3>11.1 Educational Tool</h3>
            <p>Swipe and Learn is designed as a language learning aid and should not be relied upon as the sole method of language instruction or for professional translation needs.</p>

            <h3>11.2 Limitation of Liability</h3>
            <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>

            <h3>11.3 Warranty Disclaimer</h3>
            <p>The Service is provided "as is" without warranties of any kind, either express or implied.</p>

            <h2>12. Termination</h2>
            
            <h3>12.1 Termination by You</h3>
            <p>You may terminate your account at any time by:</p>
            <ul>
                <li>Deleting the app from your device</li>
                <li>Contacting us to request account deletion</li>
                <li>Following in-app account deletion procedures</li>
            </ul>

            <h3>12.2 Termination by Us</h3>
            <p>We may suspend or terminate your access to the Service if you:</p>
            <ul>
                <li>Violate these Terms</li>
                <li>Engage in prohibited conduct</li>
                <li>Provide false information</li>
                <li>Fail to pay required fees</li>
            </ul>

            <h2>13. Governing Law and Disputes</h2>
            <p>These Terms are governed by the laws of Poland. Any disputes arising from these Terms or your use of the Service shall be resolved through good faith negotiation or appropriate legal channels.</p>

            <h2>14. Changes to Terms</h2>
            <p>We may modify these Terms from time to time. Material changes will be communicated through:</p>
            <ul>
                <li>In-app notifications</li>
                <li>Email notifications (if applicable)</li>
                <li>Updated posting on our website</li>
            </ul>
            <p>Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>

            <h2>15. Severability</h2>
            <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>

            <h2>16. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.</p>

            <div class="contact-info">
                <h3>Contact Information</h3>
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <ul>
                    <li><strong>Email:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Developer:</strong> Karol Krakowski</li>
                    <li><strong>Website:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>We will respond to legal inquiries within a reasonable timeframe.</p>
            </div>
        '
    ],
    'pl' => [
        'title' => 'Regulamin - Swipe and Learn',
        'description' => 'Regulamin dla Swipe and Learn - aplikacji do nauki języków z AI',
        'main_title' => 'Regulamin',
        'subtitle' => 'Warunki korzystania z Swipe and Learn',
        'back_link' => '← Powrót do Strony Głównej',
        'content' => '
            <p class="last-updated"><strong>Ostatnia Aktualizacja:</strong> Styczeń 2024</p>

            <div class="highlight">
                <p><strong>Ważne:</strong> Pobierając, instalując lub używając aplikacji Swipe and Learn, zgadzasz się na przestrzeganie niniejszego Regulaminu. Przeczytaj go uważnie.</p>
            </div>

            <h2>1. Akceptacja Warunków</h2>
            <p>Niniejszy Regulamin ("Warunki") stanowi prawnie wiążącą umowę między Tobą ("Użytkownik" lub "Ty") a Karolem Krakowskim ("my", "nas" lub "nasz") dotyczącą Twojego korzystania z aplikacji mobilnej Swipe and Learn i powiązanych usług (łącznie "Usługa").</p>
            <p>Jeśli nie zgadzasz się z niniejszymi Warunkami, nie możesz uzyskać dostępu do naszej Usługi ani z niej korzystać.</p>

            <h2>2. Opis Usługi</h2>
            <p>Swipe and Learn to aplikacja do nauki języków napędzana przez AI, która zapewnia:</p>
            <ul>
                <li>Personalizowane generowanie opowiadań w wielu językach</li>
                <li>Interaktywne usługi tłumaczenia i słownika</li>
                <li>Funkcjonalność audiobooków generowanych przez AI</li>
                <li>Śledzenie postępów i analitykę nauki</li>
                <li>Funkcje premium przez system monet</li>
            </ul>

            <h2>3. Konta Użytkowników i Rejestracja</h2>
            
            <h3>3.1 Tworzenie Konta</h3>
            <p>Aby uzyskać dostęp do niektórych funkcji naszej Usługi, musisz utworzyć konto, podając dokładne i kompletne informacje, w tym ważny adres e-mail.</p>
            
            <h3>3.2 Bezpieczeństwo Konta</h3>
            <p>Jesteś odpowiedzialny za:</p>
            <ul>
                <li>Zachowanie poufności danych dostępowych do konta</li>
                <li>Wszystkie działania wykonywane na Twoim koncie</li>
                <li>Natychmiastowe powiadomienie nas o nieautoryzowanym dostępie</li>
            </ul>

            <h3>3.3 Wymagania Wiekowe</h3>
            <p>Musisz mieć co najmniej 13 lat, aby korzystać z naszej Usługi. Użytkownicy poniżej 18 roku życia wymagają zgody rodziców.</p>

            <h2>4. Dopuszczalne Użytkowanie</h2>
            
            <h3>4.1 Dozwolone Użytkowanie</h3>
            <p>Możesz korzystać z naszej Usługi do osobistego, niekomercyjnego uczenia się języków zgodnie z niniejszymi Warunkami.</p>
            
            <h3>4.2 Zabronione Zachowania</h3>
            <p>Zgadzasz się nie:</p>
            <ul>
                <li>Używać Usługi do celów nielegalnych lub nieautoryzowanych</li>
                <li>Generować treści obraźliwych, szkodliwych lub niewłaściwych</li>
                <li>Próbować inżynierii wstecznej, dekompilacji lub hakowania Usługi</li>
                <li>Udostępniać danych dostępowych do konta innym</li>
                <li>Używać zautomatyzowanych systemów dostępu do Usługi</li>
                <li>Omijać ograniczenia lub restrykcje nakładane na Twoje konto</li>
                <li>Naruszać obowiązujących przepisów prawa</li>
            </ul>

            <h2>5. Treści Generowane przez AI</h2>
            
            <h3>5.1 Generowanie Treści</h3>
            <p>Nasza Usługa wykorzystuje sztuczną inteligencję do generowania opowiadań, tłumaczeń i treści audio. Chociaż dążymy do dokładności i stosowności, treści generowane przez AI mogą czasami:</p>
            <ul>
                <li>Zawierać nieścisłości lub błędy</li>
                <li>Zawierać nieoczekiwaną lub niewłaściwą treść</li>
                <li>Odzwierciedlać uprzedzenia obecne w danych treningowych</li>
            </ul>

            <h3>5.2 Odpowiedzialność za Treść</h3>
            <p>Przyjmujesz do wiadomości, że:</p>
            <ul>
                <li>Treści generowane przez AI są tworzone na podstawie Twoich danych wejściowych i preferencji</li>
                <li>Nie możemy zagwarantować dokładności lub stosowności wszystkich generowanych treści</li>
                <li>Używasz treści generowanych przez AI na własną odpowiedzialność</li>
                <li>Nie jesteśmy odpowiedzialni za decyzje podjęte na podstawie treści generowanych przez AI</li>
            </ul>

            <h2>6. Funkcje Premium i Płatności</h2>
            
            <h3>6.1 System Monet</h3>
            <p>Niektóre funkcje wymagają "monet", które można:</p>
            <ul>
                <li>Zarobić poprzez korzystanie z aplikacji i osiągnięcia</li>
                <li>Kupić poprzez zakupy w aplikacji</li>
                <li>Uzyskać poprzez oferty promocyjne</li>
            </ul>

            <h3>6.2 Zakupy w Aplikacji</h3>
            <p>Płatności za monety są przetwarzane przez sklep aplikacji Twojego urządzenia (Apple App Store lub Google Play Store) i podlegają ich odpowiednim warunkom.</p>

            <h3>6.3 Zwroty</h3>
            <p>Wnioski o zwrot muszą być składane przez odpowiedni sklep aplikacji. Nie przetwarzamy bezpośrednio zwrotów za zakupy w aplikacji.</p>

            <h2>7. Własność Intelektualna</h2>
            
            <h3>7.1 Nasze Prawa</h3>
            <p>Posiadamy wszystkie prawa, tytuł i zainteresowanie w aplikacji Swipe and Learn, w tym:</p>
            <ul>
                <li>Kod oprogramowania i algorytmy</li>
                <li>Interfejs użytkownika i design</li>
                <li>Znaki towarowe i branding</li>
                <li>Dokumentację i treści</li>
            </ul>

            <h3>7.2 Twoja Treść</h3>
            <p>Zachowujesz własność wszelkich oryginalnych treści wprowadzanych do Usługi. Jednak udzielasz nam licencji na:</p>
            <ul>
                <li>Przetwarzanie Twoich danych wejściowych w celu generowania spersonalizowanych treści</li>
                <li>Przechowywanie i wyświetlanie wygenerowanych treści na Twoim koncie</li>
                <li>Używanie anonimowych danych do ulepszania usługi</li>
            </ul>

            <h3>7.3 Wygenerowane Treści</h3>
            <p>Treści wygenerowane przez nasze AI na podstawie Twoich danych wejściowych są uważane za Twoją osobistą treść do użytku w ramach Usługi.</p>

            <h2>8. Prywatność i Ochrona Danych</h2>
            <p>Twoja prywatność jest dla nas ważna. Nasze gromadzenie i wykorzystywanie danych osobowych reguluje nasza Polityka Prywatności, która jest włączona do niniejszych Warunków przez odniesienie.</p>

            <h2>9. Usługi Stron Trzecich</h2>
            <p>Nasza Usługa integruje się z usługami stron trzecich, w tym:</p>
            <ul>
                <li><strong>OpenAI: Do generowania treści AI</strong></li>
                <li><strong>ElevenLabs: Do syntezy głosu</strong></li>
                <li><strong>Supabase: Do przechowywania danych i uwierzytelniania</strong></li>
                <li><strong>RevenueCat: Do zarządzania subskrypcjami</strong></li>
            </ul>
            <p>Twoje korzystanie z tych zintegrowanych usług podlega ich odpowiednim warunkom.</p>

            <h2>10. Dostępność Usługi</h2>
            
            <h3>10.1 Dostępność</h3>
            <p>Staramy się utrzymać dostępność usługi, ale nie możemy zagwarantować nieprzerwany dostęp. Usługa może być tymczasowo niedostępna z powodu:</p>
            <ul>
                <li>Planowanej konserwacji</li>
                <li>Trudności technicznych</li>
                <li>Problemów z usługami stron trzecich</li>
                <li>Zdarzeń siły wyższej</li>
            </ul>

            <h3>10.2 Aktualizacje i Zmiany</h3>
            <p>Możemy od czasu do czasu aktualizować Usługę, aby:</p>
            <ul>
                <li>Ulepszać funkcjonalność i wydajność</li>
                <li>Dodawać nowe funkcje</li>
                <li>Rozwiązywać problemy bezpieczeństwa</li>
                <li>Przestrzegać wymogów prawnych</li>
            </ul>

            <h2>11. Zastrzeżenia i Ograniczenia</h2>
            
            <h3>11.1 Narzędzie Edukacyjne</h3>
            <p>Swipe and Learn jest zaprojowane jako pomoc w nauce języków i nie powinno być traktowane jako jedyna metoda nauki języka lub do potrzeb profesjonalnego tłumaczenia.</p>

            <h3>11.2 Ograniczenie Odpowiedzialności</h3>
            <p>W maksymalnym zakresie dozwolonym przez prawo, nie będziemy ponosić odpowiedzialności za jakiekolwiek pośrednie, przypadkowe, specjalne, następcze lub karne szkody wynikające z Twojego korzystania z Usługi.</p>

            <h3>11.3 Zastrzeżenie Gwarancji</h3>
            <p>Usługa jest świadczona "tak jak jest" bez gwarancji jakiegokolwiek rodzaju, ani wyraźnych, ani dorozumianych.</p>

            <h2>12. Zakończenie</h2>
            
            <h3>12.1 Zakończenie przez Ciebie</h3>
            <p>Możesz zakończyć swoje konto w dowolnym momencie przez:</p>
            <ul>
                <li>Usunięcie aplikacji z urządzenia</li>
                <li>Skontaktowanie się z nami w celu żądania usunięcia konta</li>
                <li>Skorzystanie z procedur usuwania konta w aplikacji</li>
            </ul>

            <h3>12.2 Zakończenie przez Nas</h3>
            <p>Możemy zawiesić lub zakończyć Twój dostęp do Usługi, jeśli:</p>
            <ul>
                <li>Naruszysz niniejsze Warunki</li>
                <li>Angażujesz się w zabronione zachowania</li>
                <li>Podasz fałszywe informacje</li>
                <li>Nie zapłacisz wymaganych opłat</li>
            </ul>

            <h2>13. Prawo Właściwe i Spory</h2>
            <p>Niniejsze Warunki są regulowane przez prawo polskie. Wszelkie spory wynikające z niniejszych Warunków lub Twojego korzystania z Usługi będą rozwiązywane przez negocjacje w dobrej wierze lub odpowiednie kanały prawne.</p>

            <h2>14. Zmiany w Warunkach</h2>
            <p>Możemy od czasu do czasu modyfikować niniejsze Warunki. Istotne zmiany będą komunikowane przez:</p>
            <ul>
                <li>Powiadomienia w aplikacji</li>
                <li>Powiadomienia e-mail (jeśli dotyczy)</li>
                <li>Aktualizację publikacji na naszej stronie internetowej</li>
            </ul>
            <p>Dalsze korzystanie z Usługi po zmianach stanowi akceptację zmodyfikowanych Warunków.</p>

            <h2>15. Rozłączność</h2>
            <p>Jeśli jakiekolwiek postanowienie niniejszych Warunków zostanie uznane za niewykonalne, pozostałe postanowienia pozostaną w pełni obowiązujące.</p>

            <h2>16. Cała Umowa</h2>
            <p>Niniejsze Warunki wraz z naszą Polityką Prywatności stanowią całą umowę między Tobą a nami dotyczącą Usługi.</p>

            <div class="contact-info">
                <h3>Informacje Kontaktowe</h3>
                <p>Jeśli masz pytania dotyczące niniejszego Regulaminu, skontaktuj się z nami:</p>
                <ul>
                    <li><strong>Email:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Developer:</strong> Karol Krakowski</li>
                    <li><strong>Strona:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>Odpowiemy na zapytania prawne w rozsądnym czasie.</p>
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

        .highlight {
            background: #FFF3E0;
            padding: 1rem;
            border-left: 4px solid var(--primary-color);
            border-radius: 5px;
            margin: 1rem 0;
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
                <a href="privacy.php?lang=<?php echo $lang; ?>"><?php echo $lang === 'pl' ? 'Prywatność' : 'Privacy'; ?></a>
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
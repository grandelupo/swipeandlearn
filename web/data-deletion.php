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
        'title' => 'Data Deletion Instructions - Swipe and Learn',
        'description' => 'Instructions for requesting deletion of your data from Swipe and Learn',
        'main_title' => 'Data Deletion Instructions',
        'subtitle' => 'How to request deletion of your personal data',
        'back_link' => '← Back to Home',
        'content' => '
            <p class="last-updated"><strong>Last Updated:</strong> January 2024</p>

            <h2>1. Overview</h2>
            <p>We respect your right to control your personal data. This page provides clear instructions on how to request deletion of your data from Swipe and Learn. These instructions comply with Facebook OAuth requirements and applicable data protection laws.</p>

            <h2>2. What Data Can Be Deleted</h2>
            <p>You can request deletion of all personal data associated with your account, including:</p>
            <ul>
                <li><strong>Account Information:</strong> Email address, username, profile settings</li>
                <li><strong>Learning Data:</strong> Language preferences, difficulty levels, target vocabulary</li>
                <li><strong>Progress Data:</strong> Reading progress, completed stories, translation history</li>
                <li><strong>Generated Content:</strong> AI-generated stories, translations, and audio files</li>
                <li><strong>Usage Data:</strong> App usage patterns, feature interactions</li>
                <li><strong>Device Information:</strong> Device identifiers and technical data</li>
                <li><strong>Communication Data:</strong> Support tickets and feedback submissions</li>
            </ul>

            <h2>3. How to Request Data Deletion</h2>
            
            <h3>3.1 Option 1: Delete Account Within the App</h3>
            <p>The fastest way to delete your data is through the app itself:</p>
            <ol>
                <li>Open the Swipe and Learn app</li>
                <li>Go to Settings or Profile section</li>
                <li>Look for "Account Settings" or "Privacy Settings"</li>
                <li>Select "Delete Account" or "Delete My Data"</li>
                <li>Confirm your decision when prompted</li>
                <li>Your account and all associated data will be permanently deleted</li>
            </ol>

            <h3>3.2 Option 2: Email Request</h3>
            <p>If you cannot access the app or prefer to email us:</p>
            <ol>
                <li>Send an email to: <strong>karol@karolkrakowski.pl</strong></li>
                <li>Use the subject line: "Data Deletion Request - Swipe and Learn"</li>
                <li>Include the following information:
                    <ul>
                        <li>The email address associated with your account</li>
                        <li>Your username (if you remember it)</li>
                        <li>Clear statement that you want to delete your account and all data</li>
                        <li>Reason for deletion (optional)</li>
                    </ul>
                </li>
                <li>We will respond within 48 hours to confirm your request</li>
            </ol>

            <h3>3.3 Option 3: Facebook Login Users</h3>
            <p>If you signed up using Facebook Login:</p>
            <ol>
                <li>You can use either Option 1 or Option 2 above</li>
                <li>Additionally, you can manage your data through Facebook:
                    <ul>
                        <li>Go to Facebook Settings & Privacy > Settings</li>
                        <li>Click "Apps and Websites"</li>
                        <li>Find "Swipe and Learn" in your app list</li>
                        <li>Click "Remove" to disconnect the app</li>
                        <li>This will revoke our access to your Facebook data</li>
                    </ul>
                </li>
                <li>For complete data deletion, please also contact us directly using Option 2</li>
            </ol>

            <h2>4. Deletion Process Timeline</h2>
            <p>Here\'s what happens when you request data deletion:</p>
            <ul>
                <li><strong>Immediate:</strong> Your account becomes inaccessible</li>
                <li><strong>Within 24 hours:</strong> Your data is removed from active systems</li>
                <li><strong>Within 7 days:</strong> Your data is removed from backup systems</li>
                <li><strong>Within 30 days:</strong> Complete deletion from all systems and backups</li>
            </ul>

            <h2>5. What Data Cannot Be Deleted</h2>
            <p>Some data may be retained for legal or business purposes:</p>
            <ul>
                <li><strong>Legal Requirements:</strong> Data required by law (e.g., financial records)</li>
                <li><strong>Safety and Security:</strong> Data needed to prevent fraud or abuse</li>
                <li><strong>Anonymized Data:</strong> Data that has been fully anonymized for analytics</li>
                <li><strong>Public Content:</strong> Any content you made public (though this is rare in our app)</li>
            </ul>

            <h2>6. Data Deletion Confirmation</h2>
            <p>After processing your deletion request:</p>
            <ul>
                <li>We will send you a confirmation email within 48 hours</li>
                <li>You will receive a final confirmation once deletion is complete</li>
                <li>If you used Facebook Login, you may also receive a notification from Facebook</li>
            </ul>

            <h2>7. Before You Delete</h2>
            <p>Please consider these options before deleting your data:</p>
            <ul>
                <li><strong>Data Export:</strong> Request a copy of your data first</li>
                <li><strong>Account Deactivation:</strong> Temporarily deactivate instead of deleting</li>
                <li><strong>Selective Deletion:</strong> Delete only specific types of data</li>
                <li><strong>Privacy Settings:</strong> Adjust privacy settings instead of full deletion</li>
            </ul>

            <h2>8. Re-activation After Deletion</h2>
            <p>Important information about deleted accounts:</p>
            <ul>
                <li>Once deleted, your account and data cannot be recovered</li>
                <li>You can create a new account with the same email address</li>
                <li>Your learning progress and content will not be restored</li>
                <li>You will need to start over with a fresh account</li>
            </ul>

            <h2>9. Third-Party Data</h2>
            <p>We will also request deletion of your data from our third-party services:</p>
            <ul>
                <li><strong>OpenAI:</strong> AI-generated content and processing history</li>
                <li><strong>ElevenLabs:</strong> Voice generation history and audio files</li>
                <li><strong>Supabase:</strong> Database records and authentication data</li>
                <li><strong>RevenueCat:</strong> Purchase history (where legally possible)</li>
            </ul>

            <h2>10. Data Portability</h2>
            <p>Before deletion, you can request a copy of your data:</p>
            <ul>
                <li>Email us at: <strong>karol@karolkrakowski.pl</strong></li>
                <li>Subject: "Data Export Request - Swipe and Learn"</li>
                <li>We will provide your data in a structured, machine-readable format</li>
                <li>Export includes: stories, progress, translations, and account information</li>
            </ul>

            <div class="contact-info">
                <h3>Need Help?</h3>
                <p>If you have any questions about data deletion or need assistance:</p>
                <ul>
                    <li><strong>Email:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Subject Line:</strong> "Data Deletion Help - Swipe and Learn"</li>
                    <li><strong>Developer:</strong> Karol Krakowski</li>
                    <li><strong>Website:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>We will respond to deletion requests within 48 hours and complete the process within 30 days.</p>
            </div>

            <div class="important-note">
                <h3>⚠️ Important Notice</h3>
                <p>Data deletion is permanent and cannot be undone. Please ensure you have exported any important data before proceeding with deletion.</p>
            </div>
        '
    ],
    'pl' => [
        'title' => 'Instrukcje Usuwania Danych - Swipe and Learn',
        'description' => 'Instrukcje dotyczące żądania usunięcia danych z Swipe and Learn',
        'main_title' => 'Instrukcje Usuwania Danych',
        'subtitle' => 'Jak żądać usunięcia swoich danych osobowych',
        'back_link' => '← Powrót do Strony Głównej',
        'content' => '
            <p class="last-updated"><strong>Ostatnia Aktualizacja:</strong> Styczeń 2024</p>

            <h2>1. Przegląd</h2>
            <p>Szanujemy Twoje prawo do kontroli nad swoimi danymi osobowymi. Ta strona zawiera jasne instrukcje dotyczące żądania usunięcia danych z Swipe and Learn. Te instrukcje są zgodne z wymaganiami Facebook OAuth i obowiązującymi przepisami o ochronie danych.</p>

            <h2>2. Jakie Dane Mogą Być Usunięte</h2>
            <p>Możesz żądać usunięcia wszystkich danych osobowych związanych z Twoim kontem, w tym:</p>
            <ul>
                <li><strong>Informacje o Koncie:</strong> Adres e-mail, nazwa użytkownika, ustawienia profilu</li>
                <li><strong>Dane Nauki:</strong> Preferencje językowe, poziomy trudności, docelowe słownictwo</li>
                <li><strong>Dane Postępów:</strong> Postęp w czytaniu, ukończone opowiadania, historia tłumaczeń</li>
                <li><strong>Wygenerowane Treści:</strong> Opowiadania, tłumaczenia i pliki audio generowane przez AI</li>
                <li><strong>Dane Użytkowania:</strong> Wzorce użytkowania aplikacji, interakcje z funkcjami</li>
                <li><strong>Informacje o Urządzeniu:</strong> Identyfikatory urządzeń i dane techniczne</li>
                <li><strong>Dane Komunikacji:</strong> Zgłoszenia do pomocy technicznej i przesłane opinie</li>
            </ul>

            <h2>3. Jak Żądać Usunięcia Danych</h2>
            
            <h3>3.1 Opcja 1: Usuwanie Konta w Aplikacji</h3>
            <p>Najszybszy sposób usunięcia danych to przez samą aplikację:</p>
            <ol>
                <li>Otwórz aplikację Swipe and Learn</li>
                <li>Przejdź do sekcji Ustawienia lub Profil</li>
                <li>Szukaj "Ustawienia Konta" lub "Ustawienia Prywatności"</li>
                <li>Wybierz "Usuń Konto" lub "Usuń Moje Dane"</li>
                <li>Potwierdź swoją decyzję gdy zostaniesz o to poproszony</li>
                <li>Twoje konto i wszystkie powiązane dane zostaną trwale usunięte</li>
            </ol>

            <h3>3.2 Opcja 2: Żądanie E-mailem</h3>
            <p>Jeśli nie masz dostępu do aplikacji lub wolisz wysłać e-mail:</p>
            <ol>
                <li>Wyślij e-mail na: <strong>karol@karolkrakowski.pl</strong></li>
                <li>Użyj tematu: "Żądanie Usunięcia Danych - Swipe and Learn"</li>
                <li>Dołącz następujące informacje:
                    <ul>
                        <li>Adres e-mail powiązany z Twoim kontem</li>
                        <li>Twoja nazwa użytkownika (jeśli ją pamiętasz)</li>
                        <li>Jasne oświadczenie, że chcesz usunąć konto i wszystkie dane</li>
                        <li>Powód usunięcia (opcjonalnie)</li>
                    </ul>
                </li>
                <li>Odpowiemy w ciągu 48 godzin, aby potwierdzić Twoje żądanie</li>
            </ol>

            <h3>3.3 Opcja 3: Użytkownicy Logujący się przez Facebook</h3>
            <p>Jeśli zarejestrowałeś się używając logowania przez Facebook:</p>
            <ol>
                <li>Możesz użyć Opcji 1 lub Opcji 2 powyżej</li>
                <li>Dodatkowo możesz zarządzać swoimi danymi przez Facebook:
                    <ul>
                        <li>Przejdź do Facebook Ustawienia i Prywatność > Ustawienia</li>
                        <li>Kliknij "Aplikacje i Strony internetowe"</li>
                        <li>Znajdź "Swipe and Learn" na liście aplikacji</li>
                        <li>Kliknij "Usuń", aby odłączyć aplikację</li>
                        <li>To cofnie nasz dostęp do Twoich danych Facebook</li>
                    </ul>
                </li>
                <li>Aby całkowicie usunąć dane, skontaktuj się z nami bezpośrednio używając Opcji 2</li>
            </ol>

            <h2>4. Harmonogram Procesu Usuwania</h2>
            <p>Oto co dzieje się po żądaniu usunięcia danych:</p>
            <ul>
                <li><strong>Natychmiast:</strong> Twoje konto staje się niedostępne</li>
                <li><strong>W ciągu 24 godzin:</strong> Twoje dane są usuwane z aktywnych systemów</li>
                <li><strong>W ciągu 7 dni:</strong> Twoje dane są usuwane z systemów kopii zapasowych</li>
                <li><strong>W ciągu 30 dni:</strong> Całkowite usunięcie ze wszystkich systemów i kopii zapasowych</li>
            </ul>

            <h2>5. Jakie Dane Nie Mogą Być Usunięte</h2>
            <p>Niektóre dane mogą być zachowane ze względów prawnych lub biznesowych:</p>
            <ul>
                <li><strong>Wymagania Prawne:</strong> Dane wymagane przez prawo (np. dokumenty finansowe)</li>
                <li><strong>Bezpieczeństwo:</strong> Dane potrzebne do zapobiegania oszustwom lub nadużyciom</li>
                <li><strong>Dane Zanonimizowane:</strong> Dane w pełni zanonimizowane do celów analitycznych</li>
                <li><strong>Treści Publiczne:</strong> Wszelkie treści, które udostępniłeś publicznie (choć to rzadkie w naszej aplikacji)</li>
            </ul>

            <h2>6. Potwierdzenie Usunięcia Danych</h2>
            <p>Po przetworzeniu Twojego żądania usunięcia:</p>
            <ul>
                <li>Wyślemy Ci e-mail z potwierdzeniem w ciągu 48 godzin</li>
                <li>Otrzymasz końcowe potwierdzenie po zakończeniu usuwania</li>
                <li>Jeśli używałeś logowania przez Facebook, możesz również otrzymać powiadomienie od Facebook</li>
            </ul>

            <h2>7. Przed Usunięciem</h2>
            <p>Przed usunięciem danych rozważ te opcje:</p>
            <ul>
                <li><strong>Eksport Danych:</strong> Najpierw poproś o kopię swoich danych</li>
                <li><strong>Dezaktywacja Konta:</strong> Tymczasowo dezaktywuj zamiast usuwać</li>
                <li><strong>Selektywne Usuwanie:</strong> Usuń tylko określone typy danych</li>
                <li><strong>Ustawienia Prywatności:</strong> Dostosuj ustawienia prywatności zamiast pełnego usunięcia</li>
            </ul>

            <h2>8. Reaktywacja Po Usunięciu</h2>
            <p>Ważne informacje o usunięte kontach:</p>
            <ul>
                <li>Po usunięciu konta i danych nie można ich odzyskać</li>
                <li>Możesz utworzyć nowe konto z tym samym adresem e-mail</li>
                <li>Twój postęp w nauce i treści nie zostaną przywrócone</li>
                <li>Będziesz musiał zacząć od nowa ze świeżym kontem</li>
            </ul>

            <h2>9. Dane Stron Trzecich</h2>
            <p>Poprosimy również o usunięcie Twoich danych z naszych usług stron trzecich:</p>
            <ul>
                <li><strong>OpenAI:</strong> Treści generowane przez AI i historia przetwarzania</li>
                <li><strong>ElevenLabs:</strong> Historia generowania głosu i pliki audio</li>
                <li><strong>Supabase:</strong> Rekordy bazy danych i dane uwierzytelniania</li>
                <li><strong>RevenueCat:</strong> Historia zakupów (gdzie to prawnie możliwe)</li>
            </ul>

            <h2>10. Przenośność Danych</h2>
            <p>Przed usunięciem możesz poprosić o kopię swoich danych:</p>
            <ul>
                <li>Wyślij e-mail na: <strong>karol@karolkrakowski.pl</strong></li>
                <li>Temat: "Żądanie Eksportu Danych - Swipe and Learn"</li>
                <li>Dostarczymy Twoje dane w ustrukturyzowanym, czytelnym dla maszyn formacie</li>
                <li>Eksport obejmuje: opowiadania, postępy, tłumaczenia i informacje o koncie</li>
            </ul>

            <div class="contact-info">
                <h3>Potrzebujesz Pomocy?</h3>
                <p>Jeśli masz pytania dotyczące usuwania danych lub potrzebujesz pomocy:</p>
                <ul>
                    <li><strong>E-mail:</strong> karol@karolkrakowski.pl</li>
                    <li><strong>Temat:</strong> "Pomoc z Usuwaniem Danych - Swipe and Learn"</li>
                    <li><strong>Deweloper:</strong> Karol Krakowski</li>
                    <li><strong>Strona:</strong> <a href="https://karolkrakowski.pl" target="_blank">karolkrakowski.pl</a></li>
                </ul>
                <p>Odpowiemy na żądania usunięcia w ciągu 48 godzin i zakończymy proces w ciągu 30 dni.</p>
            </div>

            <div class="important-note">
                <h3>⚠️ Ważna Uwaga</h3>
                <p>Usuwanie danych jest trwałe i nie można go cofnąć. Upewnij się, że wyeksportowałeś wszystkie ważne dane przed przystąpieniem do usuwania.</p>
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
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $t['title']; ?>">
    <meta property="og:description" content="<?php echo $t['description']; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://swipeandlearn.com/data-deletion.php">
    <meta property="og:image" content="https://swipeandlearn.com/assets/images/og-image.jpg">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $t['title']; ?>">
    <meta name="twitter:description" content="<?php echo $t['description']; ?>">
    <meta name="twitter:image" content="https://swipeandlearn.com/assets/images/twitter-card.jpg">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            --primary-color: #6366f1;
            --primary-dark: #4f46e5;
            --secondary-color: #ec4899;
            --accent-color: #10b981;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --background-light: #f9fafb;
            --border-color: #e5e7eb;
            --white: #ffffff;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
            background-color: var(--background-light);
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            margin-bottom: 2rem;
            transition: color 0.3s ease;
        }

        .back-link:hover {
            color: var(--primary-dark);
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 1rem;
        }

        .header p {
            font-size: 1.25rem;
            color: var(--text-light);
            max-width: 600px;
            margin: 0 auto;
        }

        .content {
            background: var(--white);
            padding: 3rem;
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }

        .last-updated {
            background: var(--background-light);
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }

        h2 {
            color: var(--text-dark);
            font-size: 1.5rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--primary-color);
        }

        h3 {
            color: var(--text-dark);
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
        }

        p {
            margin-bottom: 1rem;
            color: var(--text-dark);
            line-height: 1.7;
        }

        ul, ol {
            margin-left: 2rem;
            margin-bottom: 1rem;
        }

        li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }

        li strong {
            color: var(--primary-color);
            font-weight: 600;
        }

        .contact-info {
            background: var(--background-light);
            padding: 2rem;
            border-radius: 8px;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        .contact-info h3 {
            color: var(--primary-color);
            margin-top: 0;
            margin-bottom: 1rem;
        }

        .contact-info ul {
            margin-left: 1.5rem;
        }

        .important-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }

        .important-note h3 {
            color: #92400e;
            margin-top: 0;
            margin-bottom: 1rem;
        }

        .important-note p {
            color: #92400e;
            margin-bottom: 0;
        }

        a {
            color: var(--primary-color);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        a:hover {
            color: var(--primary-dark);
            text-decoration: underline;
        }

        .language-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 0.5rem;
            background: var(--white);
            padding: 0.5rem;
            border-radius: 25px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
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

        .mobile-menu-toggle {
            display: none;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: var(--shadow-md);
        }

        .mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .mobile-menu.active {
            opacity: 1;
            pointer-events: all;
        }

        .mobile-menu-content {
            position: absolute;
            top: 0;
            right: 0;
            width: 280px;
            height: 100%;
            background: var(--white);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }

        .mobile-menu.active .mobile-menu-content {
            transform: translateX(0);
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
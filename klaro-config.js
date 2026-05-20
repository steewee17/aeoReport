// aeo-report.com — Klaro Cookie Consent Configuration
// Docs: https://heyklaro.com/docs/getting-started/annotating-your-code

// Custom CSS override — compact bottom banner in brand style
const klaroStyle = document.createElement('style');
klaroStyle.textContent = `
  .klaro .cookie-notice {
    background: #1A1A1A !important;
    border-top: 1px solid rgba(184,150,46,.3) !important;
    border-radius: 0 !important;
    padding: 16px 32px !important;
    display: flex !important;
    align-items: center !important;
    gap: 24px !important;
    max-width: 100% !important;
    box-shadow: 0 -4px 24px rgba(0,0,0,.15) !important;
  }
  .klaro .cookie-notice .cn-body {
    flex: 1 !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .klaro .cookie-notice .cn-body p {
    font-family: 'Instrument Sans', system-ui, sans-serif !important;
    font-size: 13px !important;
    color: rgba(255,255,255,.7) !important;
    margin: 0 !important;
    line-height: 1.5 !important;
  }
  .klaro .cookie-notice .cn-body p.cn-changes {
    display: none !important;
  }
  .klaro .cookie-notice .cn-buttons {
    display: flex !important;
    gap: 8px !important;
    flex-shrink: 0 !important;
  }
  .klaro .cookie-notice button.cm-btn {
    font-family: 'Instrument Sans', system-ui, sans-serif !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    letter-spacing: .06em !important;
    padding: 9px 18px !important;
    border-radius: 4px !important;
    border: 1px solid rgba(255,255,255,.2) !important;
    cursor: pointer !important;
    transition: all .2s !important;
    white-space: nowrap !important;
  }
  .klaro .cookie-notice button.cm-btn-accept-all {
    background: #B8962E !important;
    color: #1A1A1A !important;
    border-color: #B8962E !important;
  }
  .klaro .cookie-notice button.cm-btn-accept-all:hover {
    background: #D4B86A !important;
    border-color: #D4B86A !important;
  }
  .klaro .cookie-notice button.cm-btn-decline {
    background: transparent !important;
    color: rgba(255,255,255,.55) !important;
  }
  .klaro .cookie-notice button.cm-btn-decline:hover {
    color: #fff !important;
    border-color: rgba(255,255,255,.4) !important;
  }
  .klaro .cookie-notice a.cn-learn-more {
    color: #B8962E !important;
    font-size: 12px !important;
    text-decoration: none !important;
    white-space: nowrap !important;
  }
  .klaro .cookie-notice a.cn-learn-more:hover {
    text-decoration: underline !important;
  }
  @media(max-width:640px) {
    .klaro .cookie-notice {
      flex-direction: column !important;
      align-items: flex-start !important;
      padding: 16px 20px !important;
      gap: 12px !important;
    }
    .klaro .cookie-notice .cn-buttons {
      width: 100% !important;
    }
    .klaro .cookie-notice button.cm-btn {
      flex: 1 !important;
    }
  }
`;
document.head.appendChild(klaroStyle);

var klaroConfig = {    version: 1,

    // Storage key for consent decisions
    storageKey: 'klaro-aeoreport',

    // Show banner on first visit
    noticeAsModal: false,

    // Language
    lang: 'de',

    // Position of the banner
    elementID: 'klaro',

    // Styling
    styling: {
        theme: ['light', 'bottom', 'wide'],
    },

    // Hide "Decline all" button — user must make active choice
    hideDeclineAll: false,

    // Show learn more link
    acceptAll: true,

    // Cookie name for storing consent
    cookieName: 'klaro-aeoreport',

    // Cookie expiry in days
    cookieExpiresAfterDays: 365,

    // Custom translations
    translations: {
        de: {
            consentNotice: {
                title: 'Diese Website verwendet Cookies',
                description: 'Wir verwenden Google Analytics um zu verstehen, wie Besucher unsere Website nutzen. Ihre Daten werden anonymisiert verarbeitet.',
                learnMore: 'Mehr erfahren',
            },
            consentModal: {
                title: 'Cookie-Einstellungen',
                description: 'Hier können Sie einsehen und anpassen, welche Informationen wir über Sie sammeln. Einträge die als "Immer aktiv" gekennzeichnet sind, sind für den Betrieb der Website erforderlich.',
                privacyPolicy: {
                    name: 'Datenschutzerklärung',
                    text: 'Mehr erfahren Sie in unserer {privacyPolicy}.',
                },
            },
            acceptAll: 'Alle akzeptieren',
            acceptSelected: 'Auswahl speichern',
            decline: 'Ablehnen',
            close: 'Schließen',
            ok: 'OK',
            purposes: {
                analytics: 'Analyse',
            },
            service: {
                disableAll: {
                    title: 'Alle deaktivieren',
                    description: 'Alle Dienste deaktivieren.',
                },
                optOut: {
                    title: '(opt-out)',
                    description: 'Dieser Dienst ist standardmäßig aktiv. Sie können ihn deaktivieren.',
                },
                required: {
                    title: '(immer aktiv)',
                    description: 'Dieser Dienst ist für den Betrieb der Website erforderlich.',
                },
                purposes: 'Zwecke',
                purpose: 'Zweck',
            },
        },
    },

    // Services requiring consent
    services: [
        {
            name: 'google-analytics',
            title: 'Google Analytics',
            purposes: ['analytics'],
            default: false,
            required: false,
            optOut: false,

            // This callback fires when consent changes
            // When consent is given: GA loads. When withdrawn: GA is blocked.
            onAccept: `
                // Enable Google Analytics
                window['ga-disable-G-XTSBJ44QEB'] = false;
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            `,
            onDecline: `
                // Disable Google Analytics
                window['ga-disable-G-XTSBJ44QEB'] = true;
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            `,

            cookies: [
                [/^_ga/, '/'],
                [/^_gid/, '/'],
                [/^_gat/, '/'],
            ],
        },
    ],
};

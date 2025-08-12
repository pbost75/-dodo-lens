import type { Metadata } from "next";
import { Roboto_Slab, Lato } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';

// Polices cohérentes avec l'écosystème Dodomove
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Éviter le zoom sur les formulaires
};

export const metadata: Metadata = {
  title: "DodoLens - Calculateur vidéo IA | Dodomove",
  description: "Calculateur de volume révolutionnaire : filmez votre intérieur, commentez à l'oral, obtenez instantanément votre estimation de déménagement grâce à l'IA.",
  keywords: "calculateur volume, déménagement, vidéo, IA, intelligence artificielle, DOM-TOM, estimation, Dodomove",
  authors: [{ name: "Équipe Dodomove" }],
  
  // Open Graph pour les partages sociaux
  openGraph: {
    title: "DodoLens - Calculateur vidéo IA",
    description: "Révolutionnez votre estimation de déménagement : filmez et commentez votre intérieur, l'IA fait le reste !",
    type: "website",
    locale: "fr_FR",
    url: "https://dodo-lens.dodomove.fr",
    siteName: "DodoLens",
    images: [
      {
        url: '/images/dodo-lens-og.jpg',
        width: 1200,
        height: 630,
        alt: 'DodoLens - Calculateur vidéo IA pour déménagement',
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: "DodoLens - Calculateur vidéo IA",
    description: "Filmez votre intérieur, commentez à l'oral, obtenez votre estimation de déménagement instantanément !",
    images: ['/images/dodo-lens-og.jpg'],
    creator: '@dodomove',
  },
  
  // Icônes cohérentes avec l'écosystème
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
      { url: '/images/dodo-lens-icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/dodo-lens-icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/dodo-lens-icon-512x512.png',
  },
  
  // PWA Manifest
  manifest: '/manifest.json',
  

  
  // Meta tags spéciaux pour iOS
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'DodoLens',
    'mobile-web-app-capable': 'yes',
    'format-detection': 'telephone=no', // Éviter la détection automatique des numéros
  },
  
  // Robots et indexation
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Base URL pour les liens relatifs
  metadataBase: new URL('https://dodo-lens.dodomove.fr'),
  
  // Données structurées
  alternates: {
    canonical: 'https://dodo-lens.dodomove.fr',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${robotoSlab.variable} ${lato.variable}`}>
      <head>
        {/* Preconnect pour les APIs externes */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://web-production-7b738.up.railway.app" />
        
        {/* DNS prefetch pour les domaines de l'écosystème */}
        <link rel="dns-prefetch" href="//devis.dodomove.fr" />
        <link rel="dns-prefetch" href="//partage.dodomove.fr" />
        <link rel="dns-prefetch" href="//dodomove.fr" />
        
        {/* Meta tags pour les capacités media */}
        <meta name="media-devices" content="camera, microphone" />
        
        {/* Theme color pour l'interface mobile */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        
        {/* Preload des polices critiques */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;600;700&family=Lato:wght@300;400;700&display=swap"
          as="style"
        />
      </head>
      <body className="font-lato antialiased" suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
        
        {/* Scripts pour les PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enregistrer le service worker si disponible
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed');
                    });
                });
              }
              
              // Détecter les capacités du navigateur
              window.DodoLens = window.DodoLens || {};
              window.DodoLens.capabilities = {
                mediaRecorder: 'MediaRecorder' in window,
                speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
                getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
                webRTC: 'RTCPeerConnection' in window,
                indexedDB: 'indexedDB' in window,
                serviceWorker: 'serviceWorker' in navigator,
                pushManager: 'PushManager' in window,
                notifications: 'Notification' in window,
              };
              
              // Debug mode si activé
              if (${process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'}) {
                console.log('🎬 DodoLens Debug Mode activé');
                console.log('🔧 Capacités détectées:', window.DodoLens.capabilities);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

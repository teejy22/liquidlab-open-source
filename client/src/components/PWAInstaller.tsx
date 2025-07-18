import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallerProps {
  platformName?: string;
}

export function PWAInstaller({ platformName = "LiquidLab" }: PWAInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
          
          // SECURITY: Implement cache expiration check
          setInterval(() => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_EXPIRATION_CHECK'
              });
            }
          }, 30 * 60 * 1000); // Check every 30 minutes
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    // SECURITY: Clear service worker cache on logout
    const handleLogout = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE'
        });
      }
    };
    
    // Listen for logout events
    window.addEventListener('user-logout', handleLogout);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      toast({
        title: "App Installed!",
        description: `${platformName} has been added to your home screen.`,
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, [toast, platformName]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for 7 days
    setTimeout(() => {
      if (deferredPrompt) {
        setShowInstallBanner(true);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showInstallBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#0d0d0d] border border-gray-800 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Download className="w-5 h-5 text-[#1dd1a1] mt-0.5" />
          <div>
            <h3 className="font-semibold text-white">Install {platformName}</h3>
            <p className="text-sm text-gray-400 mt-1">
              Add to your home screen for the best trading experience
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button
          onClick={handleInstallClick}
          className="flex-1 bg-[#1dd1a1] hover:bg-[#1ab894] text-black"
        >
          Install App
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-900 dark:text-gray-200 hover:text-white"
        >
          Not Now
        </Button>
      </div>
    </div>
  );
}
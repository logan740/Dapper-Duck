"use client";

import { useState, useEffect } from "react";
import { RainbowWalletButton } from "@/components/rainbow-wallet-button";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Settings, 
  User, 
  Play, 
  Star, 
  Zap, 
  Shield, 
  Gamepad2,
  Twitter,
  Github,
  ExternalLink,
  Edit,
  Camera
} from "lucide-react";

// Extend Window interface to include game functions
declare global {
  interface Window {
    getProfileData?: () => any;
    updateProfileName?: (name: string) => void;
    updateProfilePicture?: (picture: string) => void;
    updateSocialLinks?: (links: any) => void;
    setWalletAddress?: (address: string | undefined) => void;
  }
}

type TabType = 'home' | 'leaderboard' | 'settings' | 'profile';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
  isPaid?: boolean;
  profilePicture?: string;
  socials?: {
    x?: string;
    discord?: string;
  };
}

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);
  
  // Wallet integration
  const { isConnected, address } = useAccount();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    x: '',
    discord: ''
  });
  const [isClient, setIsClient] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [settings, setSettings] = useState({
    soundEffects: true,
    backgroundMusic: true,
    quality: 'high',
    particleEffects: true,
    touchSensitivity: 'medium',
    hapticFeedback: true,
  });
  const [weeklyPool, setWeeklyPool] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState(0);

  // Refresh stats when returning to profile tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      setStatsRefresh(prev => prev + 1);
    }
    if (tab === 'leaderboard') {
      // Force re-render of leaderboard data
      setStatsRefresh(prev => prev + 1);
    }
  };

  const handlePlayGame = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/game';
    }, 500);
  };


  // Profile management functions
  const loadProfileData = () => {
    if (typeof window !== 'undefined') {
      try {
        console.log('Loading profile data, wallet address:', address);
        
        // Create wallet-specific profile key
        const profileKey = address ? `dapperDuck_profile_${address}` : 'dapperDuck_profile_anonymous';
        
        // Try to get profile data from localStorage directly
        const profileData = localStorage.getItem(profileKey);
        if (profileData) {
          const data = JSON.parse(profileData);
          console.log('Loading profile data from localStorage for wallet:', address, data);
          console.log('Setting profile name to:', data.name);
          console.log('Setting profile picture to:', data.picture ? 'has picture' : 'no picture');
          console.log('Profile picture data:', data.picture ? data.picture.substring(0, 50) + '...' : 'none');
          setProfileName(data.name || '');
          setProfilePicture(data.picture || '');
          setSocialLinks(data.socials || {
            x: '',
            discord: ''
          });
        } else {
          // If no wallet is connected, use anonymous/default profile
          if (!address) {
            console.log('No wallet connected, using anonymous profile');
            setProfileName('');
            setProfilePicture('');
            setSocialLinks({
              x: '',
              discord: ''
            });
            return; // Exit early for anonymous profile
          }
          
          // Fallback to legacy profile if no wallet-specific profile exists
          const legacyProfile = localStorage.getItem('dapperDuck_profile');
          if (legacyProfile) {
            const data = JSON.parse(legacyProfile);
            console.log('Loading legacy profile data:', data);
            setProfileName(data.name || '');
            setProfilePicture(data.picture || '');
            setSocialLinks(data.socials || {
              x: '',
              discord: ''
            });
          } else if (window.getProfileData) {
            // Final fallback to window function if available
            const data = window.getProfileData();
            console.log('Loading profile data from window function:', data);
            setProfileName(data.name || '');
            setProfilePicture(data.picture || '');
            setSocialLinks(data.socials || {
              x: '',
              discord: ''
            });
          } else {
            // No profile data found, reset to defaults
            console.log('No profile data found, using defaults');
            setProfileName('');
            setProfilePicture('');
            setSocialLinks({
              x: '',
              discord: ''
            });
          }
        }
      } catch (error) {
        console.log('Error loading profile data:', error);
        // Reset to defaults on error
        setProfileName('');
        setProfilePicture('');
        setSocialLinks({
          x: '',
          discord: ''
        });
      }
    }
  };

  const saveProfile = () => {
    if (typeof window !== 'undefined') {
      console.log('Saving profile with wallet address:', address);
      console.log('Profile data to save:', { profileName, profilePicture, socialLinks });
      
      try {
        // Validate profile data
        if (!profileName.trim() && !profilePicture && !socialLinks.x && !socialLinks.discord) {
          alert('Please enter at least one piece of profile information.');
          return;
        }

        // Create wallet-specific profile key
        const profileKey = address ? `dapperDuck_profile_${address}` : 'dapperDuck_profile_anonymous';
        console.log('Using profile key:', profileKey);
        
        // Save directly to localStorage with wallet-specific key
        const profileData = {
          name: profileName ? profileName.trim() : '',
          picture: profilePicture || '',
          socials: socialLinks || { x: '', discord: '' },
          walletAddress: address || null, // Store wallet address for reference
          lastUpdated: Date.now()
        };
        
        // Validate the data before saving
        const jsonString = JSON.stringify(profileData);
        if (!jsonString) {
          throw new Error('Failed to serialize profile data');
        }
        
        // Test localStorage availability and check current usage
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          console.log('localStorage is working');
          
          // Check current localStorage usage
          let totalSize = 0;
          const allKeys = Object.keys(localStorage);
          console.log('Current localStorage keys:', allKeys);
          
          allKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
              totalSize += key.length + value.length;
              console.log(`Key: ${key}, Size: ${value.length} chars`);
            }
          });
          
          console.log(`Total localStorage usage: ${totalSize} characters (${(totalSize / 1024).toFixed(2)} KB)`);
          console.log(`Profile data size: ${jsonString.length} characters (${(jsonString.length / 1024).toFixed(2)} KB)`);
          
        } catch (testError) {
          console.error('localStorage test failed:', testError);
          alert('localStorage is not available. Please check your browser settings.');
          return;
        }
        
        // Check if data is too large for localStorage (1MB limit for safety)
        let finalProfileData = profileData;
        let finalJsonString = jsonString;
        
        if (jsonString.length > 1024 * 1024) {
          console.log(`Profile data is ${(jsonString.length / 1024).toFixed(2)} KB, which is too large`);
          
          // If it's just the picture causing the issue, try without it
          if (profilePicture) {
            console.log('Profile picture is too large, trying without it...');
            const profileDataWithoutPicture = {
              name: profileName ? profileName.trim() : '',
              picture: '', // Remove picture
              socials: socialLinks || { x: '', discord: '' },
              walletAddress: address || null,
              lastUpdated: Date.now()
            };
            
            const jsonStringWithoutPicture = JSON.stringify(profileDataWithoutPicture);
            console.log(`Profile data without picture: ${(jsonStringWithoutPicture.length / 1024).toFixed(2)} KB`);
            
            if (jsonStringWithoutPicture.length < 1024 * 1024) {
              // Use the data without picture
              finalProfileData = profileDataWithoutPicture;
              finalJsonString = jsonStringWithoutPicture;
              setProfilePicture(''); // Update state
              console.log('Using profile data without picture');
            } else {
              throw new Error('Profile data is too large even without picture. Please reduce the amount of text data.');
            }
          } else {
            throw new Error('Profile data is too large. Please reduce the amount of text data.');
          }
        }

        // Smart cleanup that preserves Portal XP tracking data
        console.log('Performing smart localStorage cleanup...');
        try {
          // Only clear old profile data from other wallets (keep current + 1 most recent)
          const allKeys = Object.keys(localStorage);
          const profileKeys = allKeys.filter(key => key.startsWith('dapperDuck_profile_') && key !== profileKey);
          
          if (profileKeys.length > 1) {
            // Get timestamps and keep only 1 most recent
            const profileDataWithTime = profileKeys.map(key => {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                return { key, timestamp: data.lastUpdated || 0 };
              } catch {
                return { key, timestamp: 0 };
              }
            });
            
            profileDataWithTime.sort((a, b) => b.timestamp - a.timestamp);
            const keysToRemove = profileDataWithTime.slice(1).map(item => item.key);
            
            keysToRemove.forEach(key => {
              localStorage.removeItem(key);
              console.log('Removed old profile:', key);
            });
          }
          
          // Clear old leaderboard entries (keep only top 10)
          const leaderboard = JSON.parse(localStorage.getItem('dapperDuck_leaderboard') || '[]');
          if (leaderboard.length > 10) {
            const top10 = leaderboard.slice(0, 10);
            localStorage.setItem('dapperDuck_leaderboard', JSON.stringify(top10));
            console.log('Cleared old leaderboard entries, kept top 10');
          }
          
          // DO NOT clear game activity or XP events - Portal needs these!
          console.log('Preserved all game activity and XP events for Portal tracking');
          
        } catch (cleanupError) {
          console.warn('Failed to cleanup old data:', cleanupError);
        }
        
        // Try to save after aggressive cleanup
        try {
          localStorage.setItem(profileKey, finalJsonString);
          console.log('Profile saved to localStorage for wallet:', address, finalProfileData);
          
          // Also save to legacy key for backward compatibility (optional)
          try {
            localStorage.setItem('dapperDuck_profile', finalJsonString);
            console.log('Profile also saved to legacy key');
          } catch (legacyError) {
            console.warn('Failed to save to legacy key (not critical):', legacyError);
          }
          
        } catch (storageError) {
          console.error('Storage error after cleanup:', storageError);
          
          // If still failing, try one more desperate cleanup
          console.log('Still failing, trying desperate cleanup...');
          
          // Remove everything except essential data (preserve Portal tracking data)
          const allKeys = Object.keys(localStorage);
          const essentialKeys = [
            'dapperDuck_profile', 
            profileKey, 
            'dapperDuck_gameActivity',  // Keep for Portal
            'dapperDuck_xpEvents'       // Keep for Portal
          ];
          
          allKeys.forEach(key => {
            if (!essentialKeys.includes(key) && key.startsWith('dapperDuck_')) {
              localStorage.removeItem(key);
              console.log('Removed:', key);
            }
          });
          
          // Try one final save
          try {
            localStorage.setItem(profileKey, jsonString);
            console.log('Final save attempt successful');
          } catch (finalError) {
            console.error('Final save attempt failed:', finalError);
            
            // Last resort: try saving without profile picture
            if (profilePicture) {
              console.log('Trying to save without profile picture...');
              const profileDataWithoutPicture = {
                name: profileName ? profileName.trim() : '',
                picture: '', // Remove picture
                socials: socialLinks || { x: '', discord: '' },
                walletAddress: address || null,
                lastUpdated: Date.now()
              };
              
              const jsonStringWithoutPicture = JSON.stringify(profileDataWithoutPicture);
              
              try {
                localStorage.setItem(profileKey, jsonStringWithoutPicture);
                console.log('Profile saved without picture');
                
                // Update the state to reflect the change
                setProfilePicture('');
                alert('Profile saved successfully, but the profile picture was removed due to storage limitations.');
                return;
              } catch (noPictureError) {
                console.error('Even without picture, save failed:', noPictureError);
                throw new Error('Unable to save profile. localStorage is completely full. Please clear your browser data or try a different browser.');
              }
            } else {
              throw new Error('Unable to save profile. localStorage is completely full. Please clear your browser data or try a different browser.');
            }
          }
        }
        
        // Also try to use window functions if available (optional)
        try {
          if (typeof window.updateProfileName === 'function' && profileName.trim()) {
            window.updateProfileName(profileName.trim());
            console.log('Updated profile name via window function');
          }
          if (typeof window.updateProfilePicture === 'function' && profilePicture) {
            window.updateProfilePicture(profilePicture);
            console.log('Updated profile picture via window function');
          }
          if (typeof window.updateSocialLinks === 'function') {
            window.updateSocialLinks(socialLinks);
            console.log('Updated social links via window function');
          }
        } catch (windowError) {
          console.warn('Window functions not available yet (game.js may not be loaded):', windowError);
          // This is not a critical error, profile is still saved to localStorage
        }
        
        setIsEditingProfile(false);
        setStatsRefresh(prev => prev + 1);
        
        // Show success message
        alert('Profile saved successfully!');
        
        // Verify save
        setTimeout(() => {
          const saved = localStorage.getItem(profileKey);
          const legacySaved = localStorage.getItem('dapperDuck_profile');
          console.log('Verification - wallet-specific save:', saved);
          console.log('Verification - legacy save:', legacySaved);
          
          if (saved) {
            const parsed = JSON.parse(saved);
            console.log('Profile saved successfully:', parsed);
            console.log('Saved name specifically:', parsed.name);
          }
        }, 100);
      } catch (error) {
        console.error('Error saving profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', {
          message: errorMessage,
          stack: errorStack,
          profileName,
          profilePicture: profilePicture ? 'has picture' : 'no picture',
          socialLinks,
          address
        });
        alert(`Error saving profile: ${errorMessage}. Please check the console for details.`);
      }
    } else {
      console.error('Window is not available');
      alert('Error: Window is not available');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Image file selected:', file.name, file.size, file.type);
      
      // Check file size (max 10MB - we'll compress it anyway)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image is too large. Please choose an image smaller than 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File read successfully, length:', result.length);
        
        // Compress the image
        compressImage(result, (compressedDataUrl) => {
          console.log('Image compressed, new length:', compressedDataUrl.length);
          setProfilePicture(compressedDataUrl);
        });
      };
      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        alert('Error reading image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (dataUrl: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        callback(dataUrl); // Fallback to original
        return;
      }

      // Calculate new dimensions (max 150x150 for better quality but still compressed)
      const maxSize = 150;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels to get under 500KB
      let quality = 0.7;
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // If still too large, reduce quality further
      while (compressedDataUrl.length > 500000 && quality > 0.1) { // 500KB limit
        quality -= 0.1;
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      // If still too large, reduce size further
      if (compressedDataUrl.length > 500000) {
        const smallerSize = Math.max(80, maxSize * 0.7);
        canvas.width = smallerSize;
        canvas.height = smallerSize;
        ctx.drawImage(img, 0, 0, smallerSize, smallerSize);
        compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
      }
      
      console.log(`Image compressed: ${dataUrl.length} → ${compressedDataUrl.length} characters (${(compressedDataUrl.length / 1024).toFixed(1)}KB)`);
      callback(compressedDataUrl);
    };
    
    img.onerror = () => {
      console.warn('Image compression failed, using original');
      callback(dataUrl);
    };
    
    img.src = dataUrl;
  };


  // Load revenue data
  const loadRevenueData = () => {
    if (typeof window !== 'undefined') {
      try {
        const revenueData = localStorage.getItem('dapperDuck_revenue');
        if (revenueData) {
          const data = JSON.parse(revenueData);
          setWeeklyPool(data.weeklyPool || 0);
          setTreasuryBalance(data.treasuryBalance || 0);
        }
      } catch (error) {
        console.log('Error loading revenue data:', error);
      }
    }
  };

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
    loadRevenueData();
    
    // Listen for revenue updates from game
    const handleRevenueUpdate = (event: any) => {
      setWeeklyPool(event.detail.weeklyPool);
      setTreasuryBalance(event.detail.treasuryBalance);
    };
    
    window.addEventListener('revenueUpdated', handleRevenueUpdate);
    
    return () => {
      window.removeEventListener('revenueUpdated', handleRevenueUpdate);
    };
  }, []);

  // Load profile data when component mounts and client is ready
  useEffect(() => {
    if (isClient) {
      loadProfileData();
    }
  }, [isClient]);

  // Load profile data when switching to profile tab
  useEffect(() => {
    if (isClient && activeTab === 'profile') {
      loadProfileData();
    }
  }, [activeTab, isClient]);

  // Reload profile data when wallet address changes
  useEffect(() => {
    if (isClient) {
      loadProfileData();
    }
  }, [address, isClient]);

  // Pass wallet address to game
  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && window.setWalletAddress) {
      window.setWalletAddress(address);
    }
  }, [address, isClient]);

  // Set up window function for game.js to access profile data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.getProfileData = () => {
        // Create wallet-specific profile key
        const profileKey = address ? `dapperDuck_profile_${address}` : 'dapperDuck_profile_anonymous';
        
        try {
          // Get profile data from localStorage directly
          const profileData = localStorage.getItem(profileKey);
          if (profileData) {
            const data = JSON.parse(profileData);
            console.log('getProfileData returning from localStorage:', data);
            return data;
          }
        } catch (error) {
          console.error('Error getting profile data:', error);
        }
        
        // Return current state as fallback
        const fallbackData = {
          name: profileName || '',
          picture: profilePicture || '',
          socials: socialLinks || { x: '', discord: '' }
        };
        console.log('getProfileData returning fallback:', fallbackData);
        return fallbackData;
      };
      
      // Also set it immediately on window object to ensure it's available
      console.log('Setting up window.getProfileData function');
    }
  }, [address, profileName, profilePicture, socialLinks]);

  // Additional effect to ensure the function is available immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      // Force set the function again to ensure it's available
      window.getProfileData = () => {
        const profileKey = address ? `dapperDuck_profile_${address}` : 'dapperDuck_profile_anonymous';
        try {
          const profileData = localStorage.getItem(profileKey);
          if (profileData) {
            return JSON.parse(profileData);
          }
        } catch (error) {
          console.error('Error getting profile data:', error);
        }
        return {
          name: profileName || '',
          picture: profilePicture || '',
          socials: socialLinks || { x: '', discord: '' }
        };
      };
      console.log('getProfileData function set up, address:', address);
    }
  }, [isClient, address]);

  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Gamepad2 },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Smooth gameplay with responsive controls"
    },
    {
      icon: Shield,
      title: "Web3 Integrated",
      description: "Connect your Abstract wallet for blockchain features"
    },
    {
      icon: Star,
      title: "Progressive Difficulty",
      description: "Game gets harder as you survive longer"
    }
  ];

  const renderHomeContent = () => (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-12 relative">
        {/* Hero Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="relative group">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 scale-150"></div>
              
              {/* Main duck image */}
              <div className="relative">
                <img 
                  src="/assets/duck.png" 
                  alt="Dapper Duck" 
                  className="w-40 h-40 mx-auto drop-shadow-2xl animate-bounce hover:scale-110 transition-transform duration-500"
                />
                
                {/* Floating elements around duck */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-1/2 -left-6 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-ping">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-orange-400 via-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent leading-tight">
              DAPPER DUCK
            </h1>
            <div className="space-y-4">
              <p className="text-2xl md:text-3xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed">
                The Ultimate <span className="text-orange-400 font-bold">Web3 Gaming</span> Experience
              </p>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Collect Meme Snacks • Dodge FUD Bags • Avoid Zero-Score FUD • Survive the Crypto Chaos
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
          <Button 
            onClick={handlePlayGame}
            disabled={isLoading}
            size="lg" 
            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20"
          >
            {isLoading ? (
              <>
                <div className="w-8 h-8 mr-3 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading Game...
              </>
            ) : (
              <>
                <Play className="w-8 h-8 mr-3" />
                Start Playing
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowFeaturesModal(true)}
            className="px-12 py-6 text-xl border-2 border-white/50 text-white bg-white/5 hover:bg-white/10 hover:border-white/70 transition-all duration-300 backdrop-blur-sm"
          >
            <ExternalLink className="w-6 h-6 mr-3" />
            View Features
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group text-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <feature.icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
            <p className="text-gray-300 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Power-ups Showcase */}
      <section className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 rounded-3xl p-12 border border-white/10 backdrop-blur-xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">⚡ Power-up System</h2>
          <p className="text-xl text-gray-300">Collect special abilities to dominate the crypto chaos</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shield</h3>
            <p className="text-sm text-gray-400">5s invincibility</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2x Score</h3>
            <p className="text-sm text-gray-400">Double points</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Slow Mo</h3>
            <p className="text-sm text-gray-400">Time warp</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🧲</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Magnet</h3>
            <p className="text-sm text-gray-400">Attract snacks</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderLeaderboard = () => {
    // Get real leaderboard data from localStorage directly (more reliable than window function)
    const leaderboardData: LeaderboardEntry[] = isClient ? (() => {
      try {
        const saved = localStorage.getItem('dapperDuck_leaderboard');
        console.log('Raw leaderboard data from localStorage:', saved);
        if (saved) {
          const data = JSON.parse(saved);
          console.log('Parsed leaderboard data:', data);
          console.log('Leaderboard length:', data.length);
          console.log('First entry profile picture:', data[0]?.profilePicture);
          console.log('First entry name:', data[0]?.name);
          return data;
        } else {
          console.log('No leaderboard data found in localStorage');
        }
      } catch (error) {
        console.log('Error loading leaderboard:', error);
      }
      return [];
    })() : [];
    
    // Force re-render when statsRefresh or profile data changes
    const _ = statsRefresh;
    const __ = profileName; // Also refresh when profile name changes
    
    // Separate paid and unpaid users
    const paidUsers = leaderboardData.filter(player => player.isPaid === true);
    const unpaidUsers = leaderboardData.filter(player => player.isPaid !== true);
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">🏆 Leaderboards</h2>
          <p className="text-xl text-gray-300">Top players across all categories</p>
        </div>

        {/* Paid Users Leaderboard */}
        <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 rounded-3xl p-8 border border-purple-400/20 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="text-3xl mr-3">💎</span>
              Premium Leaderboard
            </h3>
            <p className="text-gray-300">Top paid players with exclusive rewards</p>
          </div>

          {paidUsers.length > 0 ? (
            <div className="space-y-3">
              {paidUsers.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                    index < 3 
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center",
                        index === 0 ? "border-yellow-400" :
                        index === 1 ? "border-gray-300" :
                        index === 2 ? "border-purple-400" :
                        "border-purple-400"
                      )}>
                        {player.profilePicture ? (
                          <img 
                            src={player.profilePicture} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to rank number if image fails
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="font-bold text-white text-lg">${index + 1}</span>`;
                                parent.className = parent.className.replace('overflow-hidden', '');
                              }
                            }}
                          />
                        ) : (
                          <span className="font-bold text-white text-lg">{index + 1}</span>
                        )}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Trophy className="w-2 h-2 text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-lg">{player.name}</span>
                        <span className="text-purple-400">💎</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {new Date(player.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">{player.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Premium Players Yet</h4>
              <p className="text-gray-300 text-sm">Be the first premium player to top this leaderboard!</p>
            </div>
          )}
        </div>

        {/* Free Users Leaderboard */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="text-3xl mr-3">🆓</span>
              Free Leaderboard
            </h3>
            <p className="text-gray-300">Top free-to-play players</p>
          </div>

          {unpaidUsers.length > 0 ? (
            <div className="space-y-3">
              {unpaidUsers.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                    index < 3 
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center",
                        index === 0 ? "border-yellow-400" :
                        index === 1 ? "border-gray-300" :
                        index === 2 ? "border-orange-400" :
                        "border-orange-400"
                      )}>
                        {player.profilePicture ? (
                          <img 
                            src={player.profilePicture} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to rank number if image fails
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="font-bold text-white text-lg">${index + 1}</span>`;
                                parent.className = parent.className.replace('overflow-hidden', '');
                              }
                            }}
                          />
                        ) : (
                          <span className="font-bold text-white text-lg">{index + 1}</span>
                        )}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Trophy className="w-2 h-2 text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-lg">{player.name}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {new Date(player.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">{player.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Scores Yet!</h4>
              <p className="text-gray-300 text-sm mb-4">Be the first to set a high score!</p>
              <Button 
                onClick={handlePlayGame}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Playing
              </Button>
            </div>
          )}
        </div>

        {/* Memecoin Reward System */}
        <div className="bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 rounded-3xl p-8 border border-yellow-400/20 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="text-3xl mr-3">🪙</span>
              Weekly Memecoin Rewards
            </h3>
            <p className="text-gray-300">Top 15 players earn memecoins from paid game revenue</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Revenue Distribution
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Player Rewards (50%)</span>
                  <span className="text-yellow-400 font-bold">Top 15 Players</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Treasury (50%)</span>
                  <span className="text-blue-400 font-bold">Dev & Marketing</span>
                </div>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-400 font-semibold">This Week's Pool</span>
                    <span className="text-orange-400 font-bold">{weeklyPool.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-400 font-semibold">Treasury Balance</span>
                    <span className="text-blue-400 font-bold">{treasuryBalance.toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                Top 15 Rewards
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">1st Place</span>
                  <span className="text-yellow-400 font-bold">25% of pool</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">2nd-3rd Place</span>
                  <span className="text-gray-400 font-bold">15% each</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">4th-6th Place</span>
                  <span className="text-gray-400 font-bold">8% each</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">7th-15th Place</span>
                  <span className="text-gray-400 font-bold">3% each</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-indigo-900/30 rounded-3xl p-8 border border-cyan-400/20 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="text-3xl mr-3">🌍</span>
              Community Stats
            </h3>
            <p className="text-gray-300">See how the Dapper Duck community is performing</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Active Players</h4>
              <p className="text-3xl font-bold text-cyan-400 mb-1">1,247</p>
              <p className="text-gray-300 text-sm">+23 this week</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Games Played</h4>
              <p className="text-3xl font-bold text-green-400 mb-1">15,892</p>
              <p className="text-gray-300 text-sm">Today</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Premium Games</h4>
              <p className="text-3xl font-bold text-purple-400 mb-1">3,456</p>
              <p className="text-gray-300 text-sm">This week</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">High Score</h4>
              <p className="text-3xl font-bold text-orange-400 mb-1">12,847</p>
              <p className="text-gray-300 text-sm">All time</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Live stats updated every minute</div>
            <div className="text-lg font-bold text-white">Join the community and compete! 🚀</div>
          </div>
        </div>


        {/* Coming Soon Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Daily Challenges</h3>
            </div>
            <p className="text-gray-300 text-sm">Complete daily missions to earn bonus rewards and climb the ranks faster.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Achievement System</h3>
            </div>
            <p className="text-gray-300 text-sm">Unlock special badges and titles as you master different aspects of the game.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">⚙️ Settings</h2>
        <p className="text-xl text-gray-300">Customize your gaming experience</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-white">Audio</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Sound Effects</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
                className={settings.soundEffects ? "bg-green-100 border-green-300" : ""}
              >
                {settings.soundEffects ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Background Music</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, backgroundMusic: !prev.backgroundMusic }))}
                className={settings.backgroundMusic ? "bg-green-100 border-green-300" : ""}
              >
                {settings.backgroundMusic ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-white">Graphics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Quality</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  quality: prev.quality === 'high' ? 'medium' : prev.quality === 'medium' ? 'low' : 'high'
                }))}
              >
                {settings.quality.charAt(0).toUpperCase() + settings.quality.slice(1)}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Particle Effects</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, particleEffects: !prev.particleEffects }))}
                className={settings.particleEffects ? "bg-green-100 border-green-300" : ""}
              >
                {settings.particleEffects ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-white">Controls</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Touch Sensitivity</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  touchSensitivity: prev.touchSensitivity === 'low' ? 'medium' : prev.touchSensitivity === 'medium' ? 'high' : 'low'
                }))}
              >
                {settings.touchSensitivity.charAt(0).toUpperCase() + settings.touchSensitivity.slice(1)}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Haptic Feedback</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }))}
                className={settings.hapticFeedback ? "bg-green-100 border-green-300" : ""}
              >
                {settings.hapticFeedback ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    // Get stats from localStorage only if wallet is connected
    const gameStats = isClient && isConnected && address ? (() => {
      try {
        const saved = localStorage.getItem('dapperDuckStats');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.log('Error loading game stats:', error);
      }
      return {
        gamesPlayed: 0,
        bestScore: 0,
        totalSnacks: 0,
        totalFudDodged: 0,
        totalPlayTime: 0,
        powerupsCollected: 0,
        achievements: []
      };
    })() : {
      // Anonymous players see empty stats
      gamesPlayed: 0,
      bestScore: 0,
      totalSnacks: 0,
      totalFudDodged: 0,
      totalPlayTime: 0,
      powerupsCollected: 0,
      achievements: []
    };
    
    // Get profile data from state (loaded on component mount)
    const profileData = isClient ? {
      name: profileName,
      picture: profilePicture,
      socials: socialLinks
    } : {
      name: '',
      picture: '',
      socials: { x: '', discord: '' }
    };
    
    // Force re-render when stats change
    const _ = statsRefresh;

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const achievements = [
      { id: 'first_thousand', name: 'First Thousand', icon: '🎯', description: 'Score 1000+ points' },
      { id: 'high_scorer', name: 'High Scorer', icon: '🏆', description: 'Score 5000+ points' },
      { id: 'survivor', name: 'Survivor', icon: '⏰', description: 'Survive 30+ seconds' },
      { id: 'snack_master', name: 'Snack Master', icon: '🍿', description: 'Collect 100+ snacks' },
      { id: 'fud_slayer', name: 'FUD Slayer', icon: '🛡️', description: 'Dodge 500+ FUD bags' },
      { id: 'powerup_collector', name: 'Power-up Collector', icon: '⚡', description: 'Collect 50+ power-ups' }
    ];

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">👤 Profile</h2>
          <p className="text-xl text-gray-300">Customize your profile and view your gaming statistics</p>
        </div>
        
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Profile image failed to load:', profilePicture);
                      console.log('Image error details:', e);
                      setProfilePicture(''); // Clear the broken image
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully');
                    }}
                  />
                ) : (
                  <span className="text-6xl">🦆</span>
                )}
              </div>
              {isEditingProfile && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-8 h-8 text-white" />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    maxLength={20}
                  />
                  <div className="flex space-x-3">
                    <Button 
                      onClick={saveProfile}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2"
                    >
                      Save Profile
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white">
                    {(() => {
                      console.log('Displaying profile name - profileName:', profileName, 'profileData.name:', profileData.name);
                      if (isConnected && address) {
                        return profileName || profileData.name || 'Dapper Player';
                      } else {
                        return 'Anonymous Player';
                      }
                    })()}
                  </h3>
                  <p className="text-gray-300">
                    {gameStats.gamesPlayed > 0 ? 'Experienced Player' : 'New Player'}
                  </p>
                  
                  {/* Social Links - Moved up here */}
                  {profileData.socials && (profileData.socials.x || profileData.socials.discord) && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {profileData.socials.x && (
                        <a 
                          href={profileData.socials.x} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-3 py-1.5 bg-black/20 border border-gray-400/30 rounded-lg text-gray-300 hover:bg-black/30 transition-colors text-sm"
                        >
                          <span>𝕏</span>
                          <span>X</span>
                        </a>
                      )}
                      {profileData.socials.discord && (
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-300 text-sm">
                          <span>💬</span>
                          <span>{profileData.socials.discord}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Wallet Connection Status */}
                  <div className="flex items-center space-x-2 text-sm mt-3">
                    {isConnected ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400">Wallet Connected</span>
                        <span className="text-gray-400">
                          {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-400">No Wallet Connected</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-center md:justify-start space-x-4">
                    {isConnected && address ? (
                      <Button 
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:border-white/70"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                        Connect wallet to edit profile
                      </div>
                    )}
                    <Button 
                      onClick={() => {
                        console.log('Manually reloading profile data...');
                        loadProfileData();
                        setStatsRefresh(prev => prev + 1);
                      }}
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/70"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Refresh Profile
                    </Button>
                    <RainbowWalletButton />
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Social Links Section */}
        {isEditingProfile && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">Social Links</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">X (Twitter)</label>
                <input
                  type="url"
                  value={socialLinks.x}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, x: e.target.value }))}
                  placeholder="https://x.com/username"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                <input
                  type="text"
                  value={socialLinks.discord}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, discord: e.target.value }))}
                  placeholder="username#1234"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Badges Section */}
        {!isEditingProfile && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">🏆 Collected Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = gameStats.achievements.includes(achievement.id);
                return (
                  <div key={achievement.id} className={`text-center p-4 rounded-xl border-2 transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.name}
                    </div>
                    {isUnlocked && (
                      <div className="text-xs text-yellow-400 mt-1">✓ Earned</div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameStats.achievements.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 opacity-50">🏆</div>
                <p className="text-gray-400">No badges earned yet. Play the game to unlock achievements!</p>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-bold mb-4 text-white">Game Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white">Games Played</span>
                <span className="font-bold text-orange-400">{gameStats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Best Score</span>
                <span className="font-bold text-orange-400">{gameStats.bestScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Snacks Collected</span>
                <span className="font-bold text-yellow-400">{gameStats.totalSnacks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">FUD Dodged</span>
                <span className="font-bold text-red-400">{gameStats.totalFudDodged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Total Play Time</span>
                <span className="font-bold text-blue-400">{formatTime(gameStats.totalPlayTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Power-ups Collected</span>
                <span className="font-bold text-purple-400">{gameStats.powerupsCollected}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-bold mb-4 text-white">Achievements</h4>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const isUnlocked = gameStats.achievements.includes(achievement.id);
                return (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'
                    }`}>
                      <span className={isUnlocked ? '' : 'grayscale'}>{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    </div>
                    {isUnlocked && (
                      <div className="text-green-500 text-sm">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Power-up Stats */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-lg font-bold mb-4">Power-up Collection</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-sm text-gray-600">Shield</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm text-gray-600">2x Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⏰</div>
              <div className="text-sm text-gray-600">Slow Mo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🧲</div>
              <div className="text-sm text-gray-600">Magnet</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'leaderboard':
        return renderLeaderboard();
      case 'settings':
        return renderSettings();
      case 'profile':
        return renderProfile();
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-gradient-to-br from-yellow-400/25 to-orange-500/25 rounded-full blur-xl animate-bounce"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-400/40 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-cyan-400/50 rounded-full animate-ping animation-delay-3000"></div>
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/assets/duck.png" alt="Dapper Duck" className="w-10 h-10 drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Dapper Duck
              </span>
            </div>
            <RainbowWalletButton />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-16 z-40 bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300",
                    activeTab === tab.id
                      ? "border-orange-400 text-orange-400 bg-orange-400/10 rounded-t-lg"
                      : "border-transparent text-gray-300 hover:text-white hover:border-gray-400 hover:bg-white/5 rounded-t-lg"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/assets/duck.png" alt="Dapper Duck" className="w-8 h-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Dapper Duck
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Where ducks fly, FUD dies, and your wallet cries! 🦆💸 Dodge the bags, grab the snacks, and try not to go broke!
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Game</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <button 
                    onClick={() => setShowHowToPlayModal(true)}
                    className="hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    How to Play
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowLeaderboardModal(true)}
                    className="hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    Leaderboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowAchievementsModal(true)}
                    className="hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    Achievements
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-orange-600">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-600">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-600">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Dapper Duck. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Features Modal */}
      {showFeaturesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFeaturesModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            {/* Close Button */}
            <button
              onClick={() => setShowFeaturesModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">🎮 Game Features</h2>
              <p className="text-xl text-gray-300">Discover what makes Dapper Duck special</p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Core Gameplay */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🦆</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Core Gameplay</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• Smooth duck movement with realistic physics</li>
                  <li>• Collect delicious meme snacks for points</li>
                  <li>• Dodge FUD bags with precise collision detection</li>
                  <li>• Progressive difficulty scaling</li>
                </ul>
              </div>

              {/* Power-up System */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Power-up System</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• <span className="text-blue-400">Shield</span> - 10 seconds of invincibility</li>
                  <li>• <span className="text-yellow-400">2x Score</span> - Double your points for 10 seconds</li>
                  <li>• <span className="text-purple-400">Slow Motion</span> - Time warp effect for 10 seconds</li>
                  <li>• <span className="text-red-400">Magnet</span> - Attract snacks automatically for 10 seconds</li>
                </ul>
              </div>

              {/* Stats & Progress */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Stats & Progress</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• Track games played and best scores</li>
                  <li>• Count total snacks collected</li>
                  <li>• Monitor FUD bags dodged</li>
                  <li>• Achievement system with badges</li>
                </ul>
              </div>

              {/* Social Features */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Social Features</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• Custom profile with picture and name</li>
                  <li>• Social media links (Twitter, Discord)</li>
                  <li>• Global leaderboard competition</li>
                  <li>• Web3 wallet integration</li>
                </ul>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8">
              <Button 
                onClick={() => {
                  setShowFeaturesModal(false);
                  handlePlayGame();
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Playing Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHowToPlayModal(false)}
          />
          
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">🎮 How to Play Dapper Duck</h2>
              <p className="text-xl text-gray-300">Master the art of dodging FUD and collecting snacks!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Controls */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  Basic Controls
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">↑</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Space Bar / Arrow Up</p>
                      <p className="text-gray-400 text-sm">Flap your wings to fly up</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">🖱️</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Click / Tap</p>
                      <p className="text-gray-400 text-sm">Touch controls for mobile</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Objectives */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">🏆</span>
                  Game Objectives
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Collect Snacks</p>
                      <p className="text-gray-400 text-sm">Grab delicious meme snacks for points</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">⚠️</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Dodge FUD Bags</p>
                      <p className="text-gray-400 text-sm">Avoid the negative energy bags</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">💀</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Avoid Zero-Score FUD</p>
                      <p className="text-gray-400 text-sm">Skull & crossbones FUD bags reset your score to 0!</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Grab Power-ups</p>
                      <p className="text-gray-400 text-sm">Special abilities to help you survive</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoring System */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">📊</span>
                  Scoring System
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Common Snack</span>
                    <span className="text-green-400 font-bold">+50 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Rare Snack</span>
                    <span className="text-blue-400 font-bold">+100 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Epic Snack</span>
                    <span className="text-purple-400 font-bold">+150 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Legendary Snack</span>
                    <span className="text-yellow-400 font-bold">+300 pts</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-400 font-semibold">2x Score Power-up</span>
                      <span className="text-orange-400 font-bold">×2 Multiplier</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-3xl mr-3">💡</span>
                  Pro Tips
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-400 font-bold">1.</span>
                    <p className="text-gray-300">Stay in the middle of the screen for better maneuverability</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-400 font-bold">2.</span>
                    <p className="text-gray-300">Use short, quick taps instead of holding down</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-400 font-bold">3.</span>
                    <p className="text-gray-300">Watch for power-up spawns - they're rare but powerful</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-400 font-bold">4.</span>
                    <p className="text-gray-300">The game gets harder over time - pace yourself</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-400 font-bold">5.</span>
                    <p className="text-gray-300">💀 Watch for skull & crossbones FUD bags - they reset your score to 0!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={() => {
                  setShowHowToPlayModal(false);
                  handlePlayGame();
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Playing Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLeaderboardModal(false)}
          />
          
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <button
              onClick={() => setShowLeaderboardModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">🏆 Global Leaderboards</h2>
              <p className="text-xl text-gray-300">Top players across all categories</p>
            </div>

            {(() => {
              const leaderboardData: LeaderboardEntry[] = isClient ? (() => {
                try {
                  const saved = localStorage.getItem('dapperDuck_leaderboard');
                  if (saved) {
                    return JSON.parse(saved);
                  }
                } catch (error) {
                  console.log('Error loading leaderboard:', error);
                }
                return [];
              })() : [];

              const paidUsers = leaderboardData.filter(player => player.isPaid === true);
              const unpaidUsers = leaderboardData.filter(player => player.isPaid !== true);

              if (leaderboardData.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Scores Yet!</h3>
                    <p className="text-gray-400 mb-6">Be the first to set a high score!</p>
                    <Button 
                      onClick={() => {
                        setShowLeaderboardModal(false);
                        handlePlayGame();
                      }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 font-bold"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Playing
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Premium Leaderboard */}
                  <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 rounded-2xl p-6 border border-purple-400/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="text-2xl mr-2">💎</span>
                      Premium Leaderboard
                    </h3>
                    {paidUsers.length > 0 ? (
                      <div className="space-y-2">
                        {paidUsers.slice(0, 5).map((entry, index) => (
                          <div 
                            key={entry.id || index}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                              index === 0 ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' :
                              'bg-white/5 border border-white/10'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                                index === 2 ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' :
                                'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-white font-bold">{entry.name}</h4>
                                <p className="text-gray-400 text-xs">
                                  {new Date(entry.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-400">
                                {entry.score.toLocaleString()}
                              </div>
                              <div className="text-gray-400 text-xs">points</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-2">💎</div>
                        <p className="text-gray-400 text-sm">No premium players yet</p>
                      </div>
                    )}
                  </div>

                  {/* Free Leaderboard */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="text-2xl mr-2">🆓</span>
                      Free Leaderboard
                    </h3>
                    <div className="space-y-2">
                      {unpaidUsers.slice(0, 5).map((entry, index) => (
                        <div 
                          key={entry.id || index}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30' :
                            'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                              index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white' :
                              'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{entry.name}</h4>
                              <p className="text-gray-400 text-xs">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-400">
                              {entry.score.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="text-center mt-8">
              <Button 
                onClick={() => {
                  setShowLeaderboardModal(false);
                  handlePlayGame();
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                Compete Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAchievementsModal(false)}
          />
          
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <button
              onClick={() => setShowAchievementsModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">🏅 Achievements</h2>
              <p className="text-xl text-gray-300">Unlock badges and prove your skills!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(() => {
                const gameStats = isClient && isConnected && address ? (() => {
                  try {
                    const saved = localStorage.getItem('dapperDuckStats');
                    if (saved) {
                      return JSON.parse(saved);
                    }
                  } catch (error) {
                    console.log('Error loading game stats:', error);
                  }
                  return { gamesPlayed: 0, bestScore: 0, totalSnacks: 0, totalFudDodged: 0, achievements: [] };
                })() : { 
                  // Anonymous players see empty stats
                  gamesPlayed: 0, 
                  bestScore: 0, 
                  totalSnacks: 0, 
                  totalFudDodged: 0, 
                  achievements: [] 
                };

                const achievements = [
                  {
                    id: 'first_game',
                    title: 'First Flight',
                    description: 'Play your first game',
                    icon: '🦆',
                    condition: gameStats.gamesPlayed >= 1,
                    unlocked: gameStats.achievements?.includes('first_game') || gameStats.gamesPlayed >= 1,
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    id: 'first_thousand',
                    title: 'Thousandaire',
                    description: 'Score 1,000+ points in a single game',
                    icon: '💰',
                    condition: gameStats.bestScore >= 1000,
                    unlocked: gameStats.achievements?.includes('first_thousand') || gameStats.bestScore >= 1000,
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    id: 'high_scorer',
                    title: 'High Scorer',
                    description: 'Score 5,000+ points in a single game',
                    icon: '🎯',
                    condition: gameStats.bestScore >= 5000,
                    unlocked: gameStats.achievements?.includes('high_scorer') || gameStats.bestScore >= 5000,
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    id: 'snack_collector',
                    title: 'Snack Collector',
                    description: 'Collect 100+ snacks total',
                    icon: '🍿',
                    condition: gameStats.totalSnacks >= 100,
                    unlocked: gameStats.totalSnacks >= 100,
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    id: 'fud_dodger',
                    title: 'FUD Dodger',
                    description: 'Dodge 50+ FUD bags total',
                    icon: '🛡️',
                    condition: gameStats.totalFudDodged >= 50,
                    unlocked: gameStats.totalFudDodged >= 50,
                    color: 'from-red-500 to-rose-500'
                  },
                  {
                    id: 'survivor',
                    title: 'Survivor',
                    description: 'Survive for 30+ seconds',
                    icon: '⏰',
                    condition: false, // This would need to be tracked per game
                    unlocked: gameStats.achievements?.includes('survivor') || false,
                    color: 'from-indigo-500 to-blue-500'
                  },
                  {
                    id: 'dedicated_player',
                    title: 'Dedicated Player',
                    description: 'Play 10+ games',
                    icon: '🎮',
                    condition: gameStats.gamesPlayed >= 10,
                    unlocked: gameStats.gamesPlayed >= 10,
                    color: 'from-teal-500 to-cyan-500'
                  },
                  {
                    id: 'power_up_master',
                    title: 'Power-up Master',
                    description: 'Collect 20+ power-ups total',
                    icon: '⚡',
                    condition: gameStats.powerupsCollected >= 20,
                    unlocked: gameStats.powerupsCollected >= 20,
                    color: 'from-yellow-400 to-orange-500'
                  }
                ];

                return achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      achievement.unlocked 
                        ? `bg-gradient-to-br ${achievement.color} border-white/20` 
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                              ✓ Unlocked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={() => {
                  setShowAchievementsModal(false);
                  handlePlayGame();
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                Unlock More
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

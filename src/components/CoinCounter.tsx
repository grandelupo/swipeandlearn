import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  SafeAreaView, 
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCoins } from '@/contexts/CoinContext';
import { getAvailablePackages, PackageDetails, CoinPackage } from '@/services/revenuecat';
import { Button } from '@rneui/themed';
import { COLORS } from '@/constants/colors';
import { t } from '@/i18n/translations';
import { supabase } from '@/services/supabase';
import mobileAds, { AdEventType, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

export interface CoinCounterRef {
  openModal: () => void;
}

const AD_REWARD_AMOUNT = 2;
const AD_UNIT_ID = __DEV__ 
  ? TestIds.REWARDED 
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // iOS ad unit ID
      android: 'ca-app-pub-3940256099942544/5354046379', // Android ad unit ID
    });

const CoinCounter = forwardRef<CoinCounterRef>((_, ref) => {
  const { coins, isLoading, purchaseCoins, refreshBalance } = useCoins();
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<PackageDetails[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  useImperativeHandle(ref, () => ({
    openModal: () => setModalVisible(true)
  }));

  useEffect(() => {
    if (modalVisible) {
      loadPackages();
      checkAdCooldown();
      loadAd();
    }
  }, [modalVisible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(prev => prev ? prev - 1 : null);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const loadAd = async () => {
    try {
      // Initialize mobile ads
      await mobileAds().initialize();
      
      // Create a new rewarded ad instance
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID!, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['game', 'education'],
      });

      // Set up event listeners
      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setAdLoaded(true);
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        async () => {
          console.log('Ad earned reward event received');
          // Get current user
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) {
            console.error('Auth error:', authError);
            throw authError;
          }
          if (!user) {
            console.error('No user found');
            throw new Error('Not authenticated');
          }

          console.log('Calling show-ad edge function for user:', user.id);
          // Call the edge function to handle reward
          const { data, error } = await supabase.functions.invoke('show-ad', {
            body: { userId: user.id }
          });

          console.log('Edge function response:', { data, error });

          if (error) {
            console.error('Edge function error:', error);
            throw error;
          }

          if (data) {
            // Update local coins state using CoinContext
            await refreshBalance();

            Alert.alert(
              t('success'),
              t('adRewardSuccess', AD_REWARD_AMOUNT)
            );

            // Set cooldown
            setCooldownTime(3600); // 1 hour in seconds
          } else {
            console.error('No data returned from edge function');
            throw new Error('Failed to process ad reward');
          }
        }
      );

      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        setWatchingAd(false);
        setAdLoaded(false);
        loadAd(); // Load the next ad
      });

      // Load the ad
      rewarded.load();
      setRewardedAd(rewarded);

      // Clean up event listeners
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
      };
    } catch (error) {
      console.error('Error loading ad:', error);
      setAdLoaded(false);
    }
  };

  const checkAdCooldown = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lastAdWatch, error } = await supabase
        .from('ad_watches')
        .select('watched_at')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking ad cooldown:', error);
        return;
      }

      if (lastAdWatch) {
        const lastWatchTime = new Date(lastAdWatch.watched_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (lastWatchTime > oneHourAgo) {
          const remainingSeconds = Math.ceil((lastWatchTime.getTime() - oneHourAgo.getTime()) / 1000);
          setCooldownTime(remainingSeconds);
        } else {
          setCooldownTime(null);
        }
      } else {
        setCooldownTime(null);
      }
    } catch (error) {
      console.error('Error checking ad cooldown:', error);
    }
  };

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      const packages = await getAvailablePackages();
      setAvailablePackages(packages);
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert(t('error'), t('noPackagesAvailable'));
    } finally {
      setPackagesLoading(false);
    }
  };

  const handlePurchase = async (packageId: CoinPackage) => {
    try {
      setPurchaseInProgress(true);
      const success = await purchaseCoins(packageId);
      
      if (success) {
        setModalVisible(false);
      } else {
        Alert.alert(t('error'), t('purchaseError'));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(t('error'), t('purchaseError'));
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const handleWatchAd = async () => {
    try {
      setWatchingAd(true);
      
      if (!rewardedAd) {
        throw new Error('Ad not loaded');
      }

      await rewardedAd.show();
    } catch (error) {
      console.error('Ad error:', error);
      Alert.alert(t('error'), t('adError'));
      setWatchingAd(false);
      setAdLoaded(false);
      loadAd(); // Try to load a new ad
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.coinContainer}
        onPressIn={() => setModalVisible(true)}
        disabled={isLoading}
      >
        <Icon name="monetization-on" size={24} color={COLORS.card} />
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.card} style={styles.coinLoader} />
        ) : (
          <Text style={styles.coinText}>{coins}</Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('buyCoins')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.accent} />
              </TouchableOpacity>
            </View>

            <View style={styles.currentCoinsContainer}>
              <Text style={styles.currentCoinsText}>
                {t('yourBalance')}: {coins}
              </Text>
              <Icon name="monetization-on" size={18} color={COLORS.primary} />
            </View>

            <TouchableOpacity
              style={[
                styles.watchAdButton,
                (!adLoaded || cooldownTime !== null) && styles.watchAdButtonDisabled
              ]}
              onPress={handleWatchAd}
              disabled={!adLoaded || watchingAd || cooldownTime !== null}
            >
              <Icon name="play-circle-outline" size={24} color={COLORS.card} />
              <Text style={styles.watchAdButtonText}>
                {watchingAd ? t('loadingAd') : 
                 cooldownTime !== null ? t('adCooldown', { time: formatCooldownTime(cooldownTime) }) :
                 t('watchAdForCoins', AD_REWARD_AMOUNT)}
              </Text>
              {(watchingAd || !adLoaded) && (
                <ActivityIndicator size="small" color={COLORS.card} style={styles.adLoader} />
              )}
            </TouchableOpacity>

            {packagesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>{t('loadingPackages')}</Text>
              </View>
            ) : availablePackages.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('noPackagesAvailable')}</Text>
                <Button
                  title={t('retry')}
                  onPress={loadPackages}
                  buttonStyle={styles.retryButton}
                />
              </View>
            ) : (
              <FlatList
                data={availablePackages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.packageItem}>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageName}>{item.name}</Text>
                      <Text style={styles.packagePrice}>{item.price}</Text>
                    </View>
                    <Button
                      title={t('buy')}
                      disabled={purchaseInProgress}
                      loading={purchaseInProgress}
                      onPress={() => handlePurchase(item.id as CoinPackage)}
                      buttonStyle={styles.buyButton}
                    />
                  </View>
                )}
                contentContainerStyle={styles.packageList}
              />
            )}

            <Text style={styles.disclaimerText}>
              {t('purchaseDisclaimer')}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  coinText: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  coinLoader: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    margin: 0,
    padding: 28,
    width: '92%',
    maxHeight: '80%',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: 5,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  currentCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brighter,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentCoinsText: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    marginTop: 10,
  },
  packageList: {
    paddingVertical: 8,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.brighter,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  packagePrice: {
    color: COLORS.accent,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  disclaimerText: {
    marginTop: 18,
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  watchAdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  watchAdButtonDisabled: {
    backgroundColor: COLORS.bright,
    opacity: 0.7,
  },
  watchAdButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  adLoader: {
    marginLeft: 8,
  },
});

export default CoinCounter; 
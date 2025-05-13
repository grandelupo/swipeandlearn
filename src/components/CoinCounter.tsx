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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCoins } from '@/contexts/CoinContext';
import { getAvailablePackages, PackageDetails, CoinPackage } from '@/services/revenuecat';
import { Button } from '@rneui/themed';
import { COLORS } from '@/constants/colors';
import { t } from '@/i18n/translations';

export interface CoinCounterRef {
  openModal: () => void;
}

const CoinCounter = forwardRef<CoinCounterRef>((_, ref) => {
  const { coins, isLoading, purchaseCoins } = useCoins();
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<PackageDetails[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    openModal: () => setModalVisible(true)
  }));

  useEffect(() => {
    if (modalVisible) {
      loadPackages();
    }
  }, [modalVisible]);

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
});

export default CoinCounter; 
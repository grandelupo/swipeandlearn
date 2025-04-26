import React, { useState, useEffect } from 'react';
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

const CoinCounter = () => {
  const { coins, isLoading, purchaseCoins } = useCoins();
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<PackageDetails[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

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
      Alert.alert('Error', 'Failed to load available packages. Please try again.');
    } finally {
      setPackagesLoading(false);
    }
  };

  const handlePurchase = async (packageId: CoinPackage) => {
    try {
      setPurchaseInProgress(true);
      const success = await purchaseCoins(packageId);
      
      if (success) {
        Alert.alert('Purchase Successful', 'Coins have been added to your account!');
        setModalVisible(false);
      } else {
        Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An unexpected error occurred during purchase.');
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
        <Icon name="monetization-on" size={24} color="#FFD700" />
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFD700" style={styles.coinLoader} />
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
              <Text style={styles.modalTitle}>Buy Coins</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.currentCoinsContainer}>
              <Icon name="monetization-on" size={32} color="#FFD700" />
              <Text style={styles.currentCoinsText}>
                Your Balance: {coins} coins
              </Text>
            </View>

            {packagesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading packages...</Text>
              </View>
            ) : availablePackages.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No packages available at the moment.</Text>
                <Button
                  title="Retry"
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
                      title="Buy"
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
              Purchases will be charged to your App Store or Google Play account.
              All purchases are subject to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  coinText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#000',
  },
  coinLoader: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
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
  },
  closeButton: {
    padding: 5,
  },
  currentCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  currentCoinsText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  packageList: {
    paddingVertical: 10,
  },
  packageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  packagePrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buyButton: {
    paddingHorizontal: 20,
    backgroundColor: '#0066cc',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
  },
});

export default CoinCounter; 
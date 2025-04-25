import React, { useState } from 'react';
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
import { COIN_PACKAGES, CoinPackage } from '@/services/revenuecat';
import { Button } from 'react-native-elements';

const CoinCounter = () => {
  const { coins, isLoading, purchaseCoins } = useCoins();
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

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

            <FlatList
              data={COIN_PACKAGES}
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
                    onPress={() => handlePurchase(item.id)}
                    buttonStyle={styles.buyButton}
                  />
                </View>
              )}
              contentContainerStyle={styles.packageList}
            />

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
});

export default CoinCounter; 
import React, { useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookshelfScreen from '../screens/Bookshelf';
import StoryReader from '../screens/StoryReader';
import NewStoryScreen from '../screens/NewStory';
import ProfileScreen from '../screens/Profile';
import CatalogScreen from '../screens/Catalog';
import { MainStackParamList } from './types';
import CoinCounter, { CoinCounterRef } from '@/components/CoinCounter';
import ArchiveScreen from '@/screens/Archive';
import FeedbackButton from '@/components/FeedbackButton';
import { FeedbackButtonProvider, useFeedbackButton } from '@/contexts/FeedbackButtonContext';
import { t } from '@/i18n/translations';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainStackContent() {
  const coinCounterRef = useRef<CoinCounterRef>(null);
  const { feedbackButtonRef } = useFeedbackButton();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Bookshelf"
        component={(props: NativeStackScreenProps<MainStackParamList, 'Bookshelf'>) => (
          <BookshelfScreen {...props} coinCounterRef={coinCounterRef} feedbackButtonRef={feedbackButtonRef} />
        )}
        options={({ navigation }) => ({
          title: t('bookshelf'),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
              <TouchableOpacity
                style={styles.profileButton}
                onPressIn={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle-outline" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="NewStory"
        component={(props: NativeStackScreenProps<MainStackParamList, 'NewStory'>) => (
          <NewStoryScreen {...props} coinCounterRef={coinCounterRef} />
        )}
        options={{ 
          title: t('createStory'),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
            </View>
          )
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
            </View>
          ),
          title: t('profile'),
        }}
      />
      <Stack.Screen
        name="StoryReader"
        component={(props: NativeStackScreenProps<MainStackParamList, 'StoryReader'>) => (
          <StoryReader {...props} coinCounterRef={coinCounterRef} />
        )}
        options={{ 
          headerShown: true,
          headerBackTitle: t('back'),
          title: t('story'),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
            </View>
          )
        }}
      />
      <Stack.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
            </View>
          ),
          title: t('archive'),
        }}
      />
      <Stack.Screen
        name="Catalog"
        component={(props: NativeStackScreenProps<MainStackParamList, 'Catalog'>) => (
          <CatalogScreen {...props} coinCounterRef={coinCounterRef} feedbackButtonRef={feedbackButtonRef} />
        )}
        options={{
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter ref={coinCounterRef} />
              <FeedbackButton />
            </View>
          ),
          title: t('catalog'),
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainStack() {
  return (
    <FeedbackButtonProvider>
      <MainStackContent />
    </FeedbackButtonProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 10,
  }
}); 
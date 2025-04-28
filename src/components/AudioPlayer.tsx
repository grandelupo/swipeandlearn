import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@rneui/themed';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VoiceId, AVAILABLE_VOICES } from '@/services/elevenlabs';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { COLORS } from '@/constants/colors';

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading: boolean;
  onVoiceChange: (voiceId: VoiceId) => void;
  selectedVoice: VoiceId;
  onPlay: (voiceId: VoiceId) => void;
}

export default function AudioPlayer({
  audioUrl,
  isLoading,
  onVoiceChange,
  selectedVoice,
  onPlay,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    loadAudio();
  }, [audioUrl]);

  const loadAudio = async () => {
    if (!audioUrl) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      soundRef.current = newSound;

      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded || isSeeking) return;

    setPosition(status.positionMillis);
    setDuration(status.durationMillis);
    setIsPlaying(status.isPlaying);

    // Handle playback completion
    if (status.didJustFinish) {
      setPosition(0);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      await onPlay(selectedVoice);
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (position >= duration) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error in playback:', error);
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    if (sound && isPlaying) {
      sound.pauseAsync();
    }
  };

  const handleSeekComplete = async (value: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(value);
      setPosition(value);
      
      if (!isPlayingRef.current) {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error seeking:', error);
    } finally {
      setIsSeeking(false);
    }
  };

  const handleRewind = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 5000);
    await handleSeekComplete(newPosition);
  };

  const handleForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(duration, position + 5000);
    await handleSeekComplete(newPosition);
  };

  const handleRateChange = async (rate: number) => {
    if (!sound) return;
    await sound.setRateAsync(rate, true);
    setPlaybackRate(rate);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Generating audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!audioUrl ? (
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => onPlay(selectedVoice)}
        >
          <Icon name="volume-up" size={24} color="#fff" />
          <Text style={styles.generateButtonText}>
            Generate audio for this page
          </Text>
          <Text style={styles.generateButtonPrice}>{FUNCTION_COSTS.GENERATE_AUDIO}</Text>
          <Icon name="monetization-on" size={16} color={COLORS.card} style={styles.generateButtonIcon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleRewind} style={styles.button}>
            <Icon name="replay-5" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForward} style={styles.button}>
            <Icon name="forward-5" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.progressContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Slider
          style={styles.slider}
          value={position}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor="#0066cc"
          maximumTrackTintColor="#e1e8ed"
          thumbTintColor="#0066cc"
          onSlidingStart={handleSeekStart}
          onSlidingComplete={handleSeekComplete}
          disabled={!sound || isLoading}
        />
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceSelector(!showVoiceSelector)}
        >
          <Icon name="record-voice-over" size={24} color="#000" />
          <Text style={styles.voiceButtonText}>
            {AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.speedControls}>
          <Text style={styles.speedLabel}>{playbackRate}x</Text>
          <TouchableOpacity
            onPress={() => handleRateChange(Math.max(0.5, playbackRate - 0.25))}
            style={styles.speedButton}
          >
            <Icon name="remove" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRateChange(Math.min(3, playbackRate + 0.25))}
            style={styles.speedButton}
          >
            <Icon name="add" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {showVoiceSelector && (
        <View style={styles.voiceSelector}>
          {AVAILABLE_VOICES.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceOption,
                selectedVoice === voice.id && styles.selectedVoice,
              ]}
              onPress={() => {
                onVoiceChange(voice.id);
                setShowVoiceSelector(false);
              }}
            >
              <Text style={styles.voiceName}>{voice.name}</Text>
              <Text style={styles.voiceDescription}>{voice.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    padding: 10,
    backgroundColor: COLORS.brighter,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  playButton: {
    padding: 8,
    marginHorizontal: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 13,
    color: COLORS.primary,
    width: 40,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
  },
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.bright,
    borderRadius: 18,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  voiceButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  speedLabel: {
    marginRight: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  speedButton: {
    padding: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceSelector: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.brighter,
    paddingTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  voiceOption: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: COLORS.bright,
  },
  selectedVoice: {
    backgroundColor: COLORS.accent,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  voiceDescription: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: 24,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 8,
  },
  generateButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  generateButtonPrice: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Poppins-Bold',
  },
  generateButtonIcon: {
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
}); 
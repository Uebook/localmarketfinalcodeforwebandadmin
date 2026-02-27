import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
// import Geolocation from '@react-native-community/geolocation'; // Import if available, else standard check

const PermissionRequestScreen = ({ visible, onComplete }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);

  const [permissions, setPermissions] = useState([
    {
      id: 'camera',
      title: 'Camera Access',
      description: 'To take photos of products and documents',
      icon: 'camera',
      granted: false,
      required: true,
    },
    {
      id: 'location',
      title: 'Location Services',
      description: 'To show you nearby vendors and offers',
      icon: 'map-pin',
      granted: false,
      required: true,
    },
    {
      id: 'notification',
      title: 'Notifications',
      description: 'To update you on orders and exclusive deals',
      icon: 'bell',
      granted: false,
      required: false,
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const camera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        const location = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        let notifications = false;
        if (Platform.Version >= 33) {
          notifications = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } else {
          notifications = true; // Assume granted on older Android
        }

        const newPermissions = permissions.map(p => {
          if (p.id === 'camera') return { ...p, granted: camera };
          if (p.id === 'location') return { ...p, granted: location };
          if (p.id === 'notification') return { ...p, granted: notifications };
          return p;
        });

        setPermissions(newPermissions);

        // Auto-skip if all required are already granted
        const ungrantedRequired = newPermissions.filter(p => !p.granted && p.required);
        if (ungrantedRequired.length === 0 && visible) {
          onComplete();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS permission checking usually requires specific libraries
      // For now, allow proceeding
      if (visible) onComplete();
    }
  };

  const requestPermission = async (permission) => {
    if (Platform.OS === 'android') {
      try {
        let granted = false;
        if (permission.id === 'camera') {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission",
              message: "App needs access to your camera to upload photos.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        } else if (permission.id === 'location') {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "App needs access to your location to show local content.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        } else if (permission.id === 'notification') {
          if (Platform.Version >= 33) {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            granted = result === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            granted = true; // Automatically granted on older Android
          }
        }

        if (granted) {
          markAsGranted(permission.id);
        } else {
          // If manual settings needed
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS Implementation - mostly informational or using specific libs if available
      if (permission.id === 'location') {
        // Geolocation.requestAuthorization(); // Uncomment if library is linked
        Alert.alert('Location Permission', 'Please allow location access when prompted next.');
        markAsGranted(permission.id); // optimistically update
      } else {
        Alert.alert('Permission Required', `Please ensure ${permission.title} is enabled in settings.`);
        markAsGranted(permission.id); // optimistically update
      }
    }
  };

  const markAsGranted = (id) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, granted: true } : p));
  };

  const handleContinue = () => {
    // Check if there are more permissions to ask?
    // Or just finish.
    // The design here handles one by one or a list.
    // Let's verify if all required are granted.
    const ungranted = permissions.filter(p => !p.granted && p.required);
    if (ungranted.length === 0) {
      onComplete();
    } else {
      // Ask for the first ungranted
      // requestPermission(ungranted[0]);
      // For simplicity, we just close if user insists or we can block.
      // Let's just allow proceeding for now to avoid getting stuck.
      onComplete();
    }
  };

  const handleGrant = (perm) => {
    requestPermission(perm);
  };

  // Filter only ungranted permissions to show? 
  // Or show all with status?
  // Let's show list.

  // If all granted, auto close?
  useEffect(() => {
    const allGranted = permissions.every(p => p.granted || !p.required);
    // if (allGranted) onComplete(); 
    // Maybe show a "All Set!" screen?
  }, [permissions]);


  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Let's get you set up</Text>
            <Text style={styles.subtitle}>We need a few permissions to give you the best experience.</Text>
          </View>

          <View style={styles.list}>
            {permissions.map((item, index) => (
              <View key={item.id} style={styles.item}>
                <View style={[styles.iconContainer, item.granted && styles.iconContainerGranted]}>
                  <Icon
                    name={item.granted ? 'check' : item.icon}
                    size={24}
                    color={item.granted ? '#fff' : COLORS.orange}
                  />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                {!item.granted && (
                  <TouchableOpacity
                    style={styles.grantButton}
                    onPress={() => handleGrant(item)}
                  >
                    <Text style={styles.grantText}>Allow</Text>
                  </TouchableOpacity>
                )}
                {item.granted && (
                  <Text style={styles.grantedText}>Allowed</Text>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={['#fb923c', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.continueText}>Continue to App</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '60%',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  list: {
    marginBottom: 32,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerGranted: {
    backgroundColor: COLORS.success,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  grantButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  grantText: {
    color: COLORS.orange,
    fontWeight: '600',
    fontSize: 13,
  },
  grantedText: {
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 13,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PermissionRequestScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import { requestPasswordResetOTP, resetPassword } from '../services/api';

const ForgotPasswordScreen = ({ onBack }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await requestPasswordResetOTP(email);
      if (response.success) {
        setStep(2);
        setSuccess('OTP sent to your email');
        // For development, we show the OTP in the message if available
        if (response.otp) {
          Alert.alert('Development Mode', `Your OTP is: ${response.otp}`);
        }
      } else {
        setError(response.error || 'Failed to request OTP');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await resetPassword(email, otp, newPassword);
      if (response.success) {
        Alert.alert('Success', 'Your password has been reset successfully.', [
          { text: 'Login Now', onPress: onBack }
        ]);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
               <Image 
                 source={require('../assets/lokall_shop_illustration.jpg')} 
                 style={styles.heroImage} 
                 resizeMode="contain"
               />
            </View>
            <Text style={styles.brandName}>LOKALL</Text>
            <Text style={styles.brandTagline}>Security Center</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 1 
                ? "Enter your email and we'll send you an OTP to reset your password." 
                : step === 2 
                ? `Enter the OTP sent to ${email}` 
                : "Create a strong new password for your account."}
            </Text>

            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
            {success ? <Text style={styles.successBanner}>{success}</Text> : null}

            {/* Step 1: Email */}
            {step === 1 && (
              <View style={styles.inputGroup}>
                <View style={styles.inputBox}>
                  <Icon name="mail" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleRequestOTP}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F97316', '#EA580C']}
                    style={styles.actionBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Send OTP</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <View style={styles.inputGroup}>
                <View style={styles.inputBox}>
                  <Icon name="shield" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="4-Digit OTP"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text.replace(/\D/g, ''));
                      setError('');
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F97316', '#EA580C']}
                    style={styles.actionBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.actionBtnText}>Verify OTP</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resendBtn} onPress={() => setStep(1)}>
                  <Text style={styles.resendText}>Didn't receive? Change email</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <View style={styles.inputGroup}>
                <View style={styles.inputBox}>
                  <Icon name="lock" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="New Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setError('');
                    }}
                  />
                </View>
                <View style={styles.inputBox}>
                  <Icon name="lock" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setError('');
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F97316', '#EA580C']}
                    style={styles.actionBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Reset Password</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
             <Text style={styles.footerText}>Secure Reset Powered by</Text>
             <Text style={styles.footerBrand}>LOKALL CLOUD</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#DBEAFE',
    opacity: 0.5,
  },
  circle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F97316',
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  heroImage: {
    width: 60,
    height: 60,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 18,
  },
  errorBanner: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  successBanner: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footerBrand: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default ForgotPasswordScreen;

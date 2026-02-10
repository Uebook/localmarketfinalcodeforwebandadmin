import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { login } from '../services/api';
import { saveUserData } from '../utils/userStorage';

import PermissionRequestScreen from './PermissionRequestScreen';

const LoginScreen = ({ onLogin, onRegister }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [isLocalPlusMode, setIsLocalPlusMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(24);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Permission handling
  const [showPermissions, setShowPermissions] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer for resend OTP
  useEffect(() => {
    if (showOtpScreen && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtpScreen, resendTimer]);

  const handleGetOtp = async () => {
    if (loginMethod === 'mobile' && mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (loginMethod === 'mobile') {
        // Request OTP for SMS login
        const response = await login({
          method: 'sms',
          phone: `+91${mobile}`,
        });

        if (response.success) {
          setShowOtpScreen(true);
          setResendTimer(24);
          // In development, show OTP (remove in production)
          if (response.otp) {
            Alert.alert('OTP Sent', `Your OTP is: ${response.otp}`, [{ text: 'OK' }]);
          }
        }
      } else {
        // Email login - verify password directly
        if (!email || !password) {
          setError('Please enter email and password');
          setIsLoading(false);
          return;
        }

        const response = await login({
          method: 'email',
          email: email.toLowerCase(),
          password: password,
        });

        if (response.success && response.user) {
          // Save user data to AsyncStorage
          try {
            await saveUserData(response.user, isLocalPlusMode ? 'vendor' : 'customer');
          } catch (error) {
            console.error('Error saving user data:', error);
          }

          // Show permissions before completing login
          setPendingLoginData({
            role: isLocalPlusMode ? 'vendor' : 'customer',
            user: response.user
          });
          setShowPermissions(true);
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setError('Please enter 4-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await login({
        method: 'sms',
        phone: `+91${mobile}`,
        otp: otpString,
      });

      if (response.success && response.user) {
        // Save user data to AsyncStorage
        try {
          await saveUserData(response.user, isLocalPlusMode ? 'vendor' : 'customer');
        } catch (error) {
          console.error('Error saving user data:', error);
        }

        // Show permissions before completing login
        setPendingLoginData({
          role: isLocalPlusMode ? 'vendor' : 'customer',
          user: response.user
        });
        setShowPermissions(true);
      }
    } catch (err) {
      const errorMsg = err.message || 'Invalid OTP. Please try again.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      // Clear OTP on error
      setOtp(['', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    setShowOtpScreen(false);
    setOtp(['', '', '', '']);
    setResendTimer(24);
    setError('');
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setError('');
    setShowOtpScreen(false);
    setOtp(['', '', '', '']);
    setMobile('');
    setEmail('');
    setPassword('');
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await login({
        method: 'sms',
        phone: `+91${mobile}`,
      });

      if (response.success) {
        setResendTimer(24);
        // In development, show OTP (remove in production)
        if (response.otp) {
          Alert.alert('OTP Resent', `Your OTP is: ${response.otp}`, [{ text: 'OK' }]);
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to resend OTP';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.match(/[0-9]/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 3 && value) {
        otpRefs[index + 1].current?.focus();
      }
    } else if (value === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleOtpKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful Google login
      setPendingLoginData({
        role: isLocalPlusMode ? 'vendor' : 'customer',
        user: null // In real app, would get user data from Google
      });
      setShowPermissions(true);
    }, 1500);
  };

  const handleLocalPlusLogin = () => {
    setIsLocalPlusMode(true);
    setMobile('');
  };

  const handleCustomerLogin = () => {
    setIsLocalPlusMode(false);
    setMobile('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark gradient background (reddish-brown to deep purple) */}
      <LinearGradient
        colors={['#7A3B1D', '#581c87']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Light pinkish-beige card */}
        <View style={[styles.card, isLocalPlusMode && styles.cardLocalPlus]}>
          {/* Icon overlapping the card */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <Icon
                name={isLocalPlusMode ? getIconName('Briefcase') : 'shopping-bag'}
                size={48}
                color={isLocalPlusMode ? COLORS.textPrimary : COLORS.orange}
              />
            </View>
          </View>

          {/* Welcome section */}
          <Text style={styles.welcomeText}>
            {isLocalPlusMode ? 'Local+ Login' : 'Welcome'}
          </Text>
          <Text style={styles.subtitleText}>
            {isLocalPlusMode ? 'Manage your Local+ business' : 'Login to access your local market'}
          </Text>

          {/* OTP Screen */}
          {showOtpScreen && loginMethod === 'mobile' ? (
            <View style={styles.otpContainer}>
              <Text style={styles.otpInstructionText}>
                We've sent a 4-digit code to{'\n'}
                <Text style={styles.otpPhoneNumber}>+91 {mobile}</Text>
                <TouchableOpacity onPress={handleEditNumber} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </Text>

              <View style={styles.otpInputsContainer}>
                {[0, 1, 2, 3].map((idx) => (
                  <TextInput
                    key={idx}
                    ref={otpRefs[idx]}
                    style={styles.otpInput}
                    value={otp[idx]}
                    onChangeText={(value) => handleOtpChange(idx, value)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(idx, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, (isLoading || otp.join('').length < 4) && styles.verifyButtonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading || otp.join('').length < 4}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#fb923c', '#ec4899']} // Orange to pink/purple
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} size="small" style={styles.buttonContent} />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.verifyButtonText}>Verify & Login</Text>
                      <Icon name={getIconName('CheckCircle')} size={18} color={COLORS.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
                  Resend OTP {resendTimer > 0 ? `in ${resendTimer}s` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>

              {/* Mobile/Email selector */}
              <View style={styles.methodSelector}>
                <TouchableOpacity
                  style={[styles.methodTab, loginMethod === 'mobile' && styles.methodTabActive]}
                  onPress={() => handleMethodChange('mobile')}
                  activeOpacity={0.7}
                >
                  {loginMethod === 'mobile' ? (
                    <View style={styles.methodTabContent}>
                      <Icon name={getIconName('Phone')} size={16} color={COLORS.textPrimary} />
                      <Text style={styles.methodTabTextActive}>Mobile</Text>
                    </View>
                  ) : (
                    <View style={styles.methodTabContent}>
                      <Icon name={getIconName('Phone')} size={16} color={COLORS.textMuted} />
                      <Text style={styles.methodTabText}>Mobile</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodTab, loginMethod === 'email' && styles.methodTabActive]}
                  onPress={() => handleMethodChange('email')}
                  activeOpacity={0.7}
                >
                  {loginMethod === 'email' ? (
                    <View style={styles.methodTabContent}>
                      <Icon name={getIconName('Mail')} size={16} color={COLORS.textPrimary} />
                      <Text style={styles.methodTabTextActive}>Email</Text>
                    </View>
                  ) : (
                    <View style={styles.methodTabContent}>
                      <Icon name={getIconName('Mail')} size={16} color={COLORS.textMuted} />
                      <Text style={styles.methodTabText}>Email</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Error message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Mobile number input */}
              {loginMethod === 'mobile' && (
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                  <View style={[styles.inputWrapper, isLocalPlusMode && styles.inputWrapperLocalPlus]}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 10 digit number"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="phone-pad"
                      value={mobile}
                      onChangeText={(text) => setMobile(text.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                    <Icon name={getIconName('Phone')} size={18} color={isLocalPlusMode ? COLORS.textMuted : COLORS.orange} />
                  </View>
                </View>
              )}

              {/* Email input (if email method is selected) */}
              {loginMethod === 'email' && (
                <>
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                    <View style={[styles.inputWrapper, isLocalPlusMode && styles.inputWrapperLocalPlus]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setError('');
                        }}
                      />
                      <Icon name={getIconName('Mail')} size={18} color={isLocalPlusMode ? COLORS.textMuted : COLORS.orange} />
                    </View>
                  </View>
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    <View style={[styles.inputWrapper, isLocalPlusMode && styles.inputWrapperLocalPlus]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          setError('');
                        }}
                      />
                      <Icon name={getIconName('Lock')} size={18} color={isLocalPlusMode ? COLORS.textMuted : COLORS.orange} />
                    </View>
                  </View>
                </>
              )}

              {/* Get OTP / Login button with gradient or dark grey for Local+ */}
              <TouchableOpacity
                style={[
                  styles.otpButton,
                  (isLoading ||
                    (loginMethod === 'mobile' && mobile.length < 10) ||
                    (loginMethod === 'email' && (!email || !password))
                  ) && styles.otpButtonDisabled,
                  isLocalPlusMode && styles.otpButtonLocalPlus
                ]}
                onPress={handleGetOtp}
                disabled={
                  isLoading ||
                  (loginMethod === 'mobile' && mobile.length < 10) ||
                  (loginMethod === 'email' && (!email || !password))
                }
                activeOpacity={0.8}
              >
                {isLocalPlusMode ? (
                  <View style={styles.darkGreyButton}>
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.white} size="small" style={styles.buttonContent} />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.otpButtonText}>
                          {loginMethod === 'email' ? 'Login' : 'Get OTP'}
                        </Text>
                        <Icon name={getIconName('ArrowRight')} size={18} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#fb923c', '#ec4899']} // Orange to pink/purple
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.white} size="small" style={styles.buttonContent} />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.otpButtonText}>
                          {loginMethod === 'email' ? 'Login' : 'Get OTP'}
                        </Text>
                        <Icon name={getIconName('ArrowRight')} size={18} color={COLORS.white} />
                      </View>
                    )}
                  </LinearGradient>
                )}
              </TouchableOpacity>

              {/* OR CONTINUE WITH */}
              <View style={styles.dividerSection}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google login button */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.8}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Google</Text>
              </TouchableOpacity>

              {/* Register link for regular users */}
              {!isLocalPlusMode && (
                <View style={styles.registerLinkSection}>
                  <Text style={styles.registerLinkText}>
                    Don't have an account?{' '}
                    <TouchableOpacity
                      onPress={() => onRegister && onRegister(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.registerLinkBold}>Register Now</Text>
                    </TouchableOpacity>
                  </Text>
                </View>
              )}

              {/* Partners section */}
              <View style={styles.partnersSection}>
                <View style={styles.dividerLine} />
                <Text style={styles.partnersLabel}>PARTNERS & LOCAL+</Text>
                <View style={styles.partnersButtons}>
                  <TouchableOpacity style={styles.localPlusButton} onPress={handleLocalPlusLogin} activeOpacity={0.7}>
                    <Icon name={getIconName('Briefcase')} size={20} color={COLORS.textSecondary} />
                    <Text style={styles.localPlusButtonText}>Login to Local+</Text>
                  </TouchableOpacity>
                  {onRegister && (
                    <TouchableOpacity style={styles.registerButton} onPress={() => onRegister(true)} activeOpacity={0.7}>
                      <Icon name={getIconName('Store')} size={20} color={COLORS.orange} />
                      <Text style={styles.registerButtonText}>Register as Local+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {isLocalPlusMode && (
                <View style={styles.notLocalPlusSection}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.notLocalPlusLabel}>NOT ON LOCAL+?</Text>
                  <TouchableOpacity style={styles.customerLoginButton} onPress={handleCustomerLogin} activeOpacity={0.7}>
                    <Icon name={getIconName('User')} size={16} color="#475569" />
                    <Text style={styles.customerLoginButtonText}>Login as Customer</Text>
                  </TouchableOpacity>
                  {onRegister && (
                    <TouchableOpacity style={styles.registerLink} onPress={onRegister} activeOpacity={0.7}>
                      <Text style={styles.registerLinkText}>
                        Don't have a Local+ account?{' '}
                        <Text style={styles.registerLinkBold}>Register New</Text>
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Icon name={getIconName('Shield')} size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>SECURE & TRUSTED MARKETPLACE</Text>
          </View>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowErrorModal(false);
          setError('');
        }}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            {/* Error Icon */}
            <View style={styles.errorIconContainer}>
              <View style={styles.errorIconCircle}>
                <Icon name="alert-circle" size={48} color={COLORS.white} />
              </View>
            </View>

            {/* Error Title */}
            <Text style={styles.errorModalTitle}>Login Error</Text>

            {/* Error Message */}
            <Text style={styles.errorModalMessage}>
              {errorMessage || 'An error occurred. Please try again.'}
            </Text>

            {/* Helpful Suggestions */}
            {errorMessage.includes('not registered') && (
              <View style={styles.errorSuggestionBox}>
                <Icon name={getIconName('Info')} size={16} color="#3b82f6" />
                <Text style={styles.errorSuggestionText}>
                  Don't have an account? Register now to get started.
                </Text>
              </View>
            )}

            {errorMessage.includes('Invalid') && errorMessage.includes('OTP') && (
              <View style={styles.errorSuggestionBox}>
                <Icon name={getIconName('Info')} size={16} color="#3b82f6" />
                <Text style={styles.errorSuggestionText}>
                  Make sure you entered the correct 4-digit OTP. You can request a new one.
                </Text>
              </View>
            )}

            {errorMessage.includes('password') && (
              <View style={styles.errorSuggestionBox}>
                <Icon name={getIconName('Info')} size={16} color="#3b82f6" />
                <Text style={styles.errorSuggestionText}>
                  Please check your email and password. Make sure caps lock is off.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.errorButtonContainer}>
              {errorMessage.includes('not registered') ? (
                <>
                  <TouchableOpacity
                    style={styles.errorButtonSecondary}
                    onPress={() => {
                      setShowErrorModal(false);
                      setError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.errorButtonSecondaryText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.errorButtonPrimary}
                    onPress={() => {
                      setShowErrorModal(false);
                      setError('');
                      if (onRegister) {
                        onRegister(false);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#fb923c', '#ec4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.errorButtonGradient}
                    >
                      <Text style={styles.errorButtonPrimaryText}>Register</Text>
                      <Icon name={getIconName('ArrowRight')} size={16} color={COLORS.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.errorButtonSecondary, { width: '100%' }]}
                  onPress={() => {
                    setShowErrorModal(false);
                    setError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.errorButtonSecondaryText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>


      <PermissionRequestScreen
        visible={showPermissions}
        onComplete={() => {
          setShowPermissions(false);
          if (onLogin && pendingLoginData) {
            onLogin(pendingLoginData.role, pendingLoginData.user);
          }
        }}
      />
    </KeyboardAvoidingView >
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#faf5f0', // Light beige/pinkish-white
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardLocalPlus: {
    backgroundColor: '#f3f4f6', // Light grey-purple
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB', // Light gray
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  methodTabActive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
  },
  methodTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  methodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  methodTabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.orange, // Orange border
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white, // White background
    gap: 12,
  },
  inputWrapperLocalPlus: {
    borderColor: COLORS.divider, // Grey border for Local+
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 0,
  },
  otpButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  otpButtonLocalPlus: {
    backgroundColor: COLORS.textPrimary, // Dark grey
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  darkGreyButton: {
    backgroundColor: COLORS.textPrimary, // Dark grey
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otpButtonDisabled: {
    opacity: 0.6,
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  partnersSection: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  partnersLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  partnersButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  localPlusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  localPlusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  registerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed', // Light orange background
    borderWidth: 1,
    borderColor: '#fed7aa', // Light orange border
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.orange,
  },
  notLocalPlusSection: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notLocalPlusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  customerLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
  },
  customerLoginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  registerLinkBold: {
    fontWeight: '700',
    color: '#ea580c',
    textDecorationLine: 'underline',
  },
  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ef4444', // Red color for error
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  errorModalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorModalMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  errorSuggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    lineHeight: 20,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  errorButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  errorButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: 6,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  otpContainer: {
    marginTop: 8,
  },
  otpInstructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpPhoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  editButton: {
    marginLeft: 8,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ea580c',
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 56,
    height: 64,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  verifyButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerLinkSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  registerLinkBold: {
    fontWeight: '700',
    color: COLORS.orange,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
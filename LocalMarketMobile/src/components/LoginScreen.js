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
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { login, vendorLogin } from '../services/api';
import { saveUserData } from '../utils/userStorage';

import PermissionRequestScreen from './PermissionRequestScreen';
import Logo from './Logo';

const LoginScreen = ({ onLogin, onRegister, onForgotPassword }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [isLocalPlusMode, setIsLocalPlusMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Permission handling
  const [showPermissions, setShowPermissions] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);


  const handleLogin = async () => {
    console.log('[Login] handleLogin called', { loginMethod, isLocalPlusMode, mobile, email });
    
    if (loginMethod === 'mobile' && mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (loginMethod === 'email' && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginFn = isLocalPlusMode ? vendorLogin : login;
      const response = await loginFn({
        method: loginMethod === 'email' ? 'email' : 'sms',
        phone: loginMethod === 'mobile' ? mobile : undefined,
        email: loginMethod === 'email' ? email.toLowerCase() : undefined,
        password: password,
      });

      console.log('[Login] API Response Body:', response);

      const userData = response.user || response.vendor || (response.id ? response : null);

      if (userData && (response.success || response.user || response.vendor || response.id)) {
        // Save user data to AsyncStorage
        try {
          await saveUserData(userData, isLocalPlusMode ? 'vendor' : 'customer');
        } catch (error) {
          console.error('Error saving user data:', error);
        }

        // Directly complete login if permissions logic isn't needed or to avoid race conditions
        if (onLogin) {
          onLogin(isLocalPlusMode ? 'vendor' : 'customer', userData);
        }
      } else {
        console.warn('[Login] Response received but missing user data', response);
        setError(response.message || 'Login failed. Please check your credentials.');
      }

    } catch (err) {
      console.error('[Login] handleLogin Error:', err);
      const errorMsg = err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setError('');
    setMobile('');
    setEmail('');
    setPassword('');
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
          {/* Hero Branding */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
               <Image 
                 source={require('../assets/lokall_shop_illustration.jpg')} 
                 style={styles.heroImage} 
                 resizeMode="contain"
               />
            </View>
            <Text style={styles.brandName}>LOKALL</Text>
            <Text style={styles.brandTagline}>Your Market, Digitized.</Text>
          </View>

          {/* Role Toggle */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity 
              style={[styles.roleTab, !isLocalPlusMode && styles.roleTabActive]}
              onPress={handleCustomerLogin}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleTabText, !isLocalPlusMode && styles.roleTabTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleTab, isLocalPlusMode && styles.roleTabActive]}
              onPress={handleLocalPlusLogin}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleTabText, isLocalPlusMode && styles.roleTabTextActive]}>Partner</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isLocalPlusMode ? 'Partner Login' : 'Welcome Back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isLocalPlusMode ? 'Manage your shop and orders' : 'Access your favorite local deals'}
            </Text>

            {/* Method Selector (Mobile/Email) */}
            <View style={styles.methodContainer}>
               {['mobile', 'email'].map((method) => (
                 <TouchableOpacity
                   key={method}
                   onPress={() => handleMethodChange(method)}
                   style={[styles.methodItem, loginMethod === method && styles.methodItemActive]}
                 >
                   <Text style={[styles.methodText, loginMethod === method && styles.methodTextActive]}>
                     {method.charAt(0).toUpperCase() + method.slice(1)}
                   </Text>
                 </TouchableOpacity>
               ))}
            </View>

            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

            {/* Input Group */}
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Icon name={loginMethod === 'mobile' ? 'phone' : 'mail'} size={18} color="#94A3B8" />
                {loginMethod === 'mobile' && <Text style={styles.prefix}>+91</Text>}
                <TextInput
                  style={styles.textInput}
                  placeholder={loginMethod === 'mobile' ? "Mobile Number" : "Email Address"}
                  placeholderTextColor="#94A3B8"
                  keyboardType={loginMethod === 'mobile' ? "phone-pad" : "email-address"}
                  value={loginMethod === 'mobile' ? mobile : email}
                  onChangeText={(text) => {
                    if (loginMethod === 'mobile') {
                      setMobile(text.replace(/\D/g, '').slice(0, 10));
                    } else {
                      setEmail(text);
                    }
                    setError('');
                  }}
                />
              </View>

              <View style={styles.inputBox}>
                <Icon name="lock" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye' : 'eye-off'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                style={styles.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Login Now</Text>
                    <Icon name="arrow-right" size={18} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {!isLocalPlusMode && (
              <TouchableOpacity 
                style={styles.registerBtn}
                onPress={() => onRegister && onRegister(false)}
              >
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerTextBold}>Create One</Text>
                </Text>
              </TouchableOpacity>
            )}

            {isLocalPlusMode && (
              <TouchableOpacity 
                style={styles.registerBtn}
                onPress={() => onRegister && onRegister(true)}
              >
                <Text style={styles.registerText}>
                  New Partner? <Text style={styles.registerTextBold}>Register Shop</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>



          <View style={styles.footer}>
             <Text style={styles.footerText}>Secure Login Powered by</Text>
             <Text style={styles.footerBrand}>LOKALL CLOUD</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              {errorMessage?.includes('not registered') ? (
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
                      colors={COLORS.primaryGradient || ['#fb923c', '#ec4899']}
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
          // Safety fallback if onLogin wasn't called directly
          if (onLogin && pendingLoginData) {
            onLogin(pendingLoginData.role, pendingLoginData.user);
          }
        }}
      />
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
    backgroundColor: '#EFF6FF', // Light blue background
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
  heroImage: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 6,
    marginBottom: 30,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#0F172A',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 24,
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  methodItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  methodItemActive: {
    backgroundColor: '#F97316',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  methodTextActive: {
    color: '#FFF',
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
  inputGroup: {
    gap: 16,
    marginBottom: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  loginBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  registerBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  registerTextBold: {
    color: '#F97316',
    fontWeight: '800',
  },
  socialSection: {
    marginTop: 32,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footerBrand: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorModalMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
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
    color: '#0F172A',
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
    color: '#FFF',
  },
});

export default LoginScreen;
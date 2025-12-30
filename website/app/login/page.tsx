'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Briefcase, HelpCircle, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const [isLocalPlusMode, setIsLocalPlusMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const router = useRouter();

  useEffect(() => {
    if (showOtpScreen && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtpScreen, resendTimer]);

  const handleGetOtp = () => {
    if (loginMethod === 'mobile' && mobile.length < 10) return;
    if (loginMethod === 'email' && !email.includes('@')) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowOtpScreen(true);
      setResendTimer(30);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Redirect based on user type
      if (isLocalPlusMode) {
        router.push('/vendor/dashboard/analytics');
      } else {
        router.push('/');
      }
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericValue && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs[3].current?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      // Resend OTP logic here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-blue-500 p-6 sm:p-8 text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 relative z-10">
              {isLocalPlusMode ? (
                <Briefcase className="text-orange-500" size={40} />
              ) : (
                <ShoppingBag className="text-orange-500" size={40} />
              )}
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <Check className="text-white" size={14} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {isLocalPlusMode ? 'Local+ Business' : 'Local Market'}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm">
            {isLocalPlusMode ? 'Manage your business' : 'Discover local businesses'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="p-3 sm:p-4 bg-gray-50 flex gap-2">
          <button
            onClick={() => {
              setIsLocalPlusMode(false);
              setShowOtpScreen(false);
              setOtp(['', '', '', '']);
              setMobile('');
              setEmail('');
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              !isLocalPlusMode
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => {
              setIsLocalPlusMode(true);
              setShowOtpScreen(false);
              setOtp(['', '', '', '']);
              setMobile('');
              setEmail('');
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              isLocalPlusMode
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Business
          </button>
        </div>

        {/* Login Form */}
        <div className="p-5 sm:p-6">
          {!showOtpScreen ? (
            <>
              {/* Login Method Toggle */}
              <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLoginMethod('mobile')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all ${
                    loginMethod === 'mobile'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all ${
                    loginMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email
                </button>
              </div>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  {loginMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
                </label>
                {loginMethod === 'mobile' ? (
                  <div className="flex gap-2">
                    <div className="px-3 sm:px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm sm:text-base">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
                      maxLength={10}
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
                  />
                )}
              </div>

              <button
                onClick={handleGetOtp}
                disabled={isLoading || (loginMethod === 'mobile' && mobile.length < 10) || (loginMethod === 'email' && !email.includes('@'))}
                className="w-full py-3.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Get OTP
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  We sent a 4-digit code to
                </p>
                <p className="text-gray-900 font-semibold text-sm sm:text-base mt-1">
                  {loginMethod === 'mobile' ? `+91 ${mobile}` : email}
                </p>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex gap-2 sm:gap-3 mb-6 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    onFocus={(e) => e.target.select()}
                    id={`otp-${index}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 bg-white"
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join('').length !== 4}
                className="w-full py-3.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base mb-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setShowOtpScreen(false);
                    setOtp(['', '', '', '']);
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  ← Edit {loginMethod === 'mobile' ? 'Number' : 'Email'}
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={`font-medium transition-colors ${
                    resendTimer > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-orange-500 hover:text-orange-600'
                  }`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            {isLocalPlusMode && (
              <Link
                href="/vendor/register"
                className="block text-center text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
              >
                New Business? Register Here →
              </Link>
            )}
            <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm mx-auto transition-colors">
              <HelpCircle size={18} />
              <span>Need Help?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

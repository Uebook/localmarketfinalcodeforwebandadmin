
import React, { useState } from 'react';
import { Store, User, Smartphone, ArrowRight, CheckCircle, ShieldCheck, AlertCircle, Briefcase, Mail, Lock, Chrome } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'customer' | 'vendor') => void;
  onRegister?: () => void;
  vendorActivationStatus?: 'Active' | 'Pending' | 'Blocked';
  onSimulateAdminApproval?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin, 
  onRegister, 
  vendorActivationStatus,
  onSimulateAdminApproval 
}) => {
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;
    performLogin();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    performLogin();
  };

  const handleGoogleLogin = () => {
    performLogin();
  };

  const performLogin = () => {
    setIsLoading(true);
    
    // Simulate API verification & Status Check
    setTimeout(() => {
      setIsLoading(false);
      
      // Check Vendor Status strictly
      if (role === 'vendor') {
         if (vendorActivationStatus === 'Pending') {
            setErrorMsg("Vendor approval is pending");
            return;
         }
         if (vendorActivationStatus === 'Blocked') {
            setErrorMsg("Account Blocked. Contact Support.");
            return;
         }
      }

      onLogin(role);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-1000 ease-in-out ${
      role === 'vendor' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800' 
        : 'bg-gradient-to-br from-orange-900 via-pink-800 to-purple-900'
    }`}>
      
      {/* Premium Animated Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob ${role === 'vendor' ? 'bg-purple-600' : 'bg-yellow-200'}`}></div>
      <div className={`absolute top-[20%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 ${role === 'vendor' ? 'bg-blue-600' : 'bg-pink-300'}`}></div>
      <div className={`absolute bottom-[-10%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 ${role === 'vendor' ? 'bg-indigo-600' : 'bg-purple-300'}`}></div>

      {/* Frosted Glass Card */}
      <div className="z-10 w-full max-w-sm bg-white/85 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
        
        {/* Floating Header Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 -mt-16 mb-4 transform transition-transform hover:scale-110 duration-300`}>
             {role === 'vendor' ? (
                <Briefcase className="w-9 h-9 text-slate-700" strokeWidth={1.5} />
             ) : (
                <Store className="w-9 h-9 text-orange-500" strokeWidth={1.5} />
             )}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {role === 'vendor' ? 'Local+ Login' : 'Welcome'}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {role === 'vendor' ? 'Manage your Local+ business' : 'Login to access your local market'}
          </p>
        </div>

        {/* Error Message Display */}
        {errorMsg && (
           <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-3 text-center animate-shake">
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm mb-1">
                 <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {errorMsg === "Vendor approval is pending" 
                  ? "We are verifying your KYC. This usually takes 24-48 hours." 
                  : "Please contact support for assistance."}
              </p>
              
              {/* DEV ONLY: Simulate Approval Button */}
              {errorMsg === "Vendor approval is pending" && onSimulateAdminApproval && (
                 <button 
                   onClick={() => {
                      onSimulateAdminApproval();
                      setErrorMsg(null);
                      alert("Admin Approved! You can now login.");
                   }}
                   className="mt-2 text-[10px] font-bold text-blue-600 underline hover:text-blue-800"
                 >
                   (Dev: Simulate Admin Approval)
                 </button>
              )}
           </div>
        )}

        {/* Method Tabs */}
        {step === 'input' && (
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-6 backdrop-blur-md">
            <button 
              onClick={() => { setLoginMethod('phone'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'phone' 
                  ? 'bg-white shadow-sm text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
            <button 
              onClick={() => { setLoginMethod('email'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email' 
                  ? 'bg-white shadow-sm text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          </div>
        )}

        {/* Main Form Content */}
        <div className="min-h-[220px]"> 
        {step === 'input' ? (
          <>
            {/* Phone Login Form */}
            {loginMethod === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Mobile Number</label>
                  <div className={`flex items-center border rounded-2xl px-4 py-3.5 bg-white/60 backdrop-blur-sm transition-all shadow-sm group ${
                    role === 'vendor' 
                      ? 'border-slate-200 focus-within:border-slate-500 focus-within:ring-4 focus-within:ring-slate-500/10' 
                      : 'border-orange-100 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10'
                  }`}>
                    <span className="text-slate-400 font-bold mr-3 border-r border-slate-200 pr-3">+91</span>
                    <input 
                      type="tel" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10 digit number"
                      className="flex-1 bg-transparent outline-none text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400"
                      autoFocus
                    />
                    <Smartphone className={`w-5 h-5 transition-colors ${role === 'vendor' ? 'text-slate-400 group-focus-within:text-slate-600' : 'text-orange-300 group-focus-within:text-orange-500'}`} />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={mobile.length < 10 || isLoading}
                  className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    role === 'vendor'
                      ? 'bg-slate-800 shadow-slate-200 hover:bg-slate-900 hover:shadow-xl'
                      : 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-orange-200 hover:shadow-orange-300'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Get OTP <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            )}

            {/* Email Login Form */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Email Address</label>
                  <div className={`flex items-center border rounded-2xl px-4 py-3.5 bg-white/60 backdrop-blur-sm transition-all shadow-sm group ${
                     role === 'vendor' ? 'focus-within:border-slate-500' : 'focus-within:border-orange-500'
                  }`}>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="flex-1 bg-transparent outline-none text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400"
                      autoFocus
                    />
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Password</label>
                  <div className={`flex items-center border rounded-2xl px-4 py-3.5 bg-white/60 backdrop-blur-sm transition-all shadow-sm group ${
                     role === 'vendor' ? 'focus-within:border-slate-500' : 'focus-within:border-orange-500'
                  }`}>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent outline-none text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={!email || !password || isLoading}
                  className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    role === 'vendor'
                      ? 'bg-slate-800 shadow-slate-200 hover:bg-slate-900 hover:shadow-xl'
                      : 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-orange-200 hover:shadow-orange-300'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Login <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            )}

            {/* Google Login Option */}
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white/40 backdrop-blur-md px-2 text-slate-500 font-bold rounded">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
              >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 Google
              </button>
            </div>
          </>
        ) : (
          // OTP Form (Only for Mobile Flow)
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="text-center">
               <p className="text-sm font-medium text-slate-500 mb-6">
                 We've sent a 4-digit code to <br/>
                 <span className="font-bold text-slate-800 text-lg">+91 {mobile}</span>
                 <button type="button" onClick={() => setStep('input')} className="text-orange-500 font-bold ml-2 hover:underline text-xs bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Edit</button>
               </p>
               
               <div className="flex justify-center gap-3">
                 {[0, 1, 2, 3].map((_, idx) => (
                   <input
                     key={idx}
                     type="text"
                     maxLength={1}
                     value={otp[idx] || ''}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (val.match(/[0-9]/)) {
                         const newOtp = otp.split('');
                         newOtp[idx] = val;
                         setOtp(newOtp.join(''));
                         if (idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
                       } else if (val === '') {
                         const newOtp = otp.split('');
                         newOtp[idx] = '';
                         setOtp(newOtp.join(''));
                       }
                     }}
                     onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                            document.getElementById(`otp-${idx - 1}`)?.focus();
                        }
                     }}
                     id={`otp-${idx}`}
                     className={`w-14 h-16 border border-white/50 bg-white/60 backdrop-blur-md rounded-2xl text-center text-2xl font-bold text-slate-800 focus:ring-4 outline-none transition-all shadow-sm ${
                        role === 'vendor' 
                          ? 'focus:border-slate-500 focus:ring-slate-500/10'
                          : 'focus:border-orange-500 focus:ring-orange-500/10'
                     }`}
                   />
                 ))}
               </div>
             </div>

             <button 
               type="submit"
               disabled={otp.length < 4 || isLoading}
               className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                 role === 'vendor'
                   ? 'bg-slate-800 shadow-slate-200 hover:bg-slate-900 hover:shadow-xl'
                   : 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-orange-200 hover:shadow-orange-300'
               }`}
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <>Verify & Login <CheckCircle className="w-5 h-5" /></>
               )}
             </button>

             <div className="text-center">
                <button type="button" className="text-sm text-slate-400 font-bold hover:text-orange-600 transition-colors">
                  Resend OTP in 24s
                </button>
             </div>
          </form>
        )}
        </div>
        
        {/* Switcher */}
        {step === 'input' && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            {role === 'customer' ? (
              <div className="space-y-3">
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Partners & Local+</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { setRole('vendor'); setMobile(''); setErrorMsg(null); }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border border-transparent bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group"
                    >
                       <Briefcase className="w-6 h-6 text-slate-400 mb-1 group-hover:text-slate-800 transition-colors" />
                       <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Login to Local+</span>
                    </button>
                    <button 
                      onClick={onRegister}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border border-transparent bg-orange-50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group"
                    >
                       <Store className="w-6 h-6 text-orange-400 mb-1 group-hover:text-orange-600 transition-colors" />
                       <span className="text-xs font-bold text-orange-700 group-hover:text-orange-800">Register as Local+</span>
                    </button>
                 </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Not on Local+?</p>
                 <button 
                    onClick={() => { setRole('customer'); setMobile(''); setErrorMsg(null); }}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-bold text-slate-600 hover:shadow-sm"
                 >
                    <User className="w-4 h-4" /> Login as Customer
                 </button>
                 {onRegister && (
                   <div className="text-center">
                     <button 
                        onClick={onRegister}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                     >
                       Don't have a Local+ account? <span className="text-orange-600 font-bold hover:underline">Register New</span>
                     </button>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
           <ShieldCheck className="w-3 h-3" /> Secure & Trusted Marketplace
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

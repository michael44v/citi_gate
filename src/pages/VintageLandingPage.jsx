import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, ArrowRight, Lock, Phone, Mail, MapPin, ChevronRight, CheckCircle, Globe, UserPlus, UserCheck } from 'lucide-react';
import MeridianLogo from '../components/ui/MeridianLogo';

const VintageLandingPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinRequired, setPinRequired] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up state
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [signupLoading, setSignupLoading] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await login(email, password, pinRequired ? pin : null);
      if (res.success) {
        toast.success('Signed in successfully');
        navigate('/dashboard');
      } else if (res.pin_required) {
        setPinRequired(true);
        toast.error('Please enter your 4-digit transaction PIN');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm_password) {
      return toast.error('Passwords do not match');
    }
    setSignupLoading(true);
    try {
      const res = await axios.post('?action=register', signupData);
      if (res.data.status === 'success') {
        toast.success('Registration successful. Please verify your email.');
        navigate('/verify-email', { state: { user_id: res.data.data.user_id, email: signupData.email } });
      } else {
        toast.error(res.data.message || 'Registration failed');
      }
    } catch {
      toast.error('An error occurred during registration');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for reaching out! Our support team will get back to you shortly.');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const step1Complete = signupData.full_name && signupData.email && signupData.phone;
  const passwordsMatch = signupData.password && signupData.confirm_password && signupData.password === signupData.confirm_password;

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-serif text-[#1e293b] flex flex-col">
      {/* Top Header / Navigation Bar */}
      <header className="bg-[#0b2b1a] text-white border-b border-[#1b432a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MeridianLogo size="md" variant="light" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-sans font-medium text-emerald-100/80">
            <a href="#hero" className="hover:text-amber-300 transition-colors">Personal</a>
            <a href="#services" className="hover:text-amber-300 transition-colors">Commercial</a>
            <a href="#wealth" className="hover:text-amber-300 transition-colors">Wealth</a>
            <a href="#about" className="hover:text-amber-300 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-amber-300 transition-colors">Support</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#b59226] text-[#0b2b1a] font-sans font-bold text-sm rounded transition-colors shadow"
              >
                Go to Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="#auth-section"
                  onClick={() => setAuthMode('signin')}
                  className="px-4 py-2 bg-transparent hover:bg-[#134e32] text-amber-200 font-sans font-bold text-sm rounded border border-amber-400/40 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="#auth-section"
                  onClick={() => setAuthMode('signup')}
                  className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#b59226] text-[#0b2b1a] font-sans font-bold text-sm rounded transition-colors shadow"
                >
                  Open Account
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="bg-[#0b2b1a] text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-block px-3 py-1 bg-[#134e32] text-[#d4af37] text-xs font-sans uppercase font-bold tracking-widest rounded border border-[#236845]">
              Est. 1898 • Premier Institutional Banking
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white font-serif">
              Timeless Trust, Modern Financial Excellence
            </h1>
            <p className="text-lg text-emerald-100/90 max-w-xl font-sans font-light leading-relaxed">
              Experience private wealth solutions and high-yield savings programs backed by over a century of banking integrity and security guarantees.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <a
                href="#auth-section"
                onClick={() => setAuthMode('signup')}
                className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#b59226] text-[#0b2b1a] font-sans font-bold text-base rounded shadow-lg transition-all flex items-center gap-2"
              >
                Open an Account <ArrowRight size={18} />
              </a>
              <a
                href="#contact"
                className="px-6 py-3.5 bg-[#134e32] hover:bg-[#1a613f] text-white font-sans font-semibold text-base rounded border border-[#287950] transition-all"
              >
                Contact Advisor
              </a>
            </div>
          </div>

          {/* Embedded Auth Card (Tabs for Sign In and Sign Up) */}
          <div id="auth-section" className="lg:col-span-5 bg-white text-[#1e293b] p-6 sm:p-8 rounded-xl shadow-2xl border border-amber-200/50">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-3 text-center font-serif text-base font-bold transition-all border-b-2 ${
                  authMode === 'signin'
                    ? 'border-[#0b2b1a] text-[#0b2b1a]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 text-center font-serif text-base font-bold transition-all border-b-2 ${
                  authMode === 'signup'
                    ? 'border-[#0b2b1a] text-[#0b2b1a]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {authMode === 'signin' ? (
              /* SIGN IN FORM */
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-[#0b2b1a] rounded-full mb-2 border border-emerald-200">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#0b2b1a]">Secure Online Banking</h2>
                  <p className="text-xs text-slate-500 font-sans">Enter your CitiGate Bank credentials to sign in</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] focus:border-transparent outline-none transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] focus:border-transparent outline-none transition-all text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {pinRequired && (
                    <div className="animate-in fade-in zoom-in duration-200">
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                        4-Digit Transaction PIN
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        required
                        placeholder="••••"
                        className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-mono text-center tracking-widest text-lg"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input type="checkbox" className="rounded border-slate-300 text-[#0b2b1a] focus:ring-[#0b2b1a]" />
                      Remember me
                    </label>
                    <a href="/forgot-password" className="text-[#134e32] font-semibold hover:underline">Forgot Password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 bg-[#0b2b1a] hover:bg-[#134e32] text-white font-bold text-sm rounded shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    {loginLoading ? 'Authenticating...' : 'Sign In To CitiGate Bank Account'}
                  </button>
                </form>
              </div>
            ) : (
              /* SIGN UP FORM */
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 text-[#0b2b1a] rounded-full mb-2 border border-amber-200">
                    <UserPlus size={22} />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#0b2b1a]">Open an Account</h2>
                  <p className="text-xs text-slate-500 font-sans">Join thousands of institutional clients worldwide</p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4 font-sans text-xs">
                  {signupStep === 1 ? (
                    <>
                      <div>
                        <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Full Name (as per Govt ID)
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          required
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] outline-none text-sm"
                          value={signupData.full_name}
                          onChange={handleSignupChange}
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="john@example.com"
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] outline-none text-sm"
                          value={signupData.email}
                          onChange={handleSignupChange}
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="+1 234 567 8900"
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] outline-none text-sm"
                          value={signupData.phone}
                          onChange={handleSignupChange}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSignupStep(2)}
                        disabled={!step1Complete}
                        className={`w-full py-3.5 mt-2 font-bold text-sm rounded shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                          step1Complete
                            ? 'bg-[#0b2b1a] hover:bg-[#134e32] text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Create Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          placeholder="Minimum 8 characters"
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] outline-none text-sm"
                          value={signupData.password}
                          onChange={handleSignupChange}
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          required
                          placeholder="Re-enter password"
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-slate-300 rounded focus:ring-2 focus:ring-[#134e32] outline-none text-sm"
                          value={signupData.confirm_password}
                          onChange={handleSignupChange}
                        />
                      </div>

                      {signupData.confirm_password && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`text-xs font-semibold ${passwordsMatch ? 'text-emerald-700' : 'text-red-600'}`}>
                            {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </span>
                        </div>
                      )}

                      <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200/60 text-[11px] text-slate-600 leading-relaxed">
                        By creating an account, you agree to CitiGate Bank's Terms of Service and Privacy Policy.
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={signupLoading}
                          className="flex-1 py-3 bg-[#0b2b1a] hover:bg-[#134e32] text-white font-bold rounded text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center gap-2"
                        >
                          {signupLoading ? 'Creating Account...' : 'Submit Registration'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Services / Information Grid */}
      <section id="services" className="py-16 px-6 bg-[#f4f0e6] border-y border-[#e2dac8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-serif text-[#0b2b1a]">Financial Excellence & Integrity</h2>
            <p className="text-sm text-slate-600 font-sans">
              Tailored wealth management, personal financing solutions, and enterprise banking services backed by over a century of devotion to client prosperities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
            <div className="bg-white p-8 rounded-xl border border-amber-200/60 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0b2b1a] text-[#d4af37] rounded-lg flex items-center justify-center text-xl font-bold">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#0b2b1a]">High-Yield Savings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maximize interest returns with guaranteed fixed APY rates and direct liquidity access anytime, anywhere.
              </p>
              <a href="#auth-section" onClick={() => setAuthMode('signup')} className="inline-flex items-center text-xs font-bold text-[#134e32] hover:underline gap-1">
                Learn More <ChevronRight size={14} />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl border border-amber-200/60 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0b2b1a] text-[#d4af37] rounded-lg flex items-center justify-center text-xl font-bold">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#0b2b1a]">International Transfers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless multi-currency wire transfers and SWIFT integration across major global financial hubs.
              </p>
              <a href="#auth-section" onClick={() => setAuthMode('signup')} className="inline-flex items-center text-xs font-bold text-[#134e32] hover:underline gap-1">
                Explore Currency <ChevronRight size={14} />
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl border border-amber-200/60 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#0b2b1a] text-[#d4af37] rounded-lg flex items-center justify-center text-xl font-bold">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#0b2b1a]">Corporate Solutions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated treasury management, payroll protocols, and institutional asset protection tailored to your enterprise.
              </p>
              <a href="#contact" className="inline-flex items-center text-xs font-bold text-[#134e32] hover:underline gap-1">
                Contact Business Team <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Connect with Us / Contact Form Section */}
      <section id="contact" className="py-16 px-6 bg-[#fdfbf7] flex-1">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#0b2b1a]">Connect with us</h2>
                <p className="text-xs text-slate-500 font-sans mt-1">Listening to what you have to say about our CitiGate Bank services matters to us.</p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-[#fdfbf7] border border-slate-300 rounded focus:border-[#0b2b1a] outline-none"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[#fdfbf7] border border-slate-300 rounded focus:border-[#0b2b1a] outline-none"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write your query here..."
                    className="w-full px-4 py-3 bg-[#fdfbf7] border border-slate-300 rounded focus:border-[#0b2b1a] outline-none"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0b2b1a] hover:bg-[#134e32] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Get in Touch Info */}
            <div className="space-y-6 font-sans">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#0b2b1a]">Get in touch</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Whether you have a question about features, pricing, need a demo, or anything else, our CitiGate Bank support team is ready to answer all your questions.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-[#0b2b1a] uppercase">Headquarters:</h4>
                    <p className="text-slate-600">400 Robert Street North, Saint Paul, MN 55101, USA.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-[#0b2b1a] uppercase">Email:</h4>
                    <a href="mailto:support@citigatebank.com" className="text-[#134e32] font-semibold hover:underline">
                      support@citigatebank.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classic Footer */}
      <footer className="bg-[#071d11] text-slate-400 py-8 px-6 border-t border-[#133c24] font-sans text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CitiGate Bank. All rights reserved. Member FDIC. Equal Housing Lender.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Security & Fraud</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VintageLandingPage;

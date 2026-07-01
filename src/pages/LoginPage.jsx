import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useCart } from '../context/CartContext'

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState('mobile') // 'mobile' | 'email'
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [requestId, setRequestId] = useState('')
  const [step, setStep] = useState('request') // 'request' | 'verify' | 'register'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { fetchCart } = useCart()
  const rawRedirect = searchParams.get('redirect') || '/account';
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const redirect = (cleanBase && cleanBase !== '/' && rawRedirect.startsWith(cleanBase))
    ? (rawRedirect.slice(cleanBase.length) || '/')
    : rawRedirect;

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  async function handleRequestOtp() {
    if (loginMethod === 'mobile') {
      if (!/^\d{10}$/.test(mobileNumber)) {
        setError('Please enter a valid 10-digit mobile number')
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await api.auth.requestOtp(mobileNumber)
        setRequestId(data.requestId)
        setStep('verify')
        setTimer(30)
      } catch (e) {
        setError(e.message || 'Failed to request OTP')
      } finally {
        setLoading(false)
      }
    } else {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address')
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await api.auth.requestEmailOtp(email)
        setRequestId(data.requestId)
        setStep('verify')
        setTimer(30)
      } catch (e) {
        setError(e.message || 'Failed to request OTP')
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleResendOtp() {
    setLoading(true)
    setError('')
    try {
      if (loginMethod === 'mobile') {
        const data = await api.auth.resendOtp(mobileNumber, 'login')
        setRequestId(data.requestId)
      } else {
        const data = await api.auth.requestEmailOtp(email)
        setRequestId(data.requestId)
      }
      setTimer(30)
    } catch (e) {
      setError(e.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otp) {
      setError('Please enter the OTP sent to you')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = (loginMethod === 'mobile')
        ? await api.auth.verifyOtp(requestId, otp)
        : await api.auth.verifyEmailOtp(email, otp)
      
      if (data.verified) {
        setStep('register')
        return
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        await fetchCart()
        navigate(redirect)
      }
    } catch (e) {
      setError(e.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.register({
        fullName,
        mobileNumber,
        email: email || undefined,
      })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
      }
      await fetchCart()
      navigate(redirect)
    } catch (e) {
      setError(e.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-[210px] pb-12 lg:pt-12">
      <div className="w-[min(calc(100vw-2rem),440px)] bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#CE2028] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            {step === 'register' ? 'Complete Profile' : 'Welcome to MillToMeal'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 'request' && `Enter your ${loginMethod === 'mobile' ? 'mobile number' : 'email address'} to login or register`}
            {step === 'verify' && `Enter the OTP sent to ${loginMethod === 'mobile' ? `+91 ${mobileNumber}` : email}`}
            {step === 'register' && 'Help us know you better to complete setup'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        {step === 'request' && (
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 mb-2">
              <button
                type="button"
                onClick={() => { setLoginMethod('mobile'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  loginMethod === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Email Address
              </button>
            </div>

            {loginMethod === 'mobile' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="bg-gray-100 border border-gray-300 rounded-lg w-12 shrink-0 py-3 text-gray-600 font-medium flex items-center justify-center">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition font-medium"
                />
              </div>
            )}

            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-bold flex justify-center items-center gap-2"
            >
              {loading ? 'Requesting...' : 'Request OTP'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-center tracking-widest text-lg font-bold"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-bold flex justify-center items-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={handleResendOtp}
                disabled={timer > 0 || loading}
                className="text-primary-600 font-medium text-sm hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
            
            <button
              onClick={() => setStep('request')}
              className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700 transition mt-2 block"
            >
              Change {loginMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
            </button>
          </div>
        )}

        {step === 'register' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition font-medium"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-bold flex justify-center items-center gap-2"
            >
              {loading ? 'Completing Setup...' : 'Complete Registration'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

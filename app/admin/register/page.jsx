// app/admin/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        router.push('/admin/login?registered=true');
      } else {
        // Handle validation errors from server
        if (data.error.includes('already exists')) {
          if (data.error.includes('username')) {
            setErrors({ username: 'Username already taken' });
          } else if (data.error.includes('email')) {
            setErrors({ email: 'Email already registered' });
          } else {
            setErrors({ general: data.error });
          }
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return null;
    
    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^a-zA-Z0-9]/.test(formData.password)) strength++;

    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500'
    ];

    return {
      level: strength - 1,
      text: strengthText[strength - 1] || 'Very Weak',
      color: strengthColor[strength - 1] || 'bg-red-500',
      width: `${(strength / 5) * 100}%`
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create Admin Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Register to access the admin panel
          </p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {errors.general}
          </div>
        )}

        {/* Success Message from Redirect */}
        {router.query?.registered && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Registration successful! Please login.
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
                  ${errors.username 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } dark:bg-gray-700 dark:text-white`}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
                  ${errors.email 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } dark:bg-gray-700 dark:text-white`}
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
                  ${errors.password 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } dark:bg-gray-700 dark:text-white`}
                placeholder="Enter password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Password Strength:
                  </span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.level >= 4 ? 'text-green-600' :
                    passwordStrength.level >= 3 ? 'text-blue-600' :
                    passwordStrength.level >= 2 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
                <ul className="mt-2 text-xs space-y-1">
                  <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                    <i className={`fas ${formData.password.length >= 6 ? 'fa-check-circle' : 'fa-circle'} mr-1 text-xs`}></i>
                    At least 6 characters
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <i className={`fas ${/[a-z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'} mr-1 text-xs`}></i>
                    One lowercase letter
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <i className={`fas ${/[A-Z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'} mr-1 text-xs`}></i>
                    One uppercase letter
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    <i className={`fas ${/[0-9]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'} mr-1 text-xs`}></i>
                    One number
                  </li>
                </ul>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
                  ${errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } dark:bg-gray-700 dark:text-white`}
                placeholder="Confirm password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Match Indicator */}
          {formData.password && formData.confirmPassword && (
            <div className={`flex items-center text-sm ${
              formData.password === formData.confirmPassword 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              <i className={`fas ${
                formData.password === formData.confirmPassword 
                  ? 'fa-check-circle' 
                  : 'fa-exclamation-circle'
              } mr-2`}></i>
              {formData.password === formData.confirmPassword 
                ? 'Passwords match' 
                : 'Passwords do not match'}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                Register
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/admin/login" 
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <i className="fas fa-shield-alt mr-1"></i>
            This is a secure area. All registrations are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}
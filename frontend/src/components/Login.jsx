import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onForgotPassword }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
      result = await register(formData.name, formData.email, formData.password);
    }

    if (!result.success) {
      if (result.error === 'Invalid credentials' && isLogin) {
        setError("Email or password is incorrect.");
      } else if (result.error === 'User already exists') {
        setError('An account with this email already exists.');
        setIsLogin(true);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">InternTrack</h1>
        <p className="text-gray-600 mb-6">Track your internship applications</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleSwitchMode()}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode()}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Password</label>
              {isLogin && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
              required
              minLength={isLogin ? 1 : 8}
            />
            {!isLogin && (
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
              </ul>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              {error.includes('incorrect') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleSwitchMode}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Create a new account instead
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {isLogin ? (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchMode}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchMode}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Login
              </button>
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your data is private and secure. We don't share your information.
          </p>
        </div>
      </div>
    </div>
  );
}
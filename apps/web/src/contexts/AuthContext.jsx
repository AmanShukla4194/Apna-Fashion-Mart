'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { configureAmplify } from '../lib/aws/config';

const AuthContext = createContext(null);

const defaultAuthValue = {
  currentUser: null,
  profile: null,
  user: null,
  session: null,
  loading: true,
  initialLoading: true,
  isAuthenticated: false,
  isCustomer: false,
  isVendor: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  confirmSignUp: async () => {},
  resendConfirmationCode: async () => {},
  forgotPassword: async () => {},
  confirmForgotPassword: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? defaultAuthValue;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Configure Amplify once on mount
  useEffect(() => {
    configureAmplify();
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const [authSession, attributes] = await Promise.all([
        fetchAuthSession(),
        fetchUserAttributes(),
      ]);
      const token = authSession.tokens?.idToken?.toString() ?? null;
      setSession({ token, userId: cognitoUser.userId });

      const userObj = buildUserObject(cognitoUser, attributes);
      setCurrentUser(userObj);

      // Fetch profile from API to get role and extra fields
      try {
        const { getUserProfile } = await import('../lib/api');
        const apiProfile = await getUserProfile();
        setProfile(apiProfile);
        setCurrentUser((prev) => ({ ...prev, role: apiProfile.role }));
      } catch {
        // profile endpoint may not exist yet — role defaults to 'customer'
      }
    } catch {
      // no session
      setCurrentUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setInitialLoading(false);
    }
  };

  const buildUserObject = (cognitoUser, attributes) => ({
    id: cognitoUser.userId,
    username: cognitoUser.username,
    email: attributes?.email ?? '',
    name: attributes?.name ?? attributes?.['custom:name'] ?? '',
    role: attributes?.['custom:role'] ?? 'customer',
  });

  const login = async (email, password) => {
    configureAmplify();
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
    if (!isSignedIn) return { nextStep };

    const [cognitoUser, authSession, attributes] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
      fetchUserAttributes(),
    ]);

    const token = authSession.tokens?.idToken?.toString() ?? null;
    setSession({ token, userId: cognitoUser.userId });

    const userObj = buildUserObject(cognitoUser, attributes);
    setCurrentUser(userObj);

    // Fetch profile for role
    try {
      const { getUserProfile } = await import('../lib/api');
      const apiProfile = await getUserProfile();
      setProfile(apiProfile);
      setCurrentUser((prev) => ({ ...prev, role: apiProfile.role }));
      return { user: userObj, profile: apiProfile };
    } catch {
      setProfile(null);
      return { user: userObj, profile: null };
    }
  };

  const confirmSignUp = async (email, code) => {
    configureAmplify();
    await amplifyConfirmSignUp({ username: email, confirmationCode: code });
  };

  const resendConfirmationCode = async (email) => {
    configureAmplify();
    await amplifyResendCode({ username: email });
  };

  const forgotPassword = async (email) => {
    configureAmplify();
    await amplifyResetPassword({ username: email });
  };

  const confirmForgotPassword = async (email, code, newPassword) => {
    configureAmplify();
    await amplifyConfirmResetPassword({ username: email, confirmationCode: code, newPassword });
  };

  const signup = async (email, password, metadata = {}) => {
    configureAmplify();
    const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: metadata.name ?? '',
          'custom:role': metadata.role ?? 'customer',
        },
      },
    });
    return { isSignUpComplete, userId, nextStep };
  };

  const logout = async () => {
    configureAmplify();
    await amplifySignOut();
    setCurrentUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates) => {
    const { updateUserProfile } = await import('../lib/api');
    const updated = await updateUserProfile(updates);
    setProfile(updated);
    if (updates.name || updates.role) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    return updated;
  };

  const role = currentUser?.role ?? profile?.role ?? 'customer';

  const value = {
    currentUser,
    profile,
    user: currentUser,
    session,
    loading: initialLoading,
    initialLoading,
    isAuthenticated: !!currentUser,
    isCustomer: role === 'customer',
    isVendor: role === 'vendor',
    isAdmin: role === 'admin',
    login,
    logout,
    signup,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    signIn: login,
    signOut: logout,
    signUp: signup,
    updateProfile,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

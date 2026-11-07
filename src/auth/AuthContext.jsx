import React, { createContext, useContext, useState, useEffect } from 'react';
import db from '../database/db';
import { auditRepository } from '../database/repositories/auditRepository';
import { ROLE_PERMISSIONS, DEMO_ACCOUNTS } from './credentials';
import { normalizeRole, ROLES } from './roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('the_school_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('the_school_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('the_school_user');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      let matched = null;

      // 1. Check in Supabase PostgreSQL users table
      try {
        matched = await db.users
          .where('username').equalsIgnoreCase(username)
          .first();
      } catch (err) {
        console.warn('Supabase DB users fetch notice:', err);
      }

      // 2. Demo accounts fallback if user table is syncing or matching demo credentials
      if (!matched) {
        const demo = DEMO_ACCOUNTS.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
        if (demo && demo.password === password) {
          const entityMap = {
            'Teacher': 'TCH-00002',
            'Accountant': 'STF-00001',
            'Parent': 'PAR-00001',
            'Student': 'STU-00001'
          };
          matched = {
            id: demo.role.toLowerCase().replace(/\s+/g, '-'),
            username: demo.username,
            password: demo.password,
            role: demo.role,
            name: demo.name,
            email: `${demo.username}@theschool.edu`,
            phone: '+91 98765 00000',
            entityId: entityMap[demo.role] || null,
            schoolId: 'SCH-00001'
          };
        }
      }

      if (!matched || matched.password !== password) {
        throw new Error('Invalid username or password.');
      }

      const canonicalRole = normalizeRole(matched.role);

      const sessionUser = {
        id: matched.id,
        username: matched.username,
        role: canonicalRole,
        name: matched.name,
        email: matched.email,
        phone: matched.phone,
        entityId: matched.entityId || null,
        schoolId: matched.schoolId || 'SCH-00001',
        loginTime: new Date().toISOString()
      };

      setUser(sessionUser);

      try {
        await auditRepository.log('USER_LOGIN', 'Auth', sessionUser.username, `User logged in as ${sessionUser.role}`, sessionUser);
      } catch (e) {
        // non-blocking
      }

      return { success: true, user: sessionUser };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      try {
        await auditRepository.log('USER_LOGOUT', 'Auth', user.username, 'User logged out', user);
      } catch (e) {
        // non-blocking
      }
    }
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const role = normalizeRole(user.role);
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.includes('all')) return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

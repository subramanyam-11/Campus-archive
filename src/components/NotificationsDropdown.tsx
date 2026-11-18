'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  type AppNotification,
} from '@/lib/firebase/firestore';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'guest',
    title: 'New Event Approval Request',
    message: 'ACM Student Chapter submitted "National Symposium on Quantum Computing" for faculty review.',
    type: 'approval',
    read: false,
    link: '/faculty',
    timestamp: '10m ago',
  },
  {
    id: 'notif-2',
    userId: 'guest',
    title: 'Certificate Dispatched',
    message: 'Your certificate for "Deep Learning Bootcamp" is verified and ready for download.',
    type: 'certificate',
    read: false,
    link: '/student/certificates',
    timestamp: '2h ago',
  },
  {
    id: 'notif-3',
    userId: 'guest',
    title: 'Statutory ATR Clearance Reminder',
    message: 'Overdue Action Taken Report for Hackathon 2024 is pending IQAC compliance sign-off.',
    type: 'event',
    read: true,
    link: '/head',
    timestamp: '1d ago',
  },
];

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadNotifs() {
      try {
        const records = await getNotifications(user!.uid);
        if (isMounted && records.length > 0) {
          setNotifications(records);
        }
      } catch {
        // Retain initial notifications fallback
      }
    }

    loadNotifs();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const notif of notifications) {
      if (!notif.read) {
        try {
          await markNotificationRead(notif.id);
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="View notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse shadow-md shadow-indigo-600/30">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden font-sans text-left">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => {
                    handleMarkAsRead(n.id);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 block transition-colors ${
                    n.read
                      ? 'hover:bg-slate-800/40 text-slate-400'
                      : 'bg-indigo-950/20 hover:bg-indigo-950/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                        n.type === 'approval'
                          ? 'text-emerald-400'
                          : n.type === 'certificate'
                          ? 'text-purple-400'
                          : 'text-indigo-400'
                      }`}
                    >
                      {n.type === 'approval'
                        ? 'verified'
                        : n.type === 'certificate'
                        ? 'workspace_premium'
                        : 'notifications'}
                    </span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{n.title}</span>
                        {n.timestamp && (
                          <span className="text-[10px] text-slate-500 shrink-0">{n.timestamp}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Inbox, Shield } from "lucide-react";
import Switch from "@/components/common/switch";

const NOTIFICATION_CATEGORIES = [
  { key: "queue", label: "Queue Entry" },
  { key: "messages", label: "Messages" },
  { key: "feedback", label: "Feedback Alert" },
];
const NOTIFICATION_CHANNELS = [
  { key: "email", label: "Email", icon: Mail },
  { key: "inbox", label: "Inbox", icon: Inbox },
];

// Types for notification preferences
interface NotificationPrefs {
  queue: { email: boolean; inbox: boolean };
  messages: { email: boolean; inbox: boolean };
  feedback: { email: boolean; inbox: boolean };
}

type CategoryKey = keyof NotificationPrefs;
type ChannelKey = keyof NotificationPrefs[CategoryKey];

const initialMockPrefs: NotificationPrefs = {
  queue: { email: true, inbox: true },
  messages: { email: false, inbox: true },
  feedback: { email: true, inbox: false },
};

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialMockPrefs);

  const handleToggle = (cat: CategoryKey, chan: ChannelKey) => {
    setPrefs((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [chan]: !prev[cat][chan] },
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
        <Inbox className="w-5 h-5" /> Notification Preferences
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Category</th>
              {NOTIFICATION_CHANNELS.map((chan) => (
                <th key={chan.key} className="text-center py-2 px-4 font-semibold text-gray-700">
                  <span className="flex items-center justify-center gap-1">
                    <chan.icon className="w-4 h-4" /> {chan.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <tr key={cat.key} className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">{cat.label}</td>
                {NOTIFICATION_CHANNELS.map((chan) => (
                  <td key={chan.key} className="py-3 px-4 text-center">
                    <Switch
                      checked={prefs[cat.key as CategoryKey][chan.key as ChannelKey]}
                      onCheckedChange={() => handleToggle(cat.key as CategoryKey, chan.key as ChannelKey)}
                      aria-label={`Toggle ${cat.label} via ${chan.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrivacyConsentCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-primary-light mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" /> Privacy & Consent
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Marketing Opt-In</span>
          <Switch checked={true} disabled aria-label="Marketing Opt-In (read only)" onCheckedChange={() => {}} />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/terms-of-service" className="text-primary-light underline font-medium">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy-policy" className="text-primary-light underline font-medium">Privacy Policy</Link>
        </div>
        <div className="text-xs text-gray-500 mt-2">Last updated: May 2024</div>
      </div>
    </div>
  );
}

const Setting = () => {
  return (
    <div className="w-full max-w-4xl mx-auto font-regular-eng p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-light flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your notification and privacy preferences</p>
      </div>
      <NotificationPreferences />
      <PrivacyConsentCard />
    </div>
  );
};

export default Setting;
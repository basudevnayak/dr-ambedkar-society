// app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalProgrammes: 0,
    totalEvents: 0,
    totalGallery: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load stats from localStorage
    const programmes = JSON.parse(localStorage.getItem('programmes') || '[]');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');

    setStats({
      totalVisitors: 1234, // This would come from analytics
      totalProgrammes: programmes.length,
      totalEvents: events.length,
      totalGallery: gallery.length
    });

    // Load recent activities
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    setRecentActivities(activities.slice(0, 5));
  }, []);

  const statCards = [
    { title: 'Total Visitors', value: stats.totalVisitors, icon: 'users', color: 'blue' },
    { title: 'Programmes', value: stats.totalProgrammes, icon: 'calendar-alt', color: 'green' },
    { title: 'Events', value: stats.totalEvents, icon: 'calendar-check', color: 'purple' },
    { title: 'Gallery Items', value: stats.totalGallery, icon: 'images', color: 'orange' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                <i className={`fas fa-${stat.icon} text-${stat.color}-600 dark:text-${stat.color}-400 text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton href="/admin/programmes/add" icon="plus-circle" label="Add Programme" color="green" />
            <QuickActionButton href="/admin/events/add" icon="calendar-plus" label="Add Event" color="blue" />
            <QuickActionButton href="/admin/gallery/add" icon="cloud-upload-alt" label="Upload Images" color="purple" />
            <QuickActionButton href="/admin/dropdowns" icon="bars" label="Manage Menus" color="orange" />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'add' ? 'bg-green-500' :
                    activity.type === 'update' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-600 dark:text-gray-400">{activity.message}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, icon, label, color }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors group`}
    >
      <i className={`fas fa-${icon} text-${color}-600 dark:text-${color}-400 text-2xl mb-2`}></i>
      <span className={`text-xs font-medium text-${color}-600 dark:text-${color}-400 text-center`}>
        {label}
      </span>
    </Link>
  );
}
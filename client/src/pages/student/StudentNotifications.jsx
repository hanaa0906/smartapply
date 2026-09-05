import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status transition logs, document verification alerts, and deadline notices.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition self-start sm:self-auto"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications in your feed.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => markAsRead(notif._id)}
              className={`p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition ${
                !notif.isRead ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-xl shrink-0 ${
                  !notif.isRead ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {notif.applicationId && (
                <Link
                  to={`/student/application/${notif.applicationId}`}
                  className="shrink-0 p-2 text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"
                >
                  View Tracker <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

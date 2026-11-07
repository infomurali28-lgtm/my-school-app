import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Plus, MessageSquare, Send, Sparkles } from 'lucide-react';
import { communicationRepository } from '../../database/repositories/communicationRepository';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function CommunicationManager() {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('notices');

  // New Notice Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    targetAudience: 'All',
    priority: 'Medium',
    publishDate: new Date().toISOString().split('T')[0]
  });

  // New Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    location: 'Main Auditorium',
    category: 'Academic'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ntc, evt] = await Promise.all([
      communicationRepository.getNotices(),
      communicationRepository.getEvents()
    ]);
    setNotices(ntc);
    setEvents(evt);
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!noticeData.title.trim()) return;
    await communicationRepository.addNotice({
      ...noticeData,
      schoolId: 'SCH-00001'
    });
    setIsNoticeModalOpen(false);
    loadData();
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventData.title.trim()) return;
    await communicationRepository.addEvent({
      ...eventData,
      schoolId: 'SCH-00001'
    });
    setIsEventModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600" />
            Communication & Campus Broadcasts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish circulars, manage the institutional event calendar, and dispatch notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Calendar} onClick={() => setIsEventModalOpen(true)}>
            Schedule Event
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsNoticeModalOpen(true)}>
            Publish Notice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="w-4 h-4" /> Notice Board ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" /> Calendar Events ({events.length})
        </button>
      </div>

      {/* Tab 1: Notices */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {notices.map(n => (
            <Card key={n.id} className="space-y-3 p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={n.priority === 'High' ? 'danger' : (n.priority === 'Medium' ? 'warning' : 'info')} size="xs">
                    {n.priority} Priority
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-semibold">{formatDate(n.publishDate)}</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{n.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{n.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Audience: <strong>{n.targetAudience}</strong></span>
                <span className="text-indigo-600 font-bold">Official Circular</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {events.map(evt => (
            <Card key={evt.id} className="p-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex flex-col items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] font-extrabold uppercase">{new Date(evt.startDate).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-xl font-extrabold leading-none">{new Date(evt.startDate).getDate()}</span>
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="xs">{evt.category}</Badge>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{evt.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{evt.description}</p>
                <p className="text-[10px] font-bold text-indigo-600 pt-1">📍 {evt.location}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {isNoticeModalOpen && (
        <Modal
          isOpen={isNoticeModalOpen}
          onClose={() => setIsNoticeModalOpen(false)}
          title="Publish Campus Circular"
          subtitle="Broadcast announcement to faculty, students, and parents"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsNoticeModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddNotice}>Publish Now</Button>
            </>
          }
        >
          <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                value={noticeData.title}
                onChange={e => setNoticeData({ ...noticeData, title: e.target.value })}
                placeholder="e.g. Science Fair Registration"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Content Message *</label>
              <textarea
                rows="4"
                required
                value={noticeData.content}
                onChange={e => setNoticeData({ ...noticeData, content: e.target.value })}
                placeholder="Notice description and instructions..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                <select
                  value={noticeData.targetAudience}
                  onChange={e => setNoticeData({ ...noticeData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="All">All Campus</option>
                  <option value="Students">Students Only</option>
                  <option value="Parents">Parents Only</option>
                  <option value="Teachers">Teachers / Faculty</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={noticeData.priority}
                  onChange={e => setNoticeData({ ...noticeData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title="Schedule Campus Event"
          subtitle="Add event to academic calendar"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddEvent}>Add Event</Button>
            </>
          }
        >
          <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={eventData.title}
                onChange={e => setEventData({ ...eventData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                rows="2"
                value={eventData.description}
                onChange={e => setEventData({ ...eventData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={e => setEventData({ ...eventData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={e => setEventData({ ...eventData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

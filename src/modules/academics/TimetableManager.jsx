import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, BookOpen, User, Trash2 } from 'lucide-react';
import db from '../../database/db';
import { academicRepository } from '../../database/repositories/academicRepository';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { DAYS_OF_WEEK, formatTime } from '../../utils/formatters';

export function TimetableManager() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('CLS-05');
  const [selectedSection, setSelectedSection] = useState('SEC-05-A');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Slot Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotData, setSlotData] = useState({
    day: 'Monday',
    periodNo: 1,
    subjectId: '',
    teacherId: '',
    startTime: '09:00',
    endTime: '09:45',
    roomNo: '201'
  });

  useEffect(() => {
    loadSetup();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection]);

  const loadSetup = async () => {
    const [cls, sec, sub, tch] = await Promise.all([
      db.classes.toArray(),
      db.sections.toArray(),
      db.subjects.toArray(),
      db.teachers.toArray()
    ]);
    setClasses(cls);
    setSections(sec);
    setSubjects(sub);
    setTeachers(tch);
    if (sub.length > 0) setSlotData(prev => ({ ...prev, subjectId: sub[0].id }));
    if (tch.length > 0) setSlotData(prev => ({ ...prev, teacherId: tch[0].id }));
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const data = await academicRepository.getTimetable(selectedClass, selectedSection);
      setTimetable(data);
    } catch (err) {
      console.error('Error loading timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    await academicRepository.saveTimetableSlot({
      ...slotData,
      schoolId: 'SCH-00001',
      classId: selectedClass,
      sectionId: selectedSection
    });
    setIsModalOpen(false);
    loadTimetable();
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Remove this schedule slot?')) {
      await academicRepository.deleteTimetableSlot(id);
      loadTimetable();
    }
  };

  const filteredSections = sections.filter(s => s.classId === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Class Timetable & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly subject schedule, assigned faculty periods, and classroom allocations.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Schedule Slot
        </Button>
      </div>

      {/* Class Selector */}
      <Card bodyClassName="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1">
          <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          >
            {filteredSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {DAYS_OF_WEEK.slice(0, 6).map(day => {
          const daySlots = timetable.filter(t => t.day === day).sort((a, b) => (a.periodNo || 1) - (b.periodNo || 1));
          return (
            <Card key={day} title={day} subtitle={`${daySlots.length} Scheduled Periods`} headerClassName="py-3 px-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-2.5">
                {daySlots.length === 0 ? (
                  <p className="py-4 text-center text-slate-400 text-xs">No periods scheduled for {day}.</p>
                ) : (
                  daySlots.map(slot => (
                    <div key={slot.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">P-{slot.periodNo}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{slot.subjectName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {slot.teacherName}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(slot.startTime)} - {formatTime(slot.endTime)} • Room {slot.roomNo || '201'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Timetable Period"
          subtitle={`Scheduling for ${selectedClass} - ${selectedSection}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddSlot}>Assign Slot</Button>
            </>
          }
        >
          <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                <select
                  value={slotData.day}
                  onChange={e => setSlotData({ ...slotData, day: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Period Number</label>
                <input
                  type="number"
                  value={slotData.periodNo}
                  onChange={e => setSlotData({ ...slotData, periodNo: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                <select
                  value={slotData.subjectId}
                  onChange={e => setSlotData({ ...slotData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Teacher *</label>
                <select
                  value={slotData.teacherId}
                  onChange={e => setSlotData({ ...slotData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="time"
                  value={slotData.startTime}
                  onChange={e => setSlotData({ ...slotData, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="time"
                  value={slotData.endTime}
                  onChange={e => setSlotData({ ...slotData, endTime: e.target.value })}
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

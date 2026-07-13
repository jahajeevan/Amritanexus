import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin } from '../lib/api.js';
import { createAccount, authenticate, accountExists } from '../lib/accounts.js';

const DataContext = createContext();

const initialEvents = [
  {
    id: 'evt-1',
    title: 'CodeStorm Hackathon',
    category: 'Hackathon',
    department: 'CSE',
    venue: 'Tech Arena Gate 1',
    mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Tech+Arena',
    date: '2026-05-15',
    time: '09:00',
    maxSeats: 100,
    seatsFilled: 94,
    status: 'Open',
    coordinator: 'Dr. Ramesh Kumar (CSE)',
    volunteers: ['Siddharth V', 'Priya K'],
    description: 'A 24-hour intense hackathon focusing on solving campus and municipal sustainability issues using web technologies and automated models. Bring your dev setup and team templates.',
    rules: '1. Teams of 2-4 members. 2. Strictly original code. 3. APIs must be disclosed in pitch slides. 4. Bring college ID.',
    announcements: [
      { id: 'ann-e1-1', title: 'Developer Kits Released', content: 'You can now download the developer API starter kits from the dashboard resources tab.', date: '2026-05-10', time: '14:00' }
    ],
    gallery: [
      { id: 'gal-e1-1', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', caption: 'Teams coding in tech bay' }
    ]
  },
  {
    id: 'evt-2',
    title: 'Innovation Summit',
    category: 'Startup',
    department: 'MBA',
    venue: 'Main Auditorium',
    mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Main+Auditorium',
    date: '2026-05-22',
    time: '10:30',
    maxSeats: 50,
    seatsFilled: 48,
    status: 'Almost Full',
    coordinator: 'Prof. Anitha Roy (MBA)',
    volunteers: ['Arjun Nair'],
    description: 'Connect with startup founders, venture capitalists, and university business alumni. Perfect for students seeking seed funding or startup internships.',
    rules: '1. Casual professional dress code. 2. Keep pitch decks under 5 slides. 3. Q&A round is mandatory.',
    announcements: [],
    gallery: []
  },
  {
    id: 'evt-3',
    title: 'IGNITE Cultural Night',
    category: 'Cultural',
    department: 'ECE',
    venue: 'Open Stage Ground',
    mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Sports+Complex',
    date: '2026-05-18',
    time: '18:00',
    maxSeats: 250,
    seatsFilled: 250,
    status: 'Closed',
    coordinator: 'Dr. Saraswathi M (ECE)',
    volunteers: ['Gokul S', 'Nehal Jain', 'Kavitha P'],
    description: 'The flagship cultural celebration of IGNITE 2026. Featuring live music performances, dance face-offs, classical recitals, and campus visual arts galleries.',
    rules: '1. Gates close at 18:30. 2. QR ticket check-in is mandatory. 3. Outside food not permitted.',
    announcements: [
      { id: 'ann-e3-1', title: 'Pass QR Required at Entrance', content: 'Make sure your student pass QR is saved offline. Cellular connectivity might be slow around the ground gate.', date: '2026-05-16', time: '10:00' }
    ],
    gallery: [
      { id: 'gal-e3-1', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', caption: 'Opening performance showcase' }
    ]
  }
];

const initialLeaderboard = [
  { dept: 'CSE', registrations: 140, checkins: 110, points: 1950 },
  { dept: 'AI', registrations: 98, checkins: 84, points: 1400 },
  { dept: 'Cyber Security', registrations: 72, checkins: 56, points: 1000 },
  { dept: 'ECE', registrations: 88, checkins: 70, points: 1230 },
  { dept: 'EEE', registrations: 45, checkins: 32, points: 610 },
  { dept: 'Mechanical', registrations: 54, checkins: 38, points: 730 },
  { dept: 'Civil', registrations: 32, checkins: 22, points: 430 },
  { dept: 'MBA', registrations: 60, checkins: 48, points: 840 },
];

const initialAnnouncements = [
  { id: 'gann-1', title: 'IGNITE 2026 Registrations Open', content: 'Official portal launch! Students can browse events and claim passes immediately. Contact coordinators for doubts.', date: '2026-06-13', time: '10:00' },
  { id: 'gann-2', title: 'Technical Certificate Template Verified', content: 'Faculty committee has approved certificate designs. Digital credentials will reflect on dashboards post attendance check-in.', date: '2026-06-13', time: '11:15' }
];

export function DataProvider({ children }) {
  const [events, setEvents] = useState(() => {
    const local = localStorage.getItem('ignite_events');
    return local ? JSON.parse(local) : initialEvents;
  });

  const [registrations, setRegistrations] = useState(() => {
    const local = localStorage.getItem('ignite_registrations');
    return local ? JSON.parse(local) : [];
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const local = localStorage.getItem('ignite_leaderboard');
    return local ? JSON.parse(local) : initialLeaderboard;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('ignite_announcements');
    return local ? JSON.parse(local) : initialAnnouncements;
  });

  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('ignite_user');
    return local ? JSON.parse(local) : null;
  });

  useEffect(() => {
    localStorage.setItem('ignite_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ignite_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('ignite_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('ignite_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ignite_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ignite_user');
    }
  }, [user]);

  // Auth Operations
  const signInStudent = (email, registerNum) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanReg = registerNum.toUpperCase().trim();
    
    // Auto extract name/dept for simplicity
    const nameMatch = cleanEmail.split('@')[0].split('.');
    const name = nameMatch.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    // Guess department from register number
    let dept = 'Computer Science';
    if (cleanReg.includes('AI')) dept = 'AI';
    else if (cleanReg.includes('CYS') || cleanReg.includes('SEC')) dept = 'Cyber Security';
    else if (cleanReg.includes('ECE')) dept = 'Electronics';
    else if (cleanReg.includes('EEE')) dept = 'Electronics'; // or similar
    else if (cleanReg.includes('ME')) dept = 'Mechanical';
    else if (cleanReg.includes('CE')) dept = 'Civil';
    else if (cleanReg.includes('BA')) dept = 'Management';
    else if (cleanReg.includes('CH')) dept = 'Chemical';

    const mockProfile = {
      id: `usr-${cleanReg}`,
      name: name || 'Student Guest',
      registerNum: cleanReg,
      rollNo: cleanReg,
      role: 'student',
      department: dept,
      year: 'III',
      email: cleanEmail,
      phone: '9446001234'
    };
    setUser(mockProfile);
    return { success: true, profile: mockProfile };
  };

  // Admin login — verified server-side (/api/admin-login) with a hashed
  // client-side fallback. Credentials live in env vars, never in source.
  const signInAdmin = async (email, password) => {
    const res = await adminLogin({ email, password });
    if (res.ok) {
      const adminProfile = {
        role: 'admin',
        email: res.email || email,
        name: res.name || 'Faculty Coordinator',
      };
      setUser(adminProfile);
      return { success: true, profile: adminProfile };
    }
    return { success: false, message: res.error || 'Invalid administrative credentials.' };
  };

  // Student sign-up: account is created AFTER OTP email verification (handled
  // by the auth view). Persists to Supabase when configured, else localStorage.
  const STUDENT_DOMAIN = '@cb.students.amrita.edu';
  const registerStudent = async (fields) => {
    if (!String(fields.email).trim().toLowerCase().endsWith(STUDENT_DOMAIN)) {
      return { success: false, message: 'Only official @cb.students.amrita.edu student emails are accepted.' };
    }
    const already = await accountExists(fields.email);
    if (already) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }
    const res = await createAccount(fields);
    if (res.success) setUser(res.profile);
    return res;
  };

  const loginStudent = async (email, password) => {
    const res = await authenticate(email, password);
    if (res.success) setUser(res.profile);
    return res;
  };

  const checkAccountExists = (email) => accountExists(email);

  const signOut = () => {
    setUser(null);
  };

  const logout = signOut;

  // Event Registrations
  const registerForEvent = (arg1, arg2) => {
    let eventId, studentInfo;
    if (typeof arg1 === 'string') {
      eventId = arg1;
      studentInfo = arg2;
    } else {
      studentInfo = arg1;
      eventId = arg2;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    if (event.seatsFilled >= event.maxSeats || event.status === 'Closed') {
      return { success: false, message: 'Registration has closed (maximum seats filled).' };
    }

    const sName = studentInfo.studentName || studentInfo.name || 'Student Guest';
    const sReg = (studentInfo.registerNum || studentInfo.rollNo || '').toUpperCase();

    // Check if student already registered for this event
    const exists = registrations.some(
      r => r.eventId === eventId && r.registerNum.toUpperCase() === sReg
    );
    if (exists) {
      return { success: false, message: 'You have already claimed a ticket for this event.' };
    }

    const regDate = new Date();
    const ticketId = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newReg = {
      id: `reg-${Date.now()}`,
      ticketId,
      name: sName,
      studentName: sName,
      registerNum: sReg,
      rollNo: sReg,
      department: studentInfo.department || 'Computer Science',
      year: studentInfo.year || 'III',
      email: studentInfo.email,
      phone: studentInfo.phone || '9446001234',
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventDate: event.date,
      eventTime: event.time,
      venue: event.venue || 'Tech Arena',
      registrationDate: regDate.toISOString().split('T')[0],
      registrationTime: regDate.toTimeString().split(' ')[0].slice(0, 5),
      status: 'Confirmed',
      attendance: 'absent',
      attended: false
    };

    // Update registrations
    setRegistrations(prev => [newReg, ...prev]);

    // Update event seat counter
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const filled = e.seatsFilled + 1;
        let newStatus = e.status;
        if (filled >= e.maxSeats) {
          newStatus = 'Closed';
        } else if (filled >= e.maxSeats * 0.9) {
          newStatus = 'Almost Full';
        }
        return { ...e, seatsFilled: filled, status: newStatus };
      }
      return e;
    }));

    // Update department leaderboard registrations metric
    setLeaderboard(prev => prev.map(l => {
      const matchName = l.dept || '';
      const deptNormalized = (studentInfo.department || 'Computer Science').toLowerCase();
      if (matchName.toLowerCase() === deptNormalized ||
          (deptNormalized.includes('computer') && matchName.toLowerCase() === 'cse') ||
          (deptNormalized.includes('electronics') && matchName.toLowerCase() === 'ece') ||
          (deptNormalized.includes('mechanical') && matchName.toLowerCase() === 'mechanical') ||
          (deptNormalized.includes('civil') && matchName.toLowerCase() === 'civil') ||
          (deptNormalized.includes('management') && matchName.toLowerCase() === 'mba') ||
          (deptNormalized.includes('chemical') && matchName.toLowerCase() === 'eee')) {
        const regs = l.registrations + 1;
        const pts = regs * 10 + l.checkins * 50;
        return { ...l, registrations: regs, points: pts };
      }
      return l;
    }));

    return { success: true, registration: newReg };
  };

  const cancelRegistration = (regId) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return { success: false, message: 'Ticket registration not found.' };

    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Cancelled' } : r));

    // Restore seat count
    setEvents(prev => prev.map(e => {
      if (e.id === reg.eventId) {
        const filled = Math.max(0, e.seatsFilled - 1);
        let newStatus = e.status;
        if (filled < e.maxSeats) {
          newStatus = 'Open';
        }
        return { ...e, seatsFilled: filled, status: newStatus };
      }
      return e;
    }));

    // Revert department stats
    setLeaderboard(prev => prev.map(l => {
      const matchName = l.dept || '';
      const deptNormalized = (reg.department || 'Computer Science').toLowerCase();
      if (matchName.toLowerCase() === deptNormalized ||
          (deptNormalized.includes('computer') && matchName.toLowerCase() === 'cse') ||
          (deptNormalized.includes('electronics') && matchName.toLowerCase() === 'ece')) {
        const regs = Math.max(0, l.registrations - 1);
        const pts = regs * 10 + l.checkins * 50;
        return { ...l, registrations: regs, points: pts };
      }
      return l;
    }));

    return { success: true };
  };

  // QR Attendance checkin operations
  const verifyAttendance = (regId) => {
    const reg = registrations.find(r => r.id === regId || r.ticketId === regId);
    if (!reg) return { success: false, message: 'Ticket code does not match database.' };
    if (reg.status === 'Cancelled') return { success: false, message: 'This ticket registration is Cancelled.' };
    if (reg.attended || reg.attendance === 'present') return { success: true, message: 'Student is already checked in.', registration: reg };

    setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, attendance: 'present', attended: true } : r));

    // Update leaderboard checkins
    setLeaderboard(prev => prev.map(l => {
      const matchName = l.dept || '';
      const deptNormalized = (reg.department || 'Computer Science').toLowerCase();
      if (matchName.toLowerCase() === deptNormalized ||
          (deptNormalized.includes('computer') && matchName.toLowerCase() === 'cse') ||
          (deptNormalized.includes('electronics') && matchName.toLowerCase() === 'ece')) {
        const checkins = l.checkins + 1;
        const pts = l.registrations * 10 + checkins * 50;
        return { ...l, checkins: checkins, points: pts };
      }
      return l;
    }));

    return { success: true, message: 'Attendance recorded successfully!', registration: { ...reg, attendance: 'present', attended: true } };
  };

  const markAttendance = verifyAttendance;

  // Admin Event Management operations
  const addEvent = (eventInfo) => {
    const newId = `evt-${Date.now()}`;
    const newEvent = {
      id: newId,
      title: eventInfo.title,
      category: eventInfo.category,
      department: eventInfo.department,
      venue: eventInfo.venue,
      mapsLink: eventInfo.mapsLink,
      date: eventInfo.date,
      time: eventInfo.time,
      maxSeats: parseInt(eventInfo.maxSeats) || 100,
      seatsFilled: 0,
      status: eventInfo.status || 'Open',
      coordinator: eventInfo.coordinator || 'Unassigned Faculty',
      volunteers: [],
      description: eventInfo.description || '',
      rules: eventInfo.rules || '',
      announcements: [],
      gallery: [],
      points: eventInfo.points || 50
    };
    setEvents(prev => [newEvent, ...prev]);
    return { success: true, event: newEvent };
  };

  const updateEvent = (arg1, arg2) => {
    let eventId, updatedInfo;
    if (typeof arg1 === 'string') {
      eventId = arg1;
      updatedInfo = arg2;
    } else {
      eventId = arg1.id;
      updatedInfo = arg1;
    }

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          ...updatedInfo,
          maxSeats: parseInt(updatedInfo.maxSeats) || e.maxSeats
        };
      }
      return e;
    }));
    return { success: true };
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    // Cancel registrations for deleted events
    setRegistrations(prev => prev.map(r => r.eventId === eventId ? { ...r, status: 'Cancelled' } : r));
    return { success: true };
  };

  const duplicateEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false };
    const dup = {
      ...event,
      id: `evt-${Date.now()}`,
      title: `${event.title} (Copy)`,
      seatsFilled: 0,
      status: 'Open',
      volunteers: [],
      announcements: [],
      gallery: []
    };
    setEvents(prev => [dup, ...prev]);
    return { success: true };
  };

  // Gallery uploads
  const addGalleryPhoto = (eventId, url, caption) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const photo = { id: `gal-${Date.now()}`, url, caption };
        return { ...e, gallery: [photo, ...e.gallery] };
      }
      return e;
    }));
  };

  // Volunteer recruitment
  const recruitStudentVolunteer = (eventId, studentName) => {
    let alreadyVolunteer = false;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        if (e.volunteers.includes(studentName)) {
          alreadyVolunteer = true;
          return e;
        }
        return { ...e, volunteers: [...e.volunteers, studentName] };
      }
      return e;
    }));
    return !alreadyVolunteer;
  };

  // General announcements
  const createAnnouncement = (title, content, eventId = null) => {
    const newNotice = {
      id: `gann-${Date.now()}`,
      title,
      content,
      eventId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5)
    };
    setAnnouncements(prev => [newNotice, ...prev]);
    return { success: true };
  };

  const addAnnouncement = (annInfo) => {
    const newAnn = {
      id: `gann-${Date.now()}`,
      title: annInfo.title,
      content: annInfo.content,
      date: annInfo.date || new Date().toLocaleDateString('en-IN'),
      time: annInfo.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    return { success: true, announcement: newAnn };
  };

  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    return { success: true };
  };

  return (
    <DataContext.Provider value={{
      events,
      registrations,
      leaderboard,
      announcements,
      user,
      signInStudent,
      signInAdmin,
      registerStudent,
      loginStudent,
      checkAccountExists,
      signOut,
      logout,
      registerForEvent,
      cancelRegistration,
      verifyAttendance,
      markAttendance,
      addEvent,
      updateEvent,
      deleteEvent,
      duplicateEvent,
      addGalleryPhoto,
      recruitStudentVolunteer,
      createAnnouncement,
      addAnnouncement,
      deleteAnnouncement
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used inside a DataProvider');
  }
  return context;
}


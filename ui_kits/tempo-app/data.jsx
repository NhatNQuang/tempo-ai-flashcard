// Tempo UI kit - shared sample data for non-upload surfaces
const AVATARS = [
  { name: 'Liam Walker' }, { name: 'Emily Johnson' }, { name: 'Alex Chen' },
  { name: 'Sarah Lee' }, { name: 'David Park' }, { name: 'Nina Patel' },
  { name: 'Kevin Tran' }, { name: 'Julia Kim' }, { name: 'Andrew Ng' },
];

const NAV_MAIN = [
  { id: 'learn', label: 'Learn', icon: 'graduation-cap' },
  { id: 'library', label: 'Library', icon: 'library' },
  { id: 'explore', label: 'Explore', icon: 'compass' },
//  { id: 'groups', label: 'Groups', icon: 'users' },
//  { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' },
];

const NAV_AI = [
  { id: 'tempo-ai', label: 'Tempo AI', icon: 'sparkles' },
  { id: 'exam-gen', label: 'Exam Generator', icon: 'file-check-2' },
  { id: 'import', label: 'Import Quizlet', icon: 'download' },
];

const STATS = [
  { label: 'Total Study Time', value: '128h 45m', delta: '18%', caption: 'vs May 5 - May 18', icon: 'clock', tone: 'violet' },
  { label: 'Cards Reviewed', value: '3,842', delta: '22%', caption: 'vs May 5 - May 18', icon: 'layers', tone: 'blue' },
  { label: 'Notes Created', value: '96', delta: '15%', caption: 'vs May 5 - May 18', icon: 'file-text', tone: 'green' },
  { label: 'Exams Taken', value: '24', delta: '33%', caption: 'vs May 5 - May 18', icon: 'clipboard-list', tone: 'amber' },
  { label: 'Average Mastery', value: '68%', delta: '12%', caption: 'vs May 5 - May 18', icon: 'target', tone: 'violet' },
];

const WEAK_TOPICS = [
  { name: 'Thermodynamics', pct: 42 }, { name: 'Backpropagation', pct: 48 },
  { name: 'Linear Algebra', pct: 55 }, { name: 'Operating Systems', pct: 61 },
  { name: 'Data Structures', pct: 67 },
];

const STUDY_BY_TYPE = [
  { name: 'Flashcards', pct: 52, color: 'var(--chart-1)' },
  { name: 'Notes', pct: 24, color: 'var(--chart-2)' },
  { name: 'Exams', pct: 16, color: 'var(--chart-3)' },
  { name: 'AI Chat (Tutor)', pct: 8, color: 'var(--chart-4)' },
];

const LEADERS = [
  { rank: 1, name: 'Emily Johnson', time: '142h 30m', verified: true },
  { rank: 2, name: 'You', time: '128h 45m', you: true },
  { rank: 3, name: 'David Park', time: '115h 20m' },
  { rank: 4, name: 'Sarah Lee', time: '98h 10m' },
  { rank: 5, name: 'Alex Chen', time: '87h 40m' },
];

const SPACES = [
  { name: 'Deep Learning', subject: 'Computer Science', tone: 'cs', mastery: 72, notes: 12, cards: 240, exams: 5, members: 4, due: 18, pinned: true },
  { name: 'Operating Systems', subject: 'Computer Science', tone: 'cs', mastery: 65, notes: 8, cards: 168, exams: 3, members: 6, due: 12, pinned: true },
  { name: 'Database Systems', subject: 'Computer Science', tone: 'cs', mastery: 58, notes: 7, cards: 132, exams: 2, members: 5, due: 6, pinned: true },
  { name: 'Linear Algebra', subject: 'Mathematics', tone: 'math', mastery: 80, notes: 10, cards: 200, exams: 4, members: 3, due: 8 },
  { name: 'Thermodynamics', subject: 'Physics', tone: 'physics', mastery: 40, notes: 5, cards: 86, exams: 1, members: 2, due: 32 },
  { name: 'Chemistry Basics', subject: 'Science', tone: 'science', mastery: 55, notes: 6, cards: 110, exams: 2, members: 3, due: 20 },
];

const TRENDING = [
  { rank: 1, name: 'Deep Learning Mastery', author: 'Julia Kim', notes: 12, cards: 450, exams: 5, learners: '2.3k', rating: '4.9', mastery: '+18%' },
  { rank: 2, name: 'Operating Systems Complete Guide', author: 'Alex Chen', notes: 9, cards: 320, exams: 4, learners: '1.8k', rating: '4.8', mastery: '+16%' },
  { rank: 3, name: 'Data Structures & Algorithms', author: 'Sarah Lee', notes: 15, cards: 600, exams: 6, learners: '3.1k', rating: '4.9', mastery: '+22%' },
  { rank: 4, name: 'Linear Algebra Essentials', author: 'David Park', notes: 8, cards: 250, exams: 3, learners: '1.2k', rating: '4.8', mastery: '+15%' },
];

const GROUPS = [
  { name: 'Deep Learning Squad', tone: 'cs', members: 12, desc: 'Master deep learning concepts and build AI models together.', resources: 24, notes: 8, cards: 356, next: 'Next session in 2h 30m', pro: true },
  { name: 'Algorithms Club', tone: 'science', members: 8, desc: 'Discuss and practice algorithms for coding interviews.', resources: 18, notes: 6, cards: 220, next: 'Next session tomorrow' },
  { name: 'Chemistry 101 Study Group', tone: 'math', members: 15, desc: 'Ace our chemistry exams with shared notes and questions.', resources: 32, notes: 14, cards: 512, next: 'Next session in 1d' },
  { name: 'Calculus Study Circle', tone: 'lang', members: 6, desc: 'Master calculus step by step with practice and discussions.', resources: 10, notes: 5, cards: 180, next: 'No upcoming session' },
];

const EXPLORE_GROUPS = [
  { name: 'System Design Community', desc: 'Learn system design and architecture together.', icon: 'code-xml', tone: 'cs', members: '+28', docs: 48, notes: 23, cards: 420, activity: 'Active now', active: true, hub: true },
  { name: 'Biology Students Hub', desc: 'Share notes, quizzes and study for exams.', icon: 'dna', tone: 'science', members: '+16', docs: 31, notes: 12, cards: 305, activity: '2h ago' },
  { name: 'English Literature Lovers', desc: 'Explore books, summaries and critical analysis.', icon: 'book-open', tone: 'lang', members: '+12', docs: 25, notes: 18, cards: 210, activity: 'Today' },
  { name: 'Data Science Learners', desc: 'From data analysis to ML, learn together.', icon: 'bar-chart-3', tone: 'math', members: '+35', docs: 56, notes: 30, cards: 615, activity: 'Active now', active: true },
  { name: 'Physics Problem Solvers', desc: 'Solve problems, discuss concepts, succeed.', icon: 'atom', tone: 'physics', members: '+9', docs: 19, notes: 7, cards: 142, activity: '1d ago' },
];

const AI_INSIGHTS = [
  { icon: 'trending-up', tone: 'green', title: "You're improving!", body: 'Your mastery score increased 12% this month.' },
  { icon: 'calendar-x', tone: 'red', title: 'Review overdue', body: '142 cards are overdue. Review them to boost retention.' },
  { icon: 'target', tone: 'amber', title: 'Weak topics detected', body: 'Thermodynamics, Backpropagation, and Linear Algebra need more practice.' },
  { icon: 'clock', tone: 'violet', title: 'Best time to study', body: "You're most productive between 7PM - 10PM." },
];

const UPLOAD_FILES = [];

Object.assign(window, { AVATARS, NAV_MAIN, NAV_AI, STATS, WEAK_TOPICS, STUDY_BY_TYPE, LEADERS, SPACES, TRENDING, GROUPS, EXPLORE_GROUPS, AI_INSIGHTS, UPLOAD_FILES });



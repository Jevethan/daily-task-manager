import React, { useState, useEffect } from 'react';
import LandingPopup from './components/LandingPopup';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLandingPopup, setShowLandingPopup] = useState(false);

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('fitnessGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('fitnessTasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [subLists, setSubLists] = useState(() => {
    const saved = localStorage.getItem('fitnessSubLists');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('goals');
  const [editingItem, setEditingItem] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const [showSubListModal, setShowSubListModal] = useState(false);
  const [subListName, setSubListName] = useState('');
  const [subListColor, setSubListColor] = useState('#ff9500');

  const [showSubListItemModal, setShowSubListItemModal] = useState(false);
  const [currentSubListId, setCurrentSubListId] = useState(null);
  const [subListItemInput, setSubListItemInput] = useState('');
  const [editingSubListItem, setEditingSubListItem] = useState(null);

  const [showSubListEditModal, setShowSubListEditModal] = useState(false);
  const [editingSubList, setEditingSubList] = useState(null);
  const [editSubListName, setEditSubListName] = useState('');
  const [editSubListColor, setEditSubListColor] = useState('#ff9500');

  const colorOptions = [
    { name: 'Orange', value: '#ff9500' },
    { name: 'Purple', value: '#bf5af2' },
    { name: 'Pink', value: '#ff2d55' },
    { name: 'Yellow', value: '#ffd60a' },
    { name: 'Cyan', value: '#5ac8fa' },
    { name: 'Indigo', value: '#5856d6' },
    { name: 'Teal', value: '#30d158' },
    { name: 'Red', value: '#ff3b30' },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('tracklistCurrentUser'));
    if (!user) {
      setShowLandingPopup(true);
    } else {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitnessGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fitnessTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('fitnessSubLists', JSON.stringify(subLists));
  }, [subLists]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('tracklistCurrentUser');
    setCurrentUser(null);
    setShowLandingPopup(true);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setInputValue('');
    setEditingItem(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setInputValue('');
    setEditingItem(null);
  };

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    const newItem = {
      id: Date.now(),
      text: inputValue,
      completed: false
    };

    if (modalType === 'goals') {
      setGoals([...goals, newItem]);
    } else {
      setTasks([...tasks, newItem]);
    }

    closeModal();
  };

  const handleItemClick = (item, type) => {
    setEditingItem(item);
    setModalType(type);
    setInputValue(item.text);
    setShowModal(true);
  };

  const handleUpdate = () => {
    if (!inputValue.trim() || !editingItem) return;

    if (modalType === 'goals') {
      setGoals(goals.map(g => g.id === editingItem.id ? { ...g, text: inputValue } : g));
    } else {
      setTasks(tasks.map(t => t.id === editingItem.id ? { ...t, text: inputValue } : t));
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!editingItem) return;

    if (modalType === 'goals') {
      setGoals(goals.filter(g => g.id !== editingItem.id));
    } else {
      setTasks(tasks.filter(t => t.id !== editingItem.id));
    }

    closeModal();
  };

  const toggleComplete = (id, type) => {
    if (type === 'goals') {
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const openSubListModal = () => {
    setShowSubListModal(true);
    setSubListName('');
    setSubListColor('#ff9500');
  };

  const closeSubListModal = () => {
    setShowSubListModal(false);
    setSubListName('');
    setSubListColor('#ff9500');
  };

  const handleCreateSubList = () => {
    if (!subListName.trim()) return;

    const newSubList = {
      id: Date.now(),
      name: subListName,
      color: subListColor,
      items: []
    };

    setSubLists([...subLists, newSubList]);
    closeSubListModal();
  };

  const openSubListItemModal = (subListId) => {
    setCurrentSubListId(subListId);
    setShowSubListItemModal(true);
    setSubListItemInput('');
    setEditingSubListItem(null);
  };

  const closeSubListItemModal = () => {
    setShowSubListItemModal(false);
    setSubListItemInput('');
    setEditingSubListItem(null);
    setCurrentSubListId(null);
  };

  const handleAddSubListItem = () => {
    if (!subListItemInput.trim() || !currentSubListId) return;

    const newItem = {
      id: Date.now(),
      text: subListItemInput,
      completed: false
    };

    setSubLists(subLists.map(sl => 
      sl.id === currentSubListId 
        ? { ...sl, items: [...sl.items, newItem] }
        : sl
    ));

    closeSubListItemModal();
  };

  const handleSubListItemClick = (subListId, item) => {
    setCurrentSubListId(subListId);
    setEditingSubListItem(item);
    setSubListItemInput(item.text);
    setShowSubListItemModal(true);
  };

  const handleUpdateSubListItem = () => {
    if (!subListItemInput.trim() || !editingSubListItem || !currentSubListId) return;

    setSubLists(subLists.map(sl => 
      sl.id === currentSubListId
        ? {
            ...sl,
            items: sl.items.map(item => 
              item.id === editingSubListItem.id 
                ? { ...item, text: subListItemInput }
                : item
            )
          }
        : sl
    ));

    closeSubListItemModal();
  };

  const handleDeleteSubListItem = () => {
    if (!editingSubListItem || !currentSubListId) return;

    setSubLists(subLists.map(sl => 
      sl.id === currentSubListId
        ? { ...sl, items: sl.items.filter(item => item.id !== editingSubListItem.id) }
        : sl
    ));

    closeSubListItemModal();
  };

  const toggleSubListItemComplete = (subListId, itemId) => {
    setSubLists(subLists.map(sl => 
      sl.id === subListId
        ? {
            ...sl,
            items: sl.items.map(item => 
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : sl
    ));
  };

  const openSubListEditModal = (subList) => {
    setEditingSubList(subList);
    setEditSubListName(subList.name);
    setEditSubListColor(subList.color);
    setShowSubListEditModal(true);
  };

  const closeSubListEditModal = () => {
    setShowSubListEditModal(false);
    setEditingSubList(null);
    setEditSubListName('');
    setEditSubListColor('#ff9500');
  };

  const handleUpdateSubList = () => {
    if (!editSubListName.trim() || !editingSubList) return;

    setSubLists(subLists.map(sl => 
      sl.id === editingSubList.id
        ? { ...sl, name: editSubListName, color: editSubListColor }
        : sl
    ));

    closeSubListEditModal();
  };

  const handleDeleteSubList = () => {
    if (!editingSubList) return;

    setSubLists(subLists.filter(sl => sl.id !== editingSubList.id));
    closeSubListEditModal();
  };

  const calculateProgress = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return { goalProgress, taskProgress, completedGoals, totalGoals, completedTasks, totalTasks };
  };

  const { goalProgress, taskProgress, completedGoals, totalGoals, completedTasks, totalTasks } = calculateProgress();

  if (showLandingPopup) {
    return <LandingPopup onClose={() => setShowLandingPopup(false)} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white font-sans pb-24">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold">TrackList</h1>
          {currentUser && <p className="text-xs text-gray-400">@{currentUser.username}</p>}
        </div>
        <div className="w-8"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mt-6 mb-6">
        <div className="bg-gradient-to-br from-[#007aff]/20 to-[#007aff]/5 border border-[#007aff]/30 rounded-3xl p-5">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="#1a1a1c" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r="44" stroke="#007aff" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(goalProgress / 100) * 276.46} 276.46`} className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007aff]">{Math.round(goalProgress)}%</div>
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-[#007aff]">Goals</div>
            <div className="text-xs text-gray-400 mt-1">{completedGoals}/{totalGoals} Complete</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#32d74b]/20 to-[#32d74b]/5 border border-[#32d74b]/30 rounded-3xl p-5">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="#1a1a1c" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r="44" stroke="#32d74b" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(taskProgress / 100) * 276.46} 276.46`} className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#32d74b]">{Math.round(taskProgress)}%</div>
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-[#32d74b]">Tasks</div>
            <div className="text-xs text-gray-400 mt-1">{completedTasks}/{totalTasks} Complete</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
        <div className="bg-gradient-to-br from-[#007aff]/10 to-[#007aff]/5 border border-[#007aff]/20 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#007aff]">Goals</h2>
            <button onClick={() => openModal('goals')} className="w-7 h-7 rounded-full bg-[#007aff] flex items-center justify-center hover:bg-[#0051d5] transition-colors shadow-lg shadow-[#007aff]/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-center text-gray-500 py-6 text-sm">No goals yet</p>
            ) : (
              goals.map(goal => (
                <div key={goal.id} onClick={() => handleItemClick(goal, 'goals')} className="bg-[#2c2c2e] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#3a3a3c] transition-colors border border-[#007aff]/10">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(goal.id, 'goals'); }} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${goal.completed ? 'bg-[#007aff] border-[#007aff]' : 'border-[#007aff]/50'}`}>
                      {goal.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm truncate ${goal.completed ? 'line-through text-gray-500' : 'text-white'} transition-all`}>{goal.text}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#32d74b]/10 to-[#32d74b]/5 border border-[#32d74b]/20 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#32d74b]">Tasks</h2>
            <button onClick={() => openModal('tasks')} className="w-7 h-7 rounded-full bg-[#32d74b] flex items-center justify-center hover:bg-[#28a745] transition-colors shadow-lg shadow-[#32d74b]/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-6 text-sm">No tasks yet</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} onClick={() => handleItemClick(task, 'tasks')} className="bg-[#2c2c2e] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#3a3a3c] transition-colors border border-[#32d74b]/10">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(task.id, 'tasks'); }} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-[#32d74b] border-[#32d74b]' : 'border-[#32d74b]/50'}`}>
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-white'} transition-all`}>{task.text}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {subLists.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
          {subLists.map(subList => (
            <div key={subList.id} className="rounded-3xl p-4 border" style={{ background: `linear-gradient(to bottom right, ${subList.color}20, ${subList.color}05)`, borderColor: `${subList.color}30` }}>
              <div className="flex items-center justify-between mb-3">
                <h2 onClick={() => openSubListEditModal(subList)} className="text-base font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: subList.color }}>{subList.name}</h2>
                <button onClick={() => openSubListItemModal(subList.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg" style={{ backgroundColor: subList.color, boxShadow: `0 4px 14px ${subList.color}30` }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subList.items.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">No items yet</p>
                ) : (
                  subList.items.map(item => (
                    <div key={item.id} onClick={() => handleSubListItemClick(subList.id, item)} className="bg-[#2c2c2e] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#3a3a3c] transition-colors border" style={{ borderColor: `${subList.color}10` }}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleSubListItemComplete(subList.id, item.id); }} className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={{ backgroundColor: item.completed ? subList.color : 'transparent', borderColor: item.completed ? subList.color : `${subList.color}80` }}>
                          {item.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm truncate ${item.completed ? 'line-through text-gray-500' : 'text-white'} transition-all`}>{item.text}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={openSubListModal} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fadeIn">
          <div className="bg-[#2c2c2e] rounded-t-3xl w-full max-w-md shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">{editingItem ? `Edit ${modalType === 'goals' ? 'Goal' : 'Task'}` : `New ${modalType === 'goals' ? 'Goal' : 'Task'}`}</h3>
              <button onClick={editingItem ? handleUpdate : handleAdd} className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center hover:bg-[#0051d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!inputValue.trim()}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Enter ${modalType === 'goals' ? 'goal' : 'task'}...`} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500" autoFocus />
              {editingItem && (
                <button onClick={handleDelete} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">Delete</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showSubListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fadeIn">
          <div className="bg-[#2c2c2e] rounded-t-3xl w-full max-w-md shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <button onClick={closeSubListModal} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">New Sub-List</h3>
              <button onClick={handleCreateSubList} className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center hover:bg-[#0051d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!subListName.trim()}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <input type="text" value={subListName} onChange={(e) => setSubListName(e.target.value)} placeholder="Enter list name..." className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 mb-6" autoFocus />
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Choose Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(color => (
                    <button key={color.value} onClick={() => setSubListColor(color.value)} className="relative h-12 rounded-lg transition-transform hover:scale-105" style={{ backgroundColor: color.value }}>
                      {subListColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubListItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fadeIn">
          <div className="bg-[#2c2c2e] rounded-t-3xl w-full max-w-md shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <button onClick={closeSubListItemModal} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">{editingSubListItem ? 'Edit Item' : 'New Item'}</h3>
              <button onClick={editingSubListItem ? handleUpdateSubListItem : handleAddSubListItem} className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center hover:bg-[#0051d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!subListItemInput.trim()}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <input type="text" value={subListItemInput} onChange={(e) => setSubListItemInput(e.target.value)} placeholder="Enter item..." className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500" autoFocus />
              {editingSubListItem && (
                <button onClick={handleDeleteSubListItem} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">Delete</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showSubListEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fadeIn">
          <div className="bg-[#2c2c2e] rounded-t-3xl w-full max-w-md shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <button onClick={closeSubListEditModal} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">Edit Sub-List</h3>
              <button onClick={handleUpdateSubList} className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center hover:bg-[#0051d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!editSubListName.trim()}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">List Name</label>
                <input type="text" value={editSubListName} onChange={(e) => setEditSubListName(e.target.value)} placeholder="Enter list name..." className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500" autoFocus />
              </div>
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Change Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(color => (
                    <button key={color.value} onClick={() => setEditSubListColor(color.value)} className="relative h-12 rounded-lg transition-transform hover:scale-105" style={{ backgroundColor: color.value }}>
                      {editSubListColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleDeleteSubList} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">Delete Sub-List</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
      `}</style>
    </div>
  );
}

export default App;

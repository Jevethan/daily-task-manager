import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

function RecurringTasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newFrequency, setNewFrequency] = useState('daily');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('recurringTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recurringTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask,
          frequency: newFrequency,
          completions: [],
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewTask('');
      setNewFrequency('daily');
    }
  };

  const toggleTaskCompletion = (id) => {
    const today = new Date().toDateString();
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const completions = task.completions || [];
          const alreadyCompleted = completions.includes(today);
          return {
            ...task,
            completions: alreadyCompleted
              ? completions.filter((date) => date !== today)
              : [...completions, today],
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const isCompletedToday = (task) => {
    const today = new Date().toDateString();
    return task.completions && task.completions.includes(today);
  };

  const getStreak = (task) => {
    if (!task.completions || task.completions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      if (task.completions.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const completedToday = tasks.filter(isCompletedToday).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Recurring Tasks</h2>
        <p className="text-purple-200 text-sm">Build habits with repeating tasks</p>
      </div>

      {/* Today's Progress */}
      {totalTasks > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-purple-200 text-sm font-medium">Today's Completions</span>
            <span className="text-white font-bold">
              {completedToday}/{totalTasks} tasks
            </span>
          </div>
        </div>
      )}

      {/* Add Task Input */}
      <div className="space-y-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a recurring task..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <select
            value={newFrequency}
            onChange={(e) => setNewFrequency(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={addTask}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/30"
          >
            <FiPlus className="text-xl" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-purple-300 text-lg">
              No recurring tasks yet. Create a habit to track!
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const streak = getStreak(task);
            const completedNow = isCompletedToday(task);
            
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all ${
                  completedNow
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                      completedNow
                        ? 'bg-green-500 border-green-500'
                        : 'border-purple-400 hover:border-purple-300'
                    }`}
                  >
                    {completedNow && <FiCheck className="text-white text-sm" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-lg transition-all ${
                          completedNow ? 'text-green-300' : 'text-white'
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full border border-purple-500/30">
                        {task.frequency}
                      </span>
                      {streak > 0 && (
                        <span className="text-orange-400 text-sm font-medium">
                          🔥 {streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecurringTasks;
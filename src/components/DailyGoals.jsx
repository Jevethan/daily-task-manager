import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

function DailyGoals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('dailyGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          text: newGoal,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewGoal('');
    }
  };

  const toggleGoal = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Today's Goals</h2>
        <p className="text-purple-200 text-sm">Set and track your daily fitness goals</p>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-200 text-sm font-medium">Progress</span>
            <span className="text-white font-bold">
              {completedCount}/{totalCount} completed
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Goal Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a new goal..."
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={addGoal}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/30"
        >
          <FiPlus className="text-xl" />
          Add
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-purple-300 text-lg">No goals yet. Add your first goal to get started!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                goal.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-purple-400 hover:border-purple-300'
                }`}
              >
                {goal.completed && <FiCheck className="text-white text-sm" />}
              </button>
              <span
                className={`flex-1 transition-all ${
                  goal.completed
                    ? 'text-green-300 line-through'
                    : 'text-white'
                }`}
              >
                {goal.text}
              </span>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{totalCount}</p>
            <p className="text-purple-300 text-sm mt-1">Total Goals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{completedCount}</p>
            <p className="text-purple-300 text-sm mt-1">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{totalCount - completedCount}</p>
            <p className="text-purple-300 text-sm mt-1">Remaining</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyGoals;
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminAssign = () => {
  const [moderators, setModerators] = useState([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState(null);
  const [numbersPerModerator, setNumbersPerModerator] = useState(2000);
  const [selectedModerators, setSelectedModerators] = useState(new Set());

  useEffect(() => {
    fetchModerators();
    fetchUnassignedCount();
  }, []);

  const fetchModerators = async () => {
    try {
      const { data, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setModerators(data || []);
    } catch (error) {
      console.error('Error fetching moderators:', error);
    }
  };

  const fetchUnassignedCount = async () => {
    try {
      const { count, error } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .is('assigned_moderator', null)
        .eq('status', 'pending');

      if (error) throw error;
      setUnassignedCount(count || 0);
    } catch (error) {
      console.error('Error fetching unassigned count:', error);
    }
  };

  const assignNumbers = async () => {
    if (selectedModerators.size === 0) {
      alert('Please select at least one moderator');
      return;
    }

    setAssigning(true);
    try {
      let totalAssigned = 0;
      const selectedModeratorsList = moderators.filter(m => selectedModerators.has(m.id));
      
      // Assign specific number of numbers to each selected moderator
      for (const moderator of selectedModeratorsList) {
        const { data: numbers, error: numbersError } = await supabase
          .from('phone_numbers')
          .select('id')
          .is('assigned_moderator', null)
          .eq('status', 'pending')
          .limit(numbersPerModerator);

        if (numbersError) throw numbersError;

        if (numbers && numbers.length > 0) {
          for (const number of numbers) {
            const { error } = await supabase
              .from('phone_numbers')
              .update({
                assigned_moderator: moderator.id,
                assigned_at: new Date().toISOString()
              })
              .eq('id', number.id);
            
            if (!error) totalAssigned++;
          }
        }
      }

      setResult({
        assigned: totalAssigned,
        moderators: selectedModerators.size,
        perModerator: numbersPerModerator
      });

      fetchUnassignedCount();
    } catch (error) {
      console.error('Error assigning numbers:', error);
      alert('Error assigning numbers: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Icon name="Users" className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Number Assignment
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Distribute unassigned phone numbers to active moderators
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Icon name="Phone" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unassigned Numbers</p>
                <p className="text-2xl font-semibold text-gray-900">{unassignedCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Icon name="Users" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selected Moderators</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedModerators.size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg">
                <Icon name="Target" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Per Moderator</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedModerators.size > 0 ? Math.floor(unassignedCount / selectedModerators.size).toLocaleString() : '0'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Icon name="CheckCircle" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Will Assign</p>
                <p className="text-2xl font-semibold text-gray-900">{(selectedModerators.size * numbersPerModerator).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Configuration */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Settings" className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">Assignment Configuration</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Numbers per moderator</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="100"
                  max="5000"
                  value={numbersPerModerator}
                  onChange={(e) => setNumbersPerModerator(parseInt(e.target.value) || 2000)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <button
                  onClick={() => setNumbersPerModerator(selectedModerators.size > 0 ? Math.floor(unassignedCount / selectedModerators.size) : 0)}
                  disabled={selectedModerators.size === 0}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Auto Calculate
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Assignment Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Will Assign:</span>
                  <span className="font-medium text-green-600">{(selectedModerators.size * numbersPerModerator).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-gray-900">{Math.max(0, unassignedCount - (selectedModerators.size * numbersPerModerator)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Moderator Selection */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Select Moderators</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedModerators(new Set(moderators.map(m => m.id)))}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedModerators(new Set())}
                      className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {moderators.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active moderators found</p>
                ) : (
                  <div className="space-y-3">
                    {moderators.map((moderator) => (
                      <div key={moderator.id} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedModerators.has(moderator.id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-transparent hover:border-gray-200'
                      }`} onClick={() => {
                        const newSelected = new Set(selectedModerators);
                        if (selectedModerators.has(moderator.id)) {
                          newSelected.delete(moderator.id);
                        } else {
                          newSelected.add(moderator.id);
                        }
                        setSelectedModerators(newSelected);
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedModerators.has(moderator.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          selectedModerators.has(moderator.id) 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                            : 'bg-gray-100'
                        }`}>
                          <Icon name="User" className={`h-5 w-5 ${
                            selectedModerators.has(moderator.id) ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            selectedModerators.has(moderator.id) ? 'text-blue-900' : 'text-gray-900'
                          }`}>{moderator.name}</div>
                          <div className="text-sm text-gray-500">{moderator.email}</div>
                        </div>
                        {selectedModerators.has(moderator.id) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Moderators:</span>
                  <span className="font-medium text-gray-900">{selectedModerators.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Numbers per Moderator:</span>
                  <span className="font-medium text-gray-900">{numbersPerModerator.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total to Assign:</span>
                  <span className="font-medium text-blue-600">{(selectedModerators.size * numbersPerModerator).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={assignNumbers}
                disabled={unassignedCount === 0 || selectedModerators.size === 0 || assigning}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  unassignedCount === 0 || selectedModerators.size === 0 || assigning
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {assigning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                    <span>Assigning...</span>
                  </div>
                ) : selectedModerators.size === 0 ? (
                  'Select Moderators First'
                ) : (
                  `Assign ${(selectedModerators.size * numbersPerModerator).toLocaleString()} Numbers`
                )}
              </button>
            </div>

            {result && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <Icon name="CheckCircle" className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-green-900">Assignment Complete</h3>
                </div>
                {result.message ? (
                  <p className="text-green-700">{result.message}</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Successfully Assigned:</span>
                      <span className="font-medium text-green-900">{result.assigned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Moderators:</span>
                      <span className="font-medium text-green-900">{result.moderators}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Per Moderator:</span>
                      <span className="font-medium text-green-900">{result.perModerator.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssign;
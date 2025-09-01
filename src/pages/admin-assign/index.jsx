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
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin - Assign Numbers to Moderators
          </h1>
          <p className="text-muted-foreground">
            Distribute unassigned phone numbers evenly among active moderators
          </p>
        </div>

        {/* Assignment Control */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="font-medium text-foreground mb-4">Assignment Control</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{unassignedCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Numbers</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{selectedModerators.size}</p>
              <p className="text-sm text-muted-foreground">Selected Moderators</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{selectedModerators.size > 0 ? Math.floor(unassignedCount / selectedModerators.size).toLocaleString() : '0'}</p>
              <p className="text-sm text-muted-foreground">Per Moderator (Auto)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Numbers per moderator:</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="100"
                  max="5000"
                  value={numbersPerModerator}
                  onChange={(e) => setNumbersPerModerator(parseInt(e.target.value) || 2000)}
                  className="w-32 px-3 py-2 border border-border rounded-md text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNumbersPerModerator(selectedModerators.size > 0 ? Math.floor(unassignedCount / selectedModerators.size) : 0)}
                  disabled={selectedModerators.size === 0}
                >
                  Auto Calculate
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Assignment Preview:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Will Assign:</span>
                  <span className="ml-2 font-medium text-green-600">{(selectedModerators.size * numbersPerModerator).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="ml-2 font-medium">{Math.max(0, unassignedCount - (selectedModerators.size * numbersPerModerator)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Icon name="Phone" size={24} className="text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{unassignedCount}</p>
                  <p className="text-sm text-muted-foreground">Unassigned Numbers</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Icon name="Users" size={24} className="text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{moderators.length}</p>
                  <p className="text-sm text-muted-foreground">Active Moderators</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Select Moderators</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModerators(new Set(moderators.map(m => m.id)))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModerators(new Set())}
                >
                  Clear All
                </Button>
              </div>
            </div>
            {moderators.length === 0 ? (
              <p className="text-muted-foreground">No active moderators found</p>
            ) : (
              <div className="space-y-2">
                {moderators.map((moderator) => (
                  <div key={moderator.id} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    selectedModerators.has(moderator.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-muted border-transparent'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedModerators.has(moderator.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedModerators);
                        if (e.target.checked) {
                          newSelected.add(moderator.id);
                        } else {
                          newSelected.delete(moderator.id);
                        }
                        setSelectedModerators(newSelected);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Icon name="User" size={16} className={selectedModerators.has(moderator.id) ? 'text-blue-600' : ''} />
                    <div className="flex-1">
                      <span className={`font-medium ${
                        selectedModerators.has(moderator.id) ? 'text-blue-900' : 'text-foreground'
                      }`}>{moderator.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({moderator.email})</span>
                    </div>
                    {selectedModerators.has(moderator.id) && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedModerators.size}</strong> moderators selected • 
                <strong>{(selectedModerators.size * numbersPerModerator).toLocaleString()}</strong> numbers will be assigned
              </p>
            </div>
          </div>

          <Button
            onClick={assignNumbers}
            disabled={unassignedCount === 0 || selectedModerators.size === 0 || assigning}
            className="w-full"
            loading={assigning}
          >
            {assigning ? 'Assigning Numbers...' : 
              selectedModerators.size === 0 
                ? 'Select Moderators First' 
                : `Assign ${(selectedModerators.size * numbersPerModerator).toLocaleString()} Numbers to ${selectedModerators.size} Moderators`
            }
          </Button>

          {result && (
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Assignment Results</h3>
              {result.message ? (
                <p className="text-muted-foreground">{result.message}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Successfully Assigned:</span> <span className="font-medium text-green-600">{result.assigned.toLocaleString()}</span></p>
                  <p><span className="text-muted-foreground">Moderators:</span> <span className="font-medium">{result.moderators}</span></p>
                  <p><span className="text-muted-foreground">Per Moderator:</span> <span className="font-medium">{result.perModerator.toLocaleString()} numbers</span></p>
                  <p className="text-green-600 font-medium">✅ Assignment Complete!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssign;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, PlusIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';
import { BlockedSlot, getBlockedSlots, saveBlockedSlot, deleteBlockedSlot, generateId } from '@/lib/storage';
import { getCurrentUser } from '@/lib/userStorage';
import { toast } from 'sonner';

export default function SlotManagement() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: ''
  });

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadBlockedSlots();
  }, []);

  const loadBlockedSlots = () => {
    const slots = getBlockedSlots();
    // Sort by date and time (most recent first)
    const sortedSlots = slots.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    setBlockedSlots(sortedSlots);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      reason: ''
    });
  };

  const handleCreateBlockedSlot = () => {
    if (!formData.date || !formData.time) {
      toast.error('Please select both date and time');
      return;
    }

    // Check if slot is already blocked
    const existingSlot = blockedSlots.find(
      slot => slot.date === formData.date && slot.time === formData.time
    );

    if (existingSlot) {
      toast.error('This time slot is already blocked');
      return;
    }

    // Check if date is in the past
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      toast.error('Cannot block past time slots');
      return;
    }

    const newSlot: BlockedSlot = {
      id: generateId(),
      date: formData.date,
      time: formData.time,
      reason: formData.reason || 'No reason specified',
      blockedBy: currentUser?.username || 'unknown',
      blockedAt: new Date().toISOString()
    };

    saveBlockedSlot(newSlot);
    loadBlockedSlots();
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('Time slot blocked successfully');
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('Are you sure you want to unblock this time slot?')) {
      deleteBlockedSlot(slotId);
      loadBlockedSlots();
      toast.success('Time slot unblocked successfully');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isSlotInPast = (date: string, time: string) => {
    const slotDateTime = new Date(`${date}T${time}`);
    return slotDateTime < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Slot Management</h2>
          <p className="text-gray-600">Block time slots to prevent new reservations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Block Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block Time Slot</DialogTitle>
              <DialogDescription>
                Prevent customers from booking this specific date and time
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={getMinDate()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Private event, Maintenance, Staff meeting..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBlockedSlot}>Block Slot</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocked</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedSlots.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <ClockIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {blockedSlots.filter(slot => !isSlotInPast(slot.date, slot.time)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Blocks</CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {blockedSlots.filter(slot => isSlotInPast(slot.date, slot.time)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocked Slots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Time Slots</CardTitle>
          <CardDescription>
            Manage blocked time slots to control restaurant availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockedSlots.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blocked slots</h3>
              <p className="text-gray-500">
                Block specific time slots to prevent customer bookings when needed.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {new Date(slot.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {slot.time}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isSlotInPast(slot.date, slot.time) ? 'secondary' : 'destructive'}
                        >
                          {isSlotInPast(slot.date, slot.time) ? 'Past' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{slot.reason}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{slot.blockedBy}</div>
                          <div className="text-gray-500">
                            {new Date(slot.blockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
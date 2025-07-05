import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface Appointment {
  id: string;
  patientId: string;
  title: string;
  description: string;
  comments: string;
  appointmentDate: string;
  cost: number;
  treatment: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  nextDate: string;
  files: Array<{ name: string; url: string }>;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    comments: '',
    appointmentDate: '',
    cost: 0,
    treatment: '',
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
    nextDate: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedAppointments = localStorage.getItem('dentalIncidents');
    const savedPatients = localStorage.getItem('dentalPatients');
    
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    }
  };

  const saveAppointments = (updatedAppointments: Appointment[]) => {
    localStorage.setItem('dentalIncidents', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  const handleSave = () => {
    if (!formData.patientId || !formData.title || !formData.appointmentDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let updatedAppointments;
    if (editingAppointment) {
      updatedAppointments = appointments.map(a => 
        a.id === editingAppointment.id ? { 
          ...editingAppointment, 
          ...formData,
          files: editingAppointment.files || []
        } : a
      );
      toast({
        title: "Success",
        description: "Appointment updated successfully"
      });
    } else {
      const newAppointment: Appointment = {
        id: `i${Date.now()}`,
        ...formData,
        files: []
      };
      updatedAppointments = [...appointments, newAppointment];
      toast({
        title: "Success",
        description: "Appointment scheduled successfully"
      });
    }

    saveAppointments(updatedAppointments);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      title: appointment.title,
      description: appointment.description,
      comments: appointment.comments,
      appointmentDate: appointment.appointmentDate.slice(0, 16),
      cost: appointment.cost,
      treatment: appointment.treatment,
      status: appointment.status,
      nextDate: appointment.nextDate ? appointment.nextDate.slice(0, 16) : ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: '',
      cost: 0,
      treatment: '',
      status: 'Scheduled',
      nextDate: ''
    });
    setEditingAppointment(null);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600 mt-2">Schedule and manage patient appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Routine Checkup"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Appointment Date & Time *</Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the appointment"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Additional notes or comments"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Treatment provided"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'Scheduled' | 'Completed' | 'Cancelled') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDate">Next Appointment Date</Label>
                <Input
                  id="nextDate"
                  type="datetime-local"
                  value={formData.nextDate}
                  onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="files">Upload Files</Label>
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) return;
                    const fileArray = Array.from(files);
                    const base64Files = await Promise.all(
                      fileArray.map(file => new Promise<{ name: string; url: string }>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({ name: file.name, url: reader.result as string });
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                      }))
                    );
                    setEditingAppointment((prev) => {
                      const updatedFiles = prev?.files ? [...prev.files, ...base64Files] : base64Files;
                      return prev ? { ...prev, files: updatedFiles } : null;
                    });
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingAppointment?.files && editingAppointment.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingAppointment.files.map((file, index) => (
                      <div key={index} className="border rounded p-1 bg-gray-50 flex items-center space-x-2">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                          {file.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAppointment((prev) => {
                              if (!prev) return null;
                              const newFiles = prev.files.filter((_, i) => i !== index);
                              return { ...prev, files: newFiles };
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove file"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAppointment ? 'Update' : 'Schedule'} Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            All Appointments ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled. Schedule your first appointment to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {getPatientName(appointment.patientId)}
                    </TableCell>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {appointment.cost}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsPage;

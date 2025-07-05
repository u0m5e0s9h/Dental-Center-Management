import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, Activity } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface Patient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patientId: string;
  title: string;
  description: string;
  appointmentDate: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  treatment: string;
  cost: number;
}

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dayAppointments = appointments.filter(appointment =>
        isSameDay(new Date(appointment.appointmentDate), selectedDate)
      );
      setSelectedDateAppointments(dayAppointments);
      if (dayAppointments.length > 0) {
        setIsDialogOpen(true);
      }
    }
  }, [selectedDate, appointments]);

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

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment =>
      isSameDay(new Date(appointment.appointmentDate), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const currentMonth = selectedDate ? selectedDate : new Date();
  const monthlyAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    return appointmentDate >= startOfMonth(currentMonth) && appointmentDate <= endOfMonth(currentMonth);
  });

  const modifiers = {
    hasAppointments: (date: Date) => getAppointmentsForDate(date).length > 0
  };

  const modifiersStyles = {
    hasAppointments: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontWeight: 'bold'
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-600 mt-2">View and manage appointments by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border w-full"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>• Blue highlighted dates have scheduled appointments</p>
              <p>• Click on a date to view appointment details</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Appointments</span>
              <Badge variant="secondary">{monthlyAppointments.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Scheduled</span>
              <Badge className="bg-blue-100 text-blue-800">
                {monthlyAppointments.filter(a => a.status === 'Scheduled').length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <Badge className="bg-green-100 text-green-800">
                {monthlyAppointments.filter(a => a.status === 'Completed').length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelled</span>
              <Badge className="bg-red-100 text-red-800">
                {monthlyAppointments.filter(a => a.status === 'Cancelled').length}
              </Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="font-bold text-green-600">
                  ${monthlyAppointments.filter(a => a.status === 'Completed').reduce((sum, a) => sum + a.cost, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments This Month</CardTitle>
        </CardHeader>
      <CardContent>
          {monthlyAppointments.filter(a => new Date(a.appointmentDate) >= new Date(new Date().setHours(0,0,0,0)) && a.status === 'Scheduled').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming appointments this month
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyAppointments
                .filter(a => new Date(a.appointmentDate) >= new Date(new Date().setHours(0,0,0,0)) && a.status === 'Scheduled')
                .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{getPatientName(appointment.patientId)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.title}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, HH:mm')}</span>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Appointments for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDateAppointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled for this date.</p>
            ) : (
              <div className="space-y-4">
                {selectedDateAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.title}</h3>
                        <p className="text-gray-600">{getPatientName(appointment.patientId)}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Time:</span> {format(new Date(appointment.appointmentDate), 'HH:mm')}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${appointment.cost}
                      </div>
                      {appointment.treatment && (
                        <div className="col-span-2">
                          <span className="font-medium">Treatment:</span> {appointment.treatment}
                        </div>
                      )}
                      {appointment.description && (
                        <div className="col-span-2">
                          <span className="font-medium">Description:</span> {appointment.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;

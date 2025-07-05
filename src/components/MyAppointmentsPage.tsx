
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

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

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadAppointments = () => {
      const savedAppointments = localStorage.getItem('dentalIncidents');
      if (savedAppointments && user?.patientId) {
        try {
          const allAppointments: Appointment[] = JSON.parse(savedAppointments);
          const userAppointments = allAppointments.filter(
            (a) => a.patientId === user.patientId
          );
          setAppointments(userAppointments);
        } catch (err) {
          console.error("Failed to parse appointments from localStorage", err);
        }
      }
    };

    loadAppointments();
  }, [user]);

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.appointmentDate) >= currentDate && a.status === 'Scheduled')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  const pastAppointments = appointments
    .filter((a) => a.status === 'Completed' || (new Date(a.appointmentDate) < currentDate && a.status !== 'Scheduled'))
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const totalCost = pastAppointments.reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">View your dental appointments and treatment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-gray-600 text-sm">Total Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                <p className="text-gray-600 text-sm">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{pastAppointments.length}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">${totalCost}</p>
                <p className="text-gray-600 text-sm">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">No upcoming appointments</p>
              <p className="text-sm">Check back later or contact your dentist</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{a.title}</h3>
                      <p className="text-blue-700">{a.description}</p>
                    </div>
                    <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span>{format(new Date(a.appointmentDate), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                      <span>${a.cost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span>{a.treatment}</span>
                    </div>
                  </div>
                  {a.comments && (
                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">{a.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments / History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Treatment History ({pastAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">No treatment history available</p>
              <p className="text-sm">Your completed appointments will show here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((a) => (
                <div key={a.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{a.title}</h3>
                      <p className="text-gray-600">{a.description}</p>
                    </div>
                    <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span>{format(new Date(a.appointmentDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                      <span>${a.cost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span>{a.treatment}</span>
                    </div>
                  </div>
                  {a.comments && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {a.comments}
                      </p>
                    </div>
                  )}
                  {a.nextDate && (
                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <p className="text-sm text-green-700">
                        <strong>Next Appointment:</strong> {format(new Date(a.nextDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                  {a.files?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {a.files.map((file, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAppointmentsPage;

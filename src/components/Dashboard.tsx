import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  contact: string;
  email: string;
}

interface Incident {
  id: string;
  patientId: string;
  title: string;
  appointmentDate: string;
  cost: number;
  status: string;
  treatment?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const loadData = () => {
      const storedPatients = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
      const storedIncidents = JSON.parse(localStorage.getItem('dentalIncidents') || '[]');
      
      if (user?.role === 'Patient') {
        // Filter data for current patient
        const currentPatient = storedPatients.find((p: Patient) => p.id === user.patientId);
        setPatients(currentPatient ? [currentPatient] : []);
        setIncidents(storedIncidents.filter((i: Incident) => i.patientId === user.patientId));
      } else {
        setPatients(storedPatients);
        setIncidents(storedIncidents);
      }
    };

    loadData();
  }, [user]);

  // Calculate KPIs
  const upcomingAppointments = incidents
    .filter(i => new Date(i.appointmentDate) >= new Date(new Date().setHours(0,0,0,0)) && i.status === 'Scheduled')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 10);

  const completedTreatments = incidents.filter(i => i.status === 'Completed').length;
  const pendingTreatments = incidents.filter(i => i.status === 'Scheduled').length;
  const totalRevenue = incidents.filter(i => i.status === 'Completed').reduce((sum, i) => sum + i.cost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.role === 'Admin' ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'Admin' 
            ? 'Overview of your dental practice' 
            : 'Your dental care information'
          }
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              {user?.role === 'Admin' ? 'Total Patients' : 'My Profile'}
            </CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs opacity-90">
              {user?.role === 'Admin' ? 'Active patients' : 'Patient profile'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTreatments}</div>
            <p className="text-xs opacity-90">Treatments completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pending</CardTitle>
            <Clock className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTreatments}</div>
            <p className="text-xs opacity-90">Scheduled appointments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs opacity-90">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Appointments</span>
          </CardTitle>
          <CardDescription>
            {user?.role === 'Admin' ? 'Next 10 scheduled appointments' : 'Your upcoming appointments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const patient = patients.find(p => p.id === appointment.patientId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                          {user?.role === 'Admin' && (
                            <p className="text-sm text-gray-600">{patient?.name}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                            {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <span className="font-semibold text-green-600">${appointment.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>Recent Treatments</span>
          </CardTitle>
          <CardDescription>
            {user?.role === 'Admin' ? 'Latest completed treatments' : 'Your treatment history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.filter(i => i.status === 'Completed').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed treatments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents
                .filter(i => i.status === 'Completed')
                .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                .slice(0, 5)
                .map((incident) => {
                  const patient = patients.find(p => p.id === incident.patientId);
                  return (
                    <div key={incident.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                        {user?.role === 'Admin' && (
                          <p className="text-sm text-gray-600">{patient?.name}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {incident.treatment || 'Treatment completed'} - {new Date(incident.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        <span className="font-semibold text-green-600">${incident.cost}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

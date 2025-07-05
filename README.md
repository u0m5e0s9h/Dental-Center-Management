# Dental Center Management Dashboard

## Overview
This is a frontend-only Dental Center Management Dashboard. It manages patients, their dental appointments (incidents), and allows file uploads for treatment records. The system supports two user roles: Admin (Dentist) with full access and Patient with limited view. All data is simulated and persisted using localStorage.

---

## Setup

### Prerequisites
- Node.js (v14 or above)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/u0m5e0s9h/Dental-Center-Management.git
   cd Dental-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` (or the port shown in the terminal).

---

## Architecture

- **React with TypeScript**: Functional components and hooks for UI and state management.
- **React Router**: For client-side routing and navigation.
- **Context API**: For global state management, including authentication and user session.
- **TailwindCSS**: Utility-first CSS framework for styling and responsive design.
- **LocalStorage**: Simulates backend data persistence for users, patients, appointments, and files.
- **React Query**: Used for data fetching and caching patterns (though data is local).
- **Component Structure**:
  - `components/`: Contains UI components and pages such as Login, Dashboard, PatientsPage, AppointmentsPage, CalendarPage, MyAppointmentsPage.
  - `contexts/`: Contains AuthContext for authentication and session management.
  - `hooks/`: Custom hooks for UI behaviors and toast notifications.
  - `lib/`: Utility functions.
  - `pages/`: Additional pages like NotFound.
- **File Uploads**: Handled via base64 encoding and stored in localStorage, with preview and removal support.

---

## Technical Decisions

- **Frontend-only with localStorage**: To simulate backend without external dependencies, enabling quick prototyping and offline usage.
- **Role-based Access Control**: Implemented on the frontend using React Router and Context API to restrict views and actions.
- **TailwindCSS**: Chosen for rapid styling and responsive design without writing custom CSS.
- **File Upload as Base64**: Simplifies file handling and persistence in localStorage, avoiding backend complexity.
- **React Query**: Included for future scalability and consistent data fetching patterns, even though data is local.
- **TypeScript**: Ensures type safety and better developer experience.

---

## Known Issues

- File uploads are limited by localStorage size constraints; large files may not be supported.
- No backend validation or security; all logic is client-side and can be bypassed.
- Calendar view and appointment filtering rely on client system time; discrepancies may occur.
- UI/UX can be further enhanced with animations and accessibility improvements.
- No real-time updates; data changes require page refresh or re-navigation to reflect.

---

## Future Improvements

- Integrate with a backend API for persistent and secure data storage.
- Add user registration and password recovery flows.
- Implement real-time notifications for appointments and treatment updates.
- Enhance calendar with drag-and-drop rescheduling.
- Add detailed reports and analytics for Admin users.
- Improve file upload with progress bars and file type validations.

---

## Contact

For questions or support, please contact the development team .

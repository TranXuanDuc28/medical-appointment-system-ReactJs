# Medical Appointment System - Frontend

A modern, responsive, and feature-rich medical appointment booking platform built with React. This application provides a seamless experience for patients to find doctors and book appointments, and for clinics/doctors to manage their schedules.

## 🌟 Key Features

- **User Authentication**: Secure login/register with support for Google and Facebook OAuth.
- **Dynamic Scheduling**: Real-time appointment booking with doctor schedule management.
- **Multi-language Support**: Fully internationalized with `react-intl`.
- **Responsive Design**: Built with Bootstrap 5 and Material UI for a premium experience on all devices.
- **Advanced Search**: Easily find doctors by specialty, department, or location.
- **Medical Records**: Integration for viewing and managing patient health records.
- **Real-time Notifications**: Integrated with Socket.io for instant updates.
- **Markdown Support**: Rich text medical handbooks and descriptions.

## 🚀 Technology Stack

- **Core**: React 17
- **State Management**: Redux, Redux Thunk, Redux Persist
- **Styling**: Sass, Bootstrap 5, Material UI
- **Navigation**: React Router 5
- **Forms & Data**: Axios, React Select, Lodash
- **Animations & UI**: Slick Carousel, React Lightbox, React Toastify
- **Utils**: Moment.js, Day.js, JWT Decode
- **Integrations**: Socket.io-client, Google & Facebook OAuth

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/medical-appointment-system.git
   cd medical-appointment-system/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment variables**:
   Create a `.env` file in the root of the frontend folder and add your configuration (see `.env.example` for reference):
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8080
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Folder Structure

- `src/components`: Reusable UI components.
- `src/containers`: Main page containers and business logic.
- `src/store`: Redux actions, reducers, and store configuration.
- `src/translations`: Multi-language dictionary files.
- `src/assets`: Static images, fonts, and global styles.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Developed with ❤️ for better healthcare accessibility.*


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Signup from './authComponents/Signup';
import Login from './authComponents/Login';
import RegistrationSuccess from './authComponents/registerpage';
import ForgotPassword from './authComponents/ForgotPassword';
import PlayerList from './components/searchPlayers/PlayerList';
import Dashboard from './dashboardComponents/Dashboard';
import ClubList from './clubComponent/ClubList';
import ClubDetails from './clubComponent/ClubDetails';
import PlayerProfile from './ProfileComponent/PlayerProfile';
import CurrentUserProfile from './ProfileComponent/CurrentUserProfile';
import CreateMatch from './components/createMatch/CreateMatch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registerpage" element={<RegistrationSuccess />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/club/*" element={<ClubList />} />
        <Route path="/club/:id" element={<ClubDetails />} />
        <Route path="/club/*" element={<PlayerProfile />} />
        <Route path="/profile" element={<CurrentUserProfile />} />
        <Route path="/players" element={<PlayerList />} />
        <Route path="/players/profile/:userId" element={<PlayerProfile />} />
        <Route path="/createMatch" element={<CreateMatch />} />

      </Routes>
    </Router>
  );
}

export default App;

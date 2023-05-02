import React from "react"
import './App.css';
import MainPage from "./Pages/MainPage/MainPage";
import { Routes, Route } from "react-router-dom";
import StadiumPage from "./Pages/StadiumPage/StadiumPage";
import ClubPage from "./Pages/ClubPage/ClubPage"
import CompetitionPage from "./Pages/CompetitionPage/CompetitionPage"
import MatchPage from "./Pages/MatchPage/MatchPage"
import StatisticsPage from "./Pages/StatisticsPage/StatisticsPage"
import LoginPage from "./Pages/LoginPage/LoginPage";
import LogoutPage from "./Pages/LogoutPage/LogoutPage";
import { AuthProvider } from "./Context/Context";


export default function App(){
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<MainPage />}></Route>
        <Route path="/stadium" element={<StadiumPage />}></Route>
        <Route path="/club" element={<ClubPage />}></Route>
        <Route path="/competition" element={<CompetitionPage />}></Route>
        <Route path="/matches" element={<MatchPage />}></Route>
        <Route path="/statistics" element={<StatisticsPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/logout" element={<LogoutPage />}></Route>
      </Routes>
    </AuthProvider>
  );
}
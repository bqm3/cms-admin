import { Routes, Route, Navigate } from "react-router-dom";
import { EditorPage } from "./components/Editor/EditorPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PublicPostPage } from "./pages/PublicPostPage";
import { ClientHomePage } from "./pages/ClientHomePage";

function App() {
  return (
    <Routes>
      <Route element={<ClientHomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<EditorPage />} path="/editor/:id" />
      <Route element={<EditorPage />} path="/editor/new" />
      <Route element={<PublicPostPage />} path="/site/:id" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;

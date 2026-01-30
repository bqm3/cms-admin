import { Routes, Route, Navigate } from "react-router-dom";
import { EditorPage } from "./components/Editor/EditorPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PublicPostPage } from "./pages/PublicPostPage";
import { ClientHomePage } from "./pages/ClientHomePage";
import { CategoryManagementPage } from "./pages/CategoryManagementPage";
import { ParentCategoryManagementPage } from "./pages/ParentCategoryManagementPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { MediaManagementPage } from "./pages/MediaManagementPage";
import { NewPage } from "./pages/NewPage";
import { TemplateDashboardPage } from "./pages/TemplateDashboardPage";
import { TemplateEditorPage } from "./components/Editor/TemplateEditorPage";
import { PublicTemplatePage } from "./pages/PublicTemplatePage";

function App() {
  return (
    <Routes>
      <Route element={<ClientHomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<EditorPage />} path="/editor/new" />
      <Route element={<EditorPage />} path="/editor/:id" />
      <Route element={<NewPage />} path="/new-page-test" />
      <Route element={<PublicPostPage />} path="/site/:slug" />
      <Route element={<CategoryManagementPage />} path="/categories" />
      <Route element={<ParentCategoryManagementPage />} path="/parent-categories" />
      <Route element={<UserManagementPage />} path="/users" />
      <Route element={<MediaManagementPage />} path="/media" />
      <Route element={<TemplateDashboardPage />} path="/template-dashboard" />
      <Route element={<TemplateEditorPage />} path="/template-editor/new" />
      <Route element={<TemplateEditorPage />} path="/template-editor/:id" />
      <Route element={<PublicTemplatePage />} path="/template/:slug" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;

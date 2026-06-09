import { Routes, Route, Navigate } from "react-router-dom";
import { EditorPage } from "./components/Editor/EditorPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PublicPostPage } from "./pages/PublicPostPage";
import { ModuleEditorPage } from "./components/Editor/ModuleEditorPage";
import { ClientHomePage } from "./pages/ClientHomePage";
import { CategoryManagementPage } from "./pages/CategoryManagementPage";
import { ParentCategoryManagementPage } from "./pages/ParentCategoryManagementPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { SheetsRowsPage } from "./pages/SheetsRowsPage";
import { MediaManagementPage } from "./pages/MediaManagementPage";
import { NewPage } from "./pages/NewPage";
import { TemplateDashboardPage } from "./pages/TemplateDashboardPage";
import { TemplateEditorPage } from "./components/Editor/TemplateEditorPage";
import { PublicTemplatePage } from "./pages/PublicTemplatePage";
import { ClientCategoryPage } from "./pages/ClientCategoryPage";
import { PreviewPage } from "./pages/PreviewPage";
import { FooterManagementPage } from "./pages/FooterManagementPage";
import { PrivacyPolicy } from "./pages/Public/PrivacyPolicy";
import { AboutUs } from "./pages/Public/AboutUs";
import { Term } from "./pages/Public/Term";
import { Contact } from "./pages/Public/Contact";
import { ReviewManagementPage } from "./pages/ReviewManagementPage";
import { PublicReviewListPage } from "./pages/PublicReviewListPage";
import { PublicReviewDetailPage } from "./pages/PublicReviewDetailPage";


function App() {
  return (
    <Routes>
      <Route element={<ClientHomePage />} path="/" />
      <Route element={<PrivacyPolicy />} path="/privacy-policy" />
      <Route element={<Contact />} path="/contact" />
      <Route element={<PublicReviewListPage />} path="/review" />
      <Route element={<PublicReviewDetailPage />} path="/review/:slug" />
      <Route element={<Term />} path="/terms" />
      <Route element={<AboutUs />} path="/about-us" />
      <Route element={<ClientCategoryPage />} path="/category" />

      <Route element={<ClientCategoryPage />} path="/category/:parentSlug" />
      <Route element={<ClientCategoryPage />} path="/category/:parentSlug/:categorySlug" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<EditorPage />} path="/editor/new" />
      <Route element={<EditorPage />} path="/editor/:id" />
      <Route element={<ModuleEditorPage />} path="/module/new" />
      <Route element={<ModuleEditorPage />} path="/module/:id" />
      <Route element={<PreviewPage />} path="/preview" />
      <Route element={<NewPage />} path="/new-page-test" />
      <Route element={<PublicPostPage />} path="/:slug" />
      <Route element={<CategoryManagementPage />} path="/categories" />
      <Route element={<ParentCategoryManagementPage />} path="/parent-categories" />
      <Route element={<UserManagementPage />} path="/users" />
      <Route element={<SheetsRowsPage />} path="/sheets" />
      <Route element={<MediaManagementPage />} path="/media" />
      <Route element={<FooterManagementPage />} path="/footer-links" />
      <Route element={<ReviewManagementPage />} path="/reviews" />
      <Route element={<TemplateDashboardPage />} path="/template-dashboard" />
      <Route element={<TemplateEditorPage />} path="/template-editor/new" />
      <Route element={<TemplateEditorPage />} path="/template-editor/:id" />
      <Route element={<PublicTemplatePage />} path="/template/:slug" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;

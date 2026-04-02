import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { ResumesPage } from "./pages/ResumesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SourcesPage } from "./pages/SourcesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

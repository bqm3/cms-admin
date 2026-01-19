import { Routes, Route, Navigate } from "react-router-dom";
import { EditorPage } from "./components/Editor/EditorPage";

function App() {
  return (
    <Routes>
      <Route element={<EditorPage />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;

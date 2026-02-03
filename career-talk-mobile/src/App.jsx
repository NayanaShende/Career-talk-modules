import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SearchExperts from "./pages/expert/SearchExperts";
import RecommendedExperts from "./pages/expert/RecommendedExperts";
import ExpertSinglePage from "./pages/expert/ExpertSinglePage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<SearchExperts />} />
            <Route path="/recommended" element={<RecommendedExperts />} />
            <Route path="/expert/:id" element={<ExpertSinglePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
);
}

export default App;

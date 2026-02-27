import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/HomePage";
import Forms037 from "./pages/FormsPage/Form037_0Page/Form037_0Page.jsx";
import FormPageForm039_2_0Page from "./pages/FormsPage/Form039_2_0Page/Form039_2_0.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forma-037/:id" element={<Forms037 />} />
        <Route path="/forma-039_2_0" element={<FormPageForm039_2_0Page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

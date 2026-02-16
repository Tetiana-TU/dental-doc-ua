import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/HomePage";
import Forms037 from "./pages/FormsPage/Form037_0Page/Form037_0Page.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forma-037/:id" element={<Forms037 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Navigate, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Home from "./pages/HomePage/HomePage";
import Forms037 from "./pages/FormsPage/Form037_0Page/Form037_0Page.jsx";
import FormPageForm039_2_0Page from "./pages/FormsPage/Form039_2_0Page/Form039_2_0.jsx";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.jsx";
import { useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute.jsx";
// import Layout from "./components/Layout/Layout";
function App() {
  return (
    // <Layout>
    //   <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/register" element={<RegistrationPage />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/form037"
        element={
          <PrivateRoute>
            <Forms037 />
          </PrivateRoute>
        }
      />

      <Route
        path="/form039"
        element={
          <PrivateRoute>
            <FormPageForm039_2_0Page />
          </PrivateRoute>
        }
      />
    </Routes>
    //   </Suspense>
    // </Layout>
  );
}

export default App;

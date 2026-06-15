import { Navigate, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Home from "./pages/HomePage/HomePage";
import Forms037 from "./pages/FormsPage/Form037_0Page/Form037_0Page.jsx";
import FormPageForm039_2_0Page from "./pages/FormsPage/Form039_2_0Page/Form039_2_0.jsx";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.jsx";
import { useEffect } from "react";
// import Layout from "./components/Layout/Layout";
function App() {
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   const token = lsGetToken();
  //   if (token) {
  //     setAuthorizationToken(token);
  //     dispatch(fetchUser());
  //   }
  // }, [dispatch]);

  return (
    // <Layout>
    //   <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/register" element={<RegistrationPage />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/forma-037/:id" element={<Forms037 />} />
      <Route path="/forma-039_2_0" element={<FormPageForm039_2_0Page />} />
    </Routes>
    //   </Suspense>
    // </Layout>
  );
}

export default App;

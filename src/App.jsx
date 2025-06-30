import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./util/axios.customize"
import { useContext, useEffect } from "react"
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

function App() {

  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      const res = await axios.get(`/v1/auth/profile`);
      if (res && res.statusCode === 200) {
        setAuth({
          isAuthenticated: true,
          account: {
            account_id: res?.data?.account_id ?? "",
            email: res?.data?.email ?? "",
            role: res?.data?.role ?? "",
            phone: res?.data?.phone ?? "",
            name: res?.data?.name ?? "",
          },
        })
      }
      setAppLoading(false);
    }

    fetchAccount()
  }, [])



  return (
    <div>
      {appLoading === true ?
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>

          <Spin />

        </div>
        :
        <>
          <Header />
          <Outlet />
        </>
      }

    </div>
  )
}

export default App

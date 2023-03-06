import React, { useContext } from "react";
import { AuthContext } from "../utils/AuthProvider";
import { NavigationContainer } from "@react-navigation/native";
import Auth from "./AuthStack";
// import Main from "./MainStack";
import Loading from "../screens/utils/Loading";

export default () => {
  const auth = useContext(AuthContext);
  const user = auth.user;
  console.log(user);

  return (
    <NavigationContainer>
      {user == null && <Loading />}
      {user == false && <Auth />}
      {/* {user == true && <Main />} */}
    </NavigationContainer>
  );
};

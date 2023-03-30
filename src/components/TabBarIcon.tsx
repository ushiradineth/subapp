import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default ({ icon, focused }: { icon: any; focused: boolean }) => {
  return <Ionicons name={icon} style={{ marginBottom: -7 }} size={24} />;
};

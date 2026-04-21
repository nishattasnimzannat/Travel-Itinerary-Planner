import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div
        style={{
          marginLeft: sidebarOpen ? "260px" : "0px",
          transition: "margin-left 0.3s ease",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
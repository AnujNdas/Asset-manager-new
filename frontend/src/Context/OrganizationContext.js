import { createContext, useContext, useEffect, useState } from "react";

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (auth?.organization) {
      setOrganization(auth.organization);
    }
  }, []);

  const updateOrganization = (organizationData) => {
    setOrganization(organizationData);

    const auth = JSON.parse(localStorage.getItem("auth")) || {};

    localStorage.setItem(
      "auth",
      JSON.stringify({
        ...auth,
        organization: organizationData,
      })
    );
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        setOrganization: updateOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used inside OrganizationProvider"
    );
  }

  return context;
};
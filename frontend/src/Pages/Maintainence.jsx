const Maintenance = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#0f172a",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        We'll be back soon
      </h1>
      <p style={{ maxWidth: "500px", opacity: 0.8 }}>
        We’re currently performing scheduled maintenance.
        Please check back shortly.
      </p>
    </div>
  );
};

export default Maintenance;
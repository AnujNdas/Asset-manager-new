import { useLocation, useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const errorMessage =
    query.get("message") ||
    location.state?.message ||
    "You do not have permission to access this resource.";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", color: "#dc2626" }}>
          403 - Unauthorized
        </h1>

        <p style={{ marginTop: "20px", color: "#475569" }}>
          {errorMessage}
        </p>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "25px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
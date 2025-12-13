const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
  },

  outerRing: {
    position: "absolute",
    height: "96px",
    width: "96px",
    borderRadius: "50%",
    border: "3px solid rgba(124,58,237,0.25)",
    borderTopColor: "#7B5DFF",
  },

  innerCircle: {
    height: "80px",
    width: "80px",
    borderRadius: "50%",
    background: "#0f172a",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  liquid: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    background: "linear-gradient(180deg, #7B5DFF, #6D28D9)",
    borderRadius: "0 0 50% 50%",
  },

  percent: {
    position: "relative",
    zIndex: 2,
    color: "#fff",
    fontWeight: 600,
    fontSize: "18px",
  },

  text: {
    color: "#6B7280",
    fontSize: "15px",
    fontWeight: 500,
  },
};

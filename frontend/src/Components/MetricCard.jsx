const MetricCard = ({ label, value, className = "" }) => {
  return (
    <div className={`card ${className}`}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
};

export default MetricCard;

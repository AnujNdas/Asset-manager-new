const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No revenue data available</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.total));

  return (
    <div className="revenue-chart">
      {data.map((item) => (
        <div key={item.month} className="revenue-row">
          <span className="label">{item.month}</span>

          <div className="bar-wrapper">
            <div
              className="bar"
              style={{
                width: `${(item.total / maxValue) * 100}%`,
              }}
            />
          </div>

          <span className="value">₹{item.total}</span>
        </div>
      ))}
    </div>
  );
};

export default RevenueChart;

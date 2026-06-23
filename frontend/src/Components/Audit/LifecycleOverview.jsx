import React from "react";

const LifecycleAudit = ({ lifecycle }) => {
  return (
    <div className="audit-section">

      <div className="section-header">
        <h3>Lifecycle Audit</h3>
      </div>

      <div className="timeline">

        {lifecycle?.map((event, index) => (
          <div key={index} className="timeline-item">

            <div className="timeline-dot"></div>

            <div className="timeline-content">
              <h4>{event.title}</h4>

              <p>{event.description}</p>

              <span>
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default LifecycleAudit;
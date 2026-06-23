import React from "react";

const FinancialAudit = ({ financial }) => {
  return (
    <div className="audit-section">

      <div className="section-header">
        <h3>Financial Audit</h3>
      </div>

      <div className="financial-grid">

        <div className="audit-card">
          <h4>Purchase Cost</h4>
          <h2>${financial?.purchaseCost || 0}</h2>
        </div>

        <div className="audit-card">
          <h4>Maintenance Cost</h4>
          <h2>${financial?.maintenanceCost || 0}</h2>
        </div>

        <div className="audit-card">
          <h4>Renewal Cost</h4>
          <h2>${financial?.renewalCost || 0}</h2>
        </div>

        <div className="audit-card">
          <h4>Upgrade Cost</h4>
          <h2>${financial?.upgradeCost || 0}</h2>
        </div>

      </div>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Purchase</td>
              <td>${financial?.purchaseCost || 0}</td>
            </tr>

            <tr>
              <td>Maintenance</td>
              <td>${financial?.maintenanceCost || 0}</td>
            </tr>

            <tr>
              <td>Renewal</td>
              <td>${financial?.renewalCost || 0}</td>
            </tr>

            <tr>
              <td>Upgrade</td>
              <td>${financial?.upgradeCost || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default FinancialAudit;
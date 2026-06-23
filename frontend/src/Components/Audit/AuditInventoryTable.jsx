import React, { useMemo, useState } from "react";


const AssetInventoryTable = ({ assets = [] }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.assetName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        asset.assetCode
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        asset.instanceCode
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        !typeFilter || asset.assetType === typeFilter;

      const matchesStatus =
        !statusFilter || asset.status === statusFilter;

      const matchesCondition =
        !conditionFilter ||
        asset.condition === conditionFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesCondition
      );
    });
  }, [
    assets,
    search,
    typeFilter,
    statusFilter,
    conditionFilter,
  ]);

  return (
    <div className="audit-section">

      <div className="section-header">
        <h3>Asset Inventory Audit</h3>
      </div>

      {/* Filters */}

      <div className="audit-filters">

        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="">All Types</option>
          <option value="hardware">
            Hardware
          </option>
          <option value="software">
            Software
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="in_stock">
            In Stock
          </option>
          <option value="assigned">
            Assigned
          </option>
          <option value="retired">
            Retired
          </option>
        </select>

        <select
          value={conditionFilter}
          onChange={(e) =>
            setConditionFilter(e.target.value)
          }
        >
          <option value="">
            All Conditions
          </option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="damaged">
            Damaged
          </option>
          <option value="broken">
            Broken
          </option>
          <option value="stolen">
            Stolen
          </option>
          <option value="repaired(in)">
            Repaired(IN)
          </option>
          <option value="repaired(out)">
            Repaired(OUT)
          </option>
        </select>

      </div>

      {/* Desktop Table */}

      <div className="audit-table-wrapper">

        <table className="audit-table">

          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>

            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset._id}>
                  <td>
                    {asset.assetCode ||
                      asset.instanceCode}
                  </td>

                  <td>
                    {asset.assetName ||
                      asset.deviceName ||
                      "-"}
                  </td>

                  <td>
                    {asset.assetType}
                  </td>

                  <td>
                    {asset.status}
                  </td>

                  <td>
                    {asset.condition}
                  </td>

                  <td>
                    {asset.location || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="empty-state"
                >
                  No assets found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* Mobile Cards */}

      <div className="audit-mobile-cards">

        {filteredAssets.map((asset) => (
          <div
            className="audit-mobile-card"
            key={asset._id}
          >
            <h4>
              {asset.assetName ||
                asset.deviceName}
            </h4>

            <p>
              <strong>Code:</strong>{" "}
              {asset.assetCode ||
                asset.instanceCode}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {asset.assetType}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {asset.status}
            </p>

            <p>
              <strong>Condition:</strong>{" "}
              {asset.condition}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {asset.location || "-"}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
};

export default AssetInventoryTable;
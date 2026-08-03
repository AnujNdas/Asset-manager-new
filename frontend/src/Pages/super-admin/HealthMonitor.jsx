import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getRouteHealth } from "../../Services/AdminServices";
import "../../Page_styles/ApiHealth.css";

export default function ApiHealth() {

    const [routes, setRoutes] = useState([]);

    const [selectedRoute, setSelectedRoute] = useState(null);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("All");

    useEffect(() => {

        fetchRoutes();

        const interval = setInterval(fetchRoutes, 15000);

        return () => clearInterval(interval);

    }, []);

    const fetchRoutes = async () => {

        try {

            const res = await getRouteHealth();

            setRoutes(res.routes || []);

        }

        catch {

            Swal.fire(
                "Error",
                "Unable to fetch route health.",
                "error"
            );

        }

    };

    const filteredRoutes = useMemo(() => {

        return routes.filter(route => {

            const matchSearch =
                route.route
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchFilter =
                filter === "All" ||
                route.health === filter;

            return matchSearch && matchFilter;

        });

    }, [routes, search, filter]);
    const healthy =
routes.filter(r=>r.health==="Healthy").length;

const moderate =
routes.filter(r=>r.health==="Moderate").length;

const slow =
routes.filter(r=>r.health==="Slow").length;

const critical =
routes.filter(r=>r.health==="Critical").length;

const avgResponse =
(
routes.reduce(
(sum,r)=>sum+r.averageTime,
0
)
/(routes.length||1)
).toFixed(1);

const totalRequests =
routes.reduce(
(sum,r)=>sum+r.requests,
0
);
return (

    <div className="api-health">

        <div className="api-header">

            <h2>API Health Dashboard</h2>

        </div>

        {/* Summary */}
        <div className="summary-grid">

            <div className="summary-card healthy">
                <h3>Healthy</h3>
                <p>{healthy}</p>
            </div>

            <div className="summary-card moderate">
                <h3>Moderate</h3>
                <p>{moderate}</p>
            </div>

            <div className="summary-card slow">
                <h3>Slow</h3>
                <p>{slow}</p>
            </div>

            <div className="summary-card critical">
                <h3>Critical</h3>
                <p>{critical}</p>
            </div>

            <div className="summary-card">
                <h3>Avg Response</h3>
                <p>{avgResponse} ms</p>
            </div>

            <div className="summary-card">
                <h3>Total Requests</h3>
                <p>{totalRequests}</p>
            </div>

        </div>

        {/* Filters */}

        <div className="filters">

            <input
                placeholder="Search Route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
                <option>All</option>
                <option>Healthy</option>
                <option>Moderate</option>
                <option>Slow</option>
                <option>Critical</option>
            </select>

        </div>

        {/* Route Cards */}

        <div className="route-grid">

            {

                filteredRoutes.map((route, index) => (

                    <div
                        key={index}
                        className={`route-card ${route.health.toLowerCase()}`}
                    >

                        <div className="route-top">

                            <div>

                                <span className={`method ${route.method.toLowerCase()}`}>
                                    {route.method}
                                </span>

                                <h3>{route.route}</h3>

                                <small>{route.category}</small>

                            </div>

                            <span className={`health-badge ${route.health.toLowerCase()}`}>
                                {route.health}
                            </span>

                        </div>

                        <div className="route-stats">

                            <div>
                                <span>Requests</span>
                                <strong>{route.requests}</strong>
                            </div>

                            <div>
                                <span>Success</span>
                                <strong>{route.successRate}%</strong>
                            </div>

                            <div>
                                <span>Average</span>
                                <strong>{route.averageTime} ms</strong>
                            </div>

                            <div>
                                <span>Last</span>
                                <strong>{route.lastResponse} ms</strong>
                            </div>

                        </div>

                        <div className="route-extra">

                            <div>
                                <b>Fastest</b>

                                <p>{route.fastestResponse} ms</p>
                            </div>

                            <div>
                                <b>Slowest</b>

                                <p>{route.slowestResponse} ms</p>
                            </div>

                            <div>
                                <b>Status</b>

                                <p>{route.lastStatus}</p>
                            </div>

                            <div>
                                <b>Errors</b>

                                <p>{route.errors}</p>
                            </div>

                        </div>

<button
    className="view-btn"
    onClick={() => setSelectedRoute(route)}
>
    View Details
</button>

                    </div>

                ))

            }

        </div>
            {
selectedRoute && (

<div
    className="route-modal-overlay"
    onClick={() => setSelectedRoute(null)}
>

<div
    className="route-modal"
    onClick={(e) => e.stopPropagation()}
>

<div className="modal-header">

<h2>{selectedRoute.route}</h2>

<button
    className="close-btn"
    onClick={() => setSelectedRoute(null)}
>
    ✕
</button>

</div>

<div className="modal-grid">

<div>
<strong>Method</strong>
<p>{selectedRoute.method}</p>
</div>

<div>
<strong>Category</strong>
<p>{selectedRoute.category}</p>
</div>

<div>
<strong>Health</strong>
<p>{selectedRoute.health}</p>
</div>

<div>
<strong>Status</strong>
<p>{selectedRoute.lastStatus}</p>
</div>

<div>
<strong>Total Requests</strong>
<p>{selectedRoute.requests}</p>
</div>

<div>
<strong>Success Rate</strong>
<p>{selectedRoute.successRate}%</p>
</div>

<div>
<strong>Average Response</strong>
<p>{selectedRoute.averageTime} ms</p>
</div>

<div>
<strong>Fastest</strong>
<p>{selectedRoute.fastestResponse} ms</p>
</div>

<div>
<strong>Slowest</strong>
<p>{selectedRoute.slowestResponse} ms</p>
</div>

<div>
<strong>Last Response</strong>
<p>{selectedRoute.lastResponse} ms</p>
</div>

<div>
<strong>Errors</strong>
<p>{selectedRoute.errors}</p>
</div>

<div>
<strong>Last Checked</strong>
<p>
{new Date(selectedRoute.lastChecked).toLocaleString()}
</p>
</div>

</div>

<h3 className="history-title">
Response History
</h3>

<div className="history-table">

<table>

<thead>

<tr>

<th>Time</th>

<th>Response</th>

<th>Status</th>

</tr>

</thead>

<tbody>

{
selectedRoute.responseHistory.map((item, i) => (

<tr key={i}>

<td>
{new Date(item.time).toLocaleString()}
</td>

<td>
{item.response} ms
</td>

<td>

<span
className={`status-badge ${
item.status >= 500
? "critical"
: item.status >= 400
? "warning"
: "healthy"
}`}
>

{item.status}

</span>

</td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

</div>

)
}
    </div>
    

);

}
const { routeMetrics } = require("../../Middleware/routeMonitor");

const getRouteHealth = (req, res) => {

    const routes = Array.from(routeMetrics.values());

    res.json({
        success: true,
        totalRoutes: routes.length,
        routes,
    });

};

module.exports = {
    getRouteHealth,
};
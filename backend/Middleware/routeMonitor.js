const routeMetrics = new Map();

const routeMonitor = (req, res, next) => {

    const start = process.hrtime.bigint();

    res.on("finish", () => {

        const end = process.hrtime.bigint();

        const duration =
            Number(end - start) / 1000000; // ms

        const key = `${req.method} ${req.baseUrl}${req.route?.path || req.path}`;

        const metric = routeMetrics.get(key) || {
            method: req.method,
            route: `${req.baseUrl}${req.route?.path || req.path}`,
            requests: 0,
            errors: 0,
            totalTime: 0,
            averageTime: 0,
            lastResponse: 0,
            lastStatus: 200,
            lastChecked: null,
        };

        metric.requests++;

        metric.totalTime += duration;

        metric.averageTime =
            metric.totalTime / metric.requests;

        metric.lastResponse = duration;

        metric.lastStatus = res.statusCode;

        metric.lastChecked = new Date();

        if (res.statusCode >= 400) {
            metric.errors++;
        }

        routeMetrics.set(key, metric);

    });

    next();

};

module.exports = {
    routeMonitor,
    routeMetrics,
};
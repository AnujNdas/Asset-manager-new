const routeMetrics = new Map();

const routeMonitor = (req, res, next) => {

    const start = process.hrtime.bigint();

    res.on("finish", () => {

        const end = process.hrtime.bigint();

        const duration = Number(end - start) / 1_000_000;

        const route =
            `${req.baseUrl}${req.route?.path || req.path}`;

        const key = `${req.method} ${route}`;

        const metric = routeMetrics.get(key) || {

            method: req.method,

            route,

            category: route.split("/")[2] || "general",

            requests: 0,

            errors: 0,

            totalTime: 0,

            averageTime: 0,

            fastestResponse: Number.MAX_VALUE,

            slowestResponse: 0,

            lastResponse: 0,

            lastStatus: 200,

            lastChecked: null,

            successRate: 100,

            health: "Healthy",

            responseHistory: []

        };

        metric.requests++;

        metric.totalTime += duration;

        metric.averageTime = Number(
            (metric.totalTime / metric.requests).toFixed(2)
        );

        metric.lastResponse = Number(
            duration.toFixed(2)
        );

        metric.fastestResponse = Number(
            Math.min(metric.fastestResponse, duration).toFixed(2)
        );

        metric.slowestResponse = Number(
            Math.max(metric.slowestResponse, duration).toFixed(2)
        );

        metric.lastStatus = res.statusCode;

        metric.lastChecked = new Date();

        if (res.statusCode >= 400) {
            metric.errors++;
        }

        metric.successRate = Number(
            (
                ((metric.requests - metric.errors) /
                    metric.requests) *
                100
            ).toFixed(2)
        );

        if (res.statusCode >= 500) {

            metric.health = "Critical";

        } else if (metric.averageTime > 1500) {

            metric.health = "Critical";

        } else if (metric.averageTime > 800) {

            metric.health = "Slow";

        } else if (metric.averageTime > 300) {

            metric.health = "Moderate";

        } else {

            metric.health = "Healthy";

        }

        metric.responseHistory.push({
            time: metric.lastChecked,
            response: metric.lastResponse,
            status: res.statusCode,
        });

        if (metric.responseHistory.length > 50) {
            metric.responseHistory.shift();
        }

        routeMetrics.set(key, metric);

    });

    next();

};

module.exports = {
    routeMonitor,
    routeMetrics,
};
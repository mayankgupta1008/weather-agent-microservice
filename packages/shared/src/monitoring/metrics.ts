import client from "prom-client";

export const initMetrics = (serviceName: string) => {
  // 1. Add default labels (so you know which service is which)
  client.register.setDefaultLabels({
    service: serviceName,
  });

  // 2. Collect standard Node.js metrics (GC, memory, CPU)
  client.collectDefaultMetrics();
};

export const metricsEndpoint = async () => {
  return client.register.metrics();
};

export const contentType = client.register.contentType;

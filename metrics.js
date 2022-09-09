const { register, Gauge } = require("prom-client");
const { prometheusPlugin } = require("@thecodenebula/apollo-prometheus-plugin");

const plugin = prometheusPlugin(register, { enableNodeMetrics: true });

const wsClients = new Gauge({
  name: "up_ws_clients",
  help: "The number of connected websocket clients",
  labelNames: ["transport"],
});

module.exports = {
  register,
  plugin,
  wsClients,
};

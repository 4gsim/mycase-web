const servicebus = require("servicebus");
const logger = require("./logger")("bus");

let bus;

async function init() {
  bus =
    bus ||
    (await new Promise((resolve, reject) => {
      logger.debug("connecting to servicebus");
      const localBus = servicebus.bus({
        url: "amqp://queue:5672",
        enableConfirms: true
      });

      localBus.use(localBus.messageDomain());
      localBus.use(localBus.correlate());

      localBus.on("ready", function () {
        logger.debug("connected to servicebus");
        resolve(localBus);
      });
      localBus.on("error", function (err) {
        logger.error(err);
        reject(err);
      });
    }));
  return bus;
}

module.exports = {
  init,
};

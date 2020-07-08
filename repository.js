const { $$asyncIterator } = require("iterall");
const r = require("rethinkdb");
const logger = require("./logger")("repository");

const repository = Repository();

function Repository() {
  let connection;

  return {
    list,
    get,
    asyncIterator,
  };

  async function init() {
    connection =
      connection ||
      (await new Promise((resolve, reject) => {
        r.connect(
          {
            host: "rethinkdb",
            port: 28015,
            db: "cases",
          },
          (err, conn) => {
            if (err) return reject(err);
            resolve(conn);
          }
        );
      }));
  }

  async function list(table, filter) {
    await init();

    let q = r.table(table);
    if (filter) {
      q = q.filter(filter);
    }

    return new Promise((resolve, reject) => {
      q.run(connection, function (err, cursor) {
        if (err) return reject(err);
        cursor.toArray(function (err, result) {
          if (err) return reject(err);
          resolve(result);
        });
      });
    });
  }

  async function get(table, id) {
    await init();

    return new Promise((resolve, reject) => {
      r.table(table)
        .get(id)
        .run(connection, function (err, result) {
          if (err) return reject(err);
          resolve(result);
        });
    });
  }

  async function asyncIterator(table, subscription, filter) {
    const pullQueue = [];
    const pushQueue = [];
    let listening = true;
    let cursor;

    return {
      async next() {
        if (!cursor) cursor = await subscribe(filter);
        return listening ? pullValue() : this.return();
      },
      return() {
        emptyQueue();

        return Promise.resolve({ value: undefined, done: true });
      },
      throw(error) {
        emptyQueue();

        return Promise.reject(error);
      },
      [$$asyncIterator]() {
        return this;
      },
    };

    function pushValue(err, data) {
      if (err) return logger.warn(err);
      if (pullQueue.length !== 0) {
        pullQueue.shift()({
          value: {
            [subscription]: data.new_val,
          },
          done: false,
        });
      } else {
        pushQueue.push({
          [subscription]: data.new_val,
        });
      }
    }

    function pullValue() {
      return new Promise((resolve) => {
        if (pushQueue.length !== 0) {
          resolve({ value: pushQueue.shift(), done: false });
        } else {
          pullQueue.push(resolve);
        }
      });
    }

    function emptyQueue() {
      if (listening) {
        listening = false;
        unsubscribe();
        pullQueue.forEach((resolve) =>
          resolve({ value: undefined, done: true })
        );
        pullQueue.length = 0;
        pushQueue.length = 0;
      }
    }

    async function subscribe(filter) {
      await init();

      return new Promise((resolve, reject) => {
        r.table(table)
          .filter(filter)
          .changes({
            includeInitial: true,
          })
          .run(connection, function (err, cursor) {
            if (err) return reject(err);
            cursor.each(pushValue);
            resolve(cursor);
          });
      });
    }

    function unsubscribe() {
      if (cursor) cursor.close();
      cursor = null;
    }
  }
}

module.exports = repository;

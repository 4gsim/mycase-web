const { v4 } = require("uuid");
const bus = require("../bus");
const { GraphQLJSONObject } = require("graphql-type-json");

async function bpmnExecutions(_, __, { repository }) {
  return repository.list("processes");
}

async function bpmnEvents(_, __, { repository }) {
  return repository.list("events");
}

async function bpmnTasks(_, { engineExecutionId }, { repository }) {
  return repository.list("tasks", { engineExecutionId });
}

async function bpmnTask(_, { taskId }, { repository }) {
  return repository.get("tasks", taskId);
}

async function executeBpmn(_, { definitionSrc }) {
  const id = v4();
  const localBus = await bus.init();
  localBus.send(
    "bpmn-engine.execute",
    {
      definitionSrc,
      executionId: id,
    },
    {
      ack: true,
    }
  );
  return {
    id,
  };
}

async function signalBpmn(
  _,
  { engineExecutionId, activityExecutionId, signal }
) {
  (await bus.init()).send(
    "bpmn-engine.signal",
    {
      executionId: engineExecutionId,
      activityId: activityExecutionId,
      signal,
    },
    {
      ack: true,
    }
  );
  return true;
}

module.exports = {
  JSONObject: GraphQLJSONObject,
  Query: {
    bpmnExecutions,
    bpmnEvents,
    bpmnTasks,
    bpmnTask
  },
  Mutation: {
    executeBpmn,
    signalBpmn,
  },
  Subscription: {
    bpmnEvent: {
      subscribe: (_, args, { repository }) => {
        return repository.asyncIterator("events", "bpmnEvent", args);
      },
    },
    bpmnTask: {
      subscribe: (_, args, { repository }) => {
        return repository.asyncIterator("tasks", "bpmnTask", args);
      },
    },
  },
};

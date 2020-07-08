const Types = `
    scalar JSONObject

    type BpmnExecution {
        id: ID!
    }

    type BpmnEvent {
        id: ID!
        engineExecutionId: String!
        type: String!
        state: String!
        isStart: Boolean
        form: JSONObject
    }

    type BpmnTask {
        id: ID!
        engineExecutionId: String!
        name: String!
        type: String!
        state: String!
        form: JSONObject
    }

    type BpmnError {
        message: String!
    }
`;

const Query = `
    type Query {
        bpmnExecutions: [BpmnExecution]!
        bpmnEvents: [BpmnEvent]!
        bpmnTasks(engineExecutionId: String!): [BpmnTask]!
        bpmnTask(taskId: ID!): BpmnTask
    }
`;

const Mutation = `
    type Mutation {
        executeBpmn(definitionSrc: String!): BpmnExecution!
        signalBpmn(engineExecutionId: ID!, activityExecutionId: ID!, signal: JSONObject!): Boolean
    }
`;

const Subscription = `
    type Subscription {
        bpmnEvent(engineExecutionId: ID!, isStart: Boolean): BpmnEvent
        bpmnTask(engineExecutionId: ID!): BpmnTask
    }
`;

module.exports = `
${Types}

${Query}

${Mutation}

${Subscription}
`;

const { gql } = require("apollo-server");
const bpmn = require("./bpmn");

module.exports = gql`
  ${bpmn}
`;

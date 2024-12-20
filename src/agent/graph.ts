import { START, END, StateGraph } from "@langchain/langgraph"
import { GraphState } from "./state"
import { toolNode } from "./tools"
import { agent, shouldContinue } from "./actions"


const graphBuilder = new StateGraph(GraphState)
    // nodes
    .addNode("agent", agent)
    .addNode("tools", toolNode)
    // edges
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", END)

export const graph = graphBuilder.compile()
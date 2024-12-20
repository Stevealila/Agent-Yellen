import { START, END, StateGraph } from "@langchain/langgraph"
import { GraphState } from "./state"
import { toolNode } from "./tools"
import { agent, generate, shouldContinue } from "./actions"


const graphBuilder = new StateGraph(GraphState)
    .addNode("agent", agent)
    .addNode("tools", toolNode)
    .addNode("generate", generate)

graphBuilder.addEdge(START, "agent")
graphBuilder.addConditionalEdges(
    "agent",
    shouldContinue,
    {
        tools: "tools",
        __end__: END
    }
)
graphBuilder.addEdge("tools", "generate")
graphBuilder.addEdge("generate", END)

export const graph = graphBuilder.compile()

import { ChatGroq } from "@langchain/groq"
import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { fileContentChecker } from "./tools"

export const createGraph = async () => {

    // bind tools to the LLM

    const tools = [fileContentChecker]
    const toolNode = new ToolNode(tools)
    const model = new ChatGroq({ model: 'gemma2-9b-it', temperature: 0 }).bindTools(tools)

    
    // define graph state structure

    const GraphState = Annotation.Root({
        ...MessagesAnnotation.spec
    })


    // create node fns

    const shouldContinue = (state: typeof GraphState.State) => {
        const { messages } = state
        const lastMessage = messages[messages.length - 1]
        if (lastMessage.additional_kwargs) return "tools"
        return END
    }

    const agent = async (state: typeof GraphState.State) => {
        const llmResponse = await model.invoke(state.messages)
        return { messages: [llmResponse] }
    }


    // create and compile the graph

    const graph = new StateGraph(GraphState)
        // nodes
        .addNode("agent", agent)
        .addNode("tools", toolNode)
        // edges
        .addEdge(START, "agent")
        .addEdge("agent", "tools")
        .addConditionalEdges("agent", shouldContinue)
        // compile the graph
        .compile()

    return graph
}

/* NEXT: 

https://js.langchain.com/docs/tutorials/qa_chat_history/
https://langchain-ai.github.io/langgraphjs/tutorials/multi_agent/agent_supervisor/

*/
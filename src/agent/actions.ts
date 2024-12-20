import { pull } from "langchain/hub"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatGroq } from "@langchain/groq"
import { GraphState } from "./state"
import { tools } from "./tools"



export const shouldContinue = async (state: typeof GraphState.State) => {
    console.log("---CHECKING WORKFLOW CONTINUATION---")
    const { messages } = state
    const lastMessage = messages[messages.length - 1]

    if (lastMessage.additional_kwargs) {
        console.log("---CONTINUING TO TOOLS---")
        return "tools"
    }
    console.log("---ENDING WORKFLOW---")
    return "__end__"
}



export const agent = async (state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> => {
    console.log("---CONTACTING AGENT---")

    const { messages } = state
    const model = new ChatGroq({
        model: "gemma2-9b-it",
        temperature: 0,
        streaming: true,
    }).bindTools(tools)

    const response = await model.invoke(messages)
    return {
        messages: [response],
    }
}



export const generate = async (state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> => {
    console.log("---GENERATING RESPONSE---")

    const { messages } = state
    const question = messages[0].content as string

    const lastToolMessage = messages.slice().reverse().find((msg) => msg.getType() === "tool")
    if (!lastToolMessage) {
        throw new Error("No tool message found in the conversation history")
    }

    const docs = lastToolMessage.content as string
    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt")

    const llm = new ChatGroq({
        model: "gemma2-9b-it",
        temperature: 0,
        streaming: true,
    })

    const ragChain = prompt.pipe(llm)
    const response = await ragChain.invoke({
        context: docs,
        question,
    })

    return {
        messages: [response],
    }
}
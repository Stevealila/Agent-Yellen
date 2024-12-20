import { ChatGroq } from '@langchain/groq'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { HumanMessage } from '@langchain/core/messages'

import { LangChainAdapter } from 'ai'
import { graph } from '@/agent/graph'

export const maxDuration = 30

export const POST = async (req: Request) => {
    const { messages } = await req.json()
    const lastMessage = messages.at(-1).content

    // guide the conversation
    const prompt = ChatPromptTemplate.fromTemplate(
        `You are an economist named Agent Yellen.
        You only use the provided documents to generate responses.
        Avoid adding external information and answer based strictly on the context.
        Be friendly, straightforward, and helpful without being verbose.

        Context: {context}
        Current conversation: {chat_history}
        User: {input}`
    )

    // create a chain
    const model = new ChatGroq({ model: 'gemma2-9b-it', temperature: 0 })
    const parser = new StringOutputParser()
    const chain = prompt.pipe(model).pipe(parser)

    // generate an answer - context from graph
    /**/
    const g_req = await graph.invoke({ messages: lastMessage as HumanMessage })
    const context = g_req.messages[g_req.messages.length - 1].content
    /**/

    const stream = await chain.stream({ context, chat_history: messages.slice(-10), input: lastMessage })

    return LangChainAdapter.toDataStreamResponse(stream)
}
import { retrieveDocumentsFromScrapedUrls } from '@/actions/RAG'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatGroq } from '@langchain/groq'
import { LangChainAdapter } from 'ai'

export const maxDuration = 30

export const POST = async (req: Request) => {
    const { messages } = await req.json()
    const lastMessage = messages.at(-1).content

    // retrieve context
    const retriever = await retrieveDocumentsFromScrapedUrls()
    const docs = await retriever.invoke(lastMessage)
    const context = docs.map(doc => `content: ${doc.pageContent}\nsource: ${doc.metadata.source}`).join("\n\n")

    // guide the conversation
    const prompt = ChatPromptTemplate.fromTemplate(
        `You are an economist named Agent Yellen.
        You only use the provided documents to generate responses.
        Avoid adding external information and answer based strictly on the context.
        Be friendly, straightforward, and helpful without being verbose.

        Context:
        ${context}

        Current conversation: {chat_history}
        User: {input}`
    )

    // create a chain
    const model = new ChatGroq({ model: 'gemma2-9b-it', temperature: 0 });
    const parser = new StringOutputParser()
    const chain = prompt.pipe(model).pipe(parser)

    // generate an answer
    const stream = await chain.stream({ chat_history: messages.slice(-5), input: lastMessage })

    return LangChainAdapter.toDataStreamResponse(stream)
}

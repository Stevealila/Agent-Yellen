import { ChatGroq } from '@langchain/groq'
import { LangChainAdapter } from 'ai'

export const maxDuration = 30;

export const POST = async (req: Request) => {
    const { messages } = await req.json()

    const model = new ChatGroq({
        model: 'gemma2-9b-it',
        temperature: 0,
    });

    const stream = await model.stream(messages)

    return LangChainAdapter.toDataStreamResponse(stream)
}

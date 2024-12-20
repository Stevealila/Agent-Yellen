import { Annotation, MessagesAnnotation } from "@langchain/langgraph"

export const GraphState = Annotation.Root({
    ...MessagesAnnotation.spec
})
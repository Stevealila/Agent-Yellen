'use client';

import { useChat } from 'ai/react'

const Chat = () => {
    const { messages, input, handleInputChange, handleSubmit } = useChat()
    
    return (
        <div className='w-5/6 h-5/6 mx-auto my-8 flex flex-col justify-center gap-3'>
            <div>
                {messages.map(message => (
                    <div key={message.id} className='mb-4'>
                        {message.role === 'user' ? 'You: ' : 'AY: '}
                        {message.content}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <input name="prompt" 
                    value={input} onChange={handleInputChange} 
                    placeholder='Say something...'
                    className='py-2 border-b border-gray-400 outline-none w-1/2 bg-gray-200'
                />
            </form>
        </div>
    );
}

export default Chat
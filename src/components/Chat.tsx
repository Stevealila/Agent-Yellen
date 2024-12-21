'use client'
import { useChat } from 'ai/react'
import { useState, FormEvent } from 'react'

type Currency = 'USDCAD' | 'USDJPY' | 'GBPJPY' | 'EURUSD' | 'EURJPY' |
    'GBPUSD' | 'USDCHF' | 'AUDUSD' | 'NZDUSD' | 'EURGBP' |
    'AUDCAD' | 'CADJPY' | 'EURAUD' | 'NZDJPY'

const Chat = () => {
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | ''>('')
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        body: {
            currency: selectedCurrency,
        },
    })

    const handleCurrencySubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        setSelectedCurrency(formData.get('currency') as Currency)
    }

    if (!selectedCurrency) {
        return (
            <div className='w-5/6 h-5/6 mx-auto my-8'>
                <form onSubmit={handleCurrencySubmit}>
                    <select
                        className="select select-bordered w-full max-w-xs"
                        name='currency'
                        defaultValue=""
                        required
                    >
                        <option disabled defaultValue="USDCAD">Choose currency</option>
                        <option value="USDCAD">USDCAD</option>
                        <option value="USDJPY">USDJPY</option>
                        <option value="GBPJPY">GBPJPY</option>
                        <option value="EURUSD">EURUSD</option>
                        <option value="EURJPY">EURJPY</option>
                        <option value="GBPUSD">GBPUSD</option>
                        <option value="USDCHF">USDCHF</option>
                        <option value="AUDUSD">AUDUSD</option>
                        <option value="NZDUSD">NZDUSD</option>
                        <option value="EURGBP">EURGBP</option>
                        <option value="AUDCAD">AUDCAD</option>
                        <option value="CADJPY">CADJPY</option>
                        <option value="EURAUD">EURAUD</option>
                        <option value="NZDJPY">NZDJPY</option>
                    </select>
                    <button type="submit" className="btn btn-primary ml-2">
                        Start Chat
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className='w-5/6 h-5/6 mx-auto my-8 flex flex-col gap-4'>
            <div className="text-sm">
                Selected Currency: {selectedCurrency}
            </div>

            <div className="flex-1 overflow-y-auto">
                {messages.map(message => (
                    <div key={message.id} className='mb-4'>
                        {message.role === 'user' ? 'You: ' : 'AY: '}
                        {message.content}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-auto">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Say something..."
                    className="input w-full max-w-xs"
                />
            </form>
        </div>
    )
}

export default Chat
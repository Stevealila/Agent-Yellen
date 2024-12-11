"use client"
import { getTodayCurrencyHeadlineLinks } from '@/actions/scrape'
import Link from 'next/link'
import { useActionState } from 'react'

const CurrencyInputForm = () => {
    const [formState, formAction] = useActionState(getTodayCurrencyHeadlineLinks, [])

  return (
    <div>

      <form action={formAction} className='my-8 w-3/4 mx-auto flex justify-center items-center'>
          <input 
            type='text' name='currencyPairName' placeholder='Currency e.g USDCAD'
            className='w-1/2 border-b border-gray-300 text-gray-900 px-2 py-1 outline-none'
          />
      </form>
      <ul className='w-3/4 mx-auto'>
          {formState.map((url, index) => (
            <li key={index}><Link href={url}>{url}</Link></li>
          ))}
      </ul>
    </div>
  )
}

export default CurrencyInputForm
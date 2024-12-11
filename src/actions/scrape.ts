"use server"

import puppeteer from "puppeteer"
import path from "path"
import fs from "fs/promises"

export const getTodayCurrencyHeadlineLinks = async (prevState: string[], formData: FormData) => {
    const currency = formData.get('currencyPairName')
    
    let browser
    try {
        // No need to open many headless browsers
        if (!browser){
            browser = await puppeteer.launch()
        }

        const page = await browser.newPage()
        await page.goto(`https://fxstreet.com/news?q=${currency}`)
        await page.waitForSelector('.fxs_headline_tiny a')
        
        // Manipulate the DOM
        const scrapedUrls = await page.evaluate(() => {
            const hrefs = document.querySelectorAll<HTMLAnchorElement>('.fxs_headline_tiny a')

            const date = new Date()
            const todaysDate = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`

            const urls = Array.from(hrefs).map(url => url.href).filter(url => url.includes(todaysDate))
            return urls
        })

        // free up resources used by headless browsers
        await browser.close()
        await browser.disconnect()

        // save the array of URLs for (later) RAG usage
        const saveFilePath = path.join(process.cwd(), "scrapedUrls.txt")
        await fs.writeFile(saveFilePath, scrapedUrls.join('\n'), 'utf-8')
        
        return scrapedUrls.length ? scrapedUrls : ["No data found"]
        
    } catch (error) {
        return [error instanceof Error ? error.message : "unknown error"]
    } finally {
        if(browser) { // for whatever reason an headless browser is still consuming resources in the background
            await browser.close()
            await browser.disconnect()
        }
    }

}
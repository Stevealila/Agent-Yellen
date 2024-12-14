import puppeteer from "puppeteer"
import fs from "fs/promises"
import path from "path"

export const saveTodayNewsLinks = async (): Promise<string[]> => {    
    let browser
    try {
        // Open or use an existing headless browser instance then visit the news page.
        if (!browser) browser = await puppeteer.launch()
        const page = await browser.newPage()
        // await page.goto("https://fxstreet.com/news", { waitUntil: "domcontentloaded" })
        await page.goto("https://fxstreet.com/news?q=USDCAD")

        // Scrape all links posted today
        const allLinks: string[] = []
        const today = new Date()
        const todayDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate()-1).toString().padStart(2, "0")}`
        let hasMorePages = true

        while (hasMorePages) {
            await page.waitForSelector(".fxs_headline_tiny a")

            // Scrape links and dates
            const { todaysLinks, hasTodayArticles } = await page.evaluate(todayDate => {
                const articles = document.querySelectorAll<HTMLDivElement>(".fxs_floatingMedia_textBody")
                
                const links: string[] = []
                let foundToday = false

                articles.forEach((article) => {
                    const linkElement = article.querySelector<HTMLAnchorElement>(".fxs_headline_tiny a")
                    const timeElement = article.querySelector<HTMLTimeElement>(".fxs_entry_metaInfo time")

                    if (linkElement && timeElement) {
                        const date = timeElement.getAttribute("datetime")?.split("T")[0]
                        if (date === todayDate) {
                            foundToday = true
                            const href = linkElement.getAttribute("href")
                            if (href) links.push(href)
                        }
                    }
                })

                return { todaysLinks: links, hasTodayArticles: foundToday }
            }, todayDate)
            allLinks.push(...todaysLinks)

            // If there are no articles from today, break the loop
            if (!hasTodayArticles) break

            // Check if there is a next page button and get its URL
            const nextPageUrl = await page.evaluate(() => {
                const nextButton = document.querySelector<HTMLAnchorElement>(".ais-pagination .ais-pagination--item__next a")
                return nextButton ? nextButton.href : null
            });

            if (nextPageUrl) {
                await page.goto(nextPageUrl, { waitUntil: "domcontentloaded" })
            } else {
                hasMorePages = false
            }
        }

        // Release resources consumed by the headless browsers
        await browser.close()
        await browser.disconnect()

        // Save to local txt file 
        const saveFilePath = path.join(process.cwd(), "scrapedUrls.txt")
        await fs.writeFile(saveFilePath, allLinks.join("\n"), "utf-8")
        
        return allLinks
        
    } catch (error) {
        console.error("................ERROR:\n", error instanceof Error ? error.message : "Unknown error")
        return []
    } finally {
        if (browser) { // for whatever reason headless browser(s) still running in the background
            await browser.close()
            await browser.disconnect()
        }
    }
}

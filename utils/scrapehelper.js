const { chromium } = require('playwright');
async function scrollPage(page, scrollContainer, limit=1000) {
    let lastHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
    let count = 0;
    while (true && count < limit) {
      await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
      await page.waitForTimeout(3500);
      let newHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
      if (newHeight === lastHeight) {
        break;
      }
      lastHeight = newHeight;
      count++;
    }
  }
async function scrapeBusinessData(page, searchParams) {
    await page.goto(`https://www.google.com/maps/search/${searchParams}`);


    let mainlabel;
    try {
        await page.waitForSelector(".w6VYqd > div:nth-child(2) > div:first-child > div:first-child > div:first-child > div:first-child");
        mainlabel = await page.evaluate(() => {
    
        return { 
            title: document.querySelector(".DUwDvf")?.textContent.trim()}
            
        });
    } catch(error){
        mainlabel = {}
    }
    
    console.log("main step2");
    if(mainlabel.title)
    {        
        await page.close();
        await browser.close();
        return [];
    }
    else{
        try {
            await page.waitForSelector(".DxyBCb",{state:'visible'}); 
        } catch(error){
            return [];
        }
       
        await scrollPage(page, 'div.m6QErb.DxyBCb:first-child[role=feed]',5000);
        await page.waitForSelector(".Nv2PK");

        let businessData = [];
        let pages = await mainpage.evaluate(() => {
            return Array.from(document.querySelectorAll(".Nv2PK")).map((el) => {
            return {type:el.querySelector(".UaQhfb > div:last-child > div:first-child > span:first-child")?.textContent.trim(),href:el.querySelector(".hfpxzc")?.getAttribute("href"),jslog:el.querySelector(".hfpxzc")?.getAttribute("jslog")}})});
        
        for(let i = 0; i <pages.length ; i++)
        {
            if(pages[i].jslog && pages[i].href)
            {
                const location_link = pages[i].href;
                let google_id = location_link.match(/0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g) ? location_link.match(/0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g)[0] : "";
                let cid  = convertFeatureIdToCid(google_id);

                const pagehandle = await page.waitForSelector('a[href="'+pages[i].href+'"]',{state:'visible'});
                await page.focus('a[href="'+pages[i].href+'"]');
                await page.$eval('a[href="'+pages[i].href+'"]', el => el.click());    
                await page.waitForTimeout(3000);

                await page.waitForSelector(".DUwDvf");
  
                const placeInfo = await page.evaluate(() => {

                    return {
                        title: document.querySelector(".DUwDvf")?.textContent.trim(),
                        address: document.querySelector("button[data-item-id='address'] > div>div:last-child")?.textContent.trim(), // data-item-id attribute may be different if the language is not English
                        phone: document.querySelector("button[data-tooltip='Copy phone number'] > div>div:last-child")?.textContent.trim(), // data-item-id attribute may be different if the language is not English
                        rating: document.querySelector("div.F7nice>span")?.textContent.trim(),
                        reviews_temp: document.querySelector("div.F7nice>span:last-child")?.textContent.trim(),
                        site_url:document.querySelector("a[data-item-id='authority'] > div>div:last-child")?.textContent.trim(),
                        place_img:document.querySelector(".aoRNLd>img")?.getAttribute("src"),
                        type: document.querySelector(".DkEaL")?.textContent,
                        };              
                  });
                const addresslist = placeInfo.address ? placeInfo.address.split(", ") : [];
                placeInfo["reviews"] = placeInfo["reviews_temp"] ? placeInfo["reviews_temp"].split("(")[1] ? placeInfo["reviews_temp"].split("(")[1].split(")")[0] ? parseInt(placeInfo["reviews_temp"].split("(")[1].split(")")[0].replace(',','')) : 0 : 0 : 0;
                if(addresslist.length >= 5)
                {
                    placeInfo["city"]=  placeInfo.address ? addresslist[2]? addresslist[2] : "":"";
                    placeInfo["us_state"]= placeInfo.address? addresslist[3]?.split(" ")[0]:"";
                    placeInfo["postal_code"]= addresslist[3]?.split(" ")[1];
                    placeInfo["street"]= addresslist[0]?addresslist[0]: "";
                }
                else{
                    placeInfo["city"]= placeInfo.address ?  addresslist[1] ? addresslist[1] : "":"";
                    placeInfo["us_state"]= placeInfo.address ? addresslist[2]?.split(" ")[0] : "";
                    placeInfo["postal_code"]= addresslist[2]?.split(" ")[1];
                    placeInfo["street"]= addresslist[0]?addresslist[0] : "";
                }
                placeInfo["CID"] = cid;
                console.log(placeInfo);
                if(data.data.category == 'Hotel')
                {
                if(pages[i].type == "Hotel" || pages[i].type.includes("hotel"))
                {
                    placeInfo.type = "Hotel"
                }
                }

                if(data.data.category == 'Handyman')
                {
                if(pages[i].type == "Handyman" || pages[i].type.includes("Handyman"))
                {
                    placeInfo.type = "Handyman"
                }
                }

                if(data.data.category == 'Motel')
                {
                    if(pages[i].type == "Motel" || pages[i].type.includes("motel") || pages[i].type.includes("Motel"))
                    {
                        placeInfo.type = "Motel"
                    }
                }
                businessData.push(placeInfo);
            }  
        }
        return businessData;
    }
}

async function scrapeReviews(page, place) {
    await page.goto(place.url);
    await page.waitForSelector(".hh2c6");
    const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".hh2c6")).map((el) => {
        return el.getAttribute("aria-label")})});
    if(tabs.length >=2)
    {
        try{
        if(tabs[1].includes("Reviews"))
        {
        const handle = await page.waitForSelector(".hh2c6:nth-child(2)",{state:'visible'});
        console.log("tab wait1");
        
        await page.waitForTimeout(2500);
        await page.focus('.hh2c6:nth-child(2)');
        console.log("tab wait2");
        await page.waitForTimeout(2500);
        await page.$eval('.hh2c6:nth-child(2)', el => el.click());                  
        }
        if(tabs.length>=3)
        {
        if(tabs[2].includes("Reviews"))
        {
            const handle = await page.waitForSelector(".hh2c6:nth-child(3)",{state:'visible'});
            console.log("tab wait1");
            
            await page.waitForTimeout(2500);
            await page.focus('.hh2c6:nth-child(3)');
            console.log("tab wait2");
            await page.waitForTimeout(2500);
            await page.$eval('.hh2c6:nth-child(3)', el => el.click());                  
        }
        }
                        
        console.log("tab wait3");
        await page.waitForNavigation();
        await page.waitForSelector(".jftiEf",{state:'visible'});

        //click most recent selection
        if(place.reviews>120)
        {
            if(data.data.category == 'Hotel' || data.data.category == 'Motel')
            {
                await page.focus("button.HQzyZ[aria-label='Most relevant']");

                await page.waitForSelector("button.HQzyZ[aria-label='Most relevant']");
                await page.$eval("button.HQzyZ[aria-label='Most relevant']", el => el.click());    
            }
            else{
                await page.focus("button.g88MCb.S9kvJb[data-value='Sort']");
                await page.waitForSelector("button.g88MCb.S9kvJb[data-value='Sort']");
                await page.$eval("button.g88MCb.S9kvJb[data-value='Sort']", el => el.click());
            }
            await page.waitForSelector("#fDahXd  .fxNQSd[vet='25740']",{ state: 'attached' });
            await page.$eval("#fDahXd  .fxNQSd[vet='25740']", el => el.click());
            await page.waitForNavigation();
            await page.waitForSelector(".jftiEf",{state:'visible'});
        }                  

        } catch(error) {
            console.log("tab error!",error);
            await page.close();
            return false;
        }

        await page.waitForSelector(".DxyBCb");
        await scrollPage(page, '.DxyBCb:last-child',12);
        await page.waitForSelector(".jftiEf",{state:'visible'});
        console.log("get reviews");
        
        if(place.type== 'Hotel' || place.type== 'Motel')
        {
            const reviews = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {                
                return {
                user: {
                    name: el.querySelector(".d4r55")?.textContent.trim(),
                    link: el.querySelector(".WNxzHc button")?.getAttribute("data-href"),
                    review_id: el.querySelector(".WNxzHc button")?.getAttribute("data-review-id"),          
                    thumbnail: el.querySelector(".NBa7we")?.getAttribute("src"),
                    localGuide: true,
                    reviews: parseInt(el.querySelector(".RfnDt")?.textContent.split(" ")[0]),
                },
                tempdate: el.querySelector(".xRkPPb")?.firstChild.textContent.trim(),
                rating: parseInt(el.querySelector(".fzvQIb")?.textContent.split("/")[0])/parseInt(el.querySelector(".fzvQIb")?.textContent.split("/")[1])*5,
                snippet: el.querySelector(".MyEned")?.textContent.trim(),
                likes: parseFloat(el.querySelector(".GBkF3d:nth-child(2)")?.getAttribute("aria-label")),
                owner_answer:el.querySelector(".CDe7pd .wiI7pd")?.textContent.trim(),
                images: Array.from(el.querySelectorAll(".KtCyie button")).length
                    ? Array.from(el.querySelectorAll(".KtCyie button")).map((el) => {
                        return {
                        thumbnail: getComputedStyle(el).backgroundImage.slice(5, -2),
                        };
                    })
                    : undefined,
                };
                
                
                });
            });
            for(let i =0; i < reviews.length; i++)
            {
                if(reviews[i].tempdate)
                {
                    let currentDate = new Date();
                    let numday = 0;
                    let datestringarr = reviews[i].tempdate.split(" ");
                    if(datestringarr[0] == 'a')
                    numday = 1;
                    else
                    numday = parseInt(datestringarr[0]);
                    let numsize = datestringarr[1];
                    if(numsize == 'day' || numsize == 'days')
                    {
                    currentDate.setDate(currentDate.getDate() - numday);
                    }else if(numsize == 'month' || numsize == 'months')
                    {
                    currentDate.setMonth(currentDate.getMonth() - numday);
                    }
                    else if(numsize == 'week' || numsize == 'weeks')
                    {
                    currentDate.setMonth(currentDate.getDate() - numday*7);
                    }else if(numsize == 'year' || numsize == 'years')
                    {
                    currentDate.setFullYear(currentDate.getFullYear() - numday);
                    }
                    reviews[i]["date"] = currentDate;
                }
            }
            console.log("review count:", reviews.length);
            let limitDate = new Date(2024,4,1);
            reviews.filter((review) => review.date < limitDate);
            console.log("filter review count:", reviews.length);
        
            return reviews;
        }
        else{
            const reviews = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {                
                  return {
                    user: {
                      name: el.querySelector(".d4r55")?.textContent.trim(),
                      link: el.querySelector(".WNxzHc button")?.getAttribute("data-href"),
                      review_id: el.querySelector(".WNxzHc button")?.getAttribute("data-review-id"),          
                      thumbnail: el.querySelector(".NBa7we")?.getAttribute("src"),
                      localGuide: true,
                      reviews: parseInt(el.querySelector(".RfnDt")?.textContent.split(" ")[0]),
                    },
                    tempdate: el.querySelector(".rsqaWe")?.textContent.trim(),
                    rating: parseFloat(el.querySelector(".kvMYJc")?.getAttribute("aria-label")),
                    snippet: el.querySelector(".MyEned")?.textContent.trim(),
                    likes: parseFloat(el.querySelector(".GBkF3d:nth-child(2)")?.getAttribute("aria-label")),
                    owner_answer:el.querySelector(".CDe7pd .wiI7pd")?.textContent.trim(),
                    images: Array.from(el.querySelectorAll(".KtCyie button")).length
                      ? Array.from(el.querySelectorAll(".KtCyie button")).map((el) => {
                          return {
                            thumbnail: getComputedStyle(el).backgroundImage.slice(5, -2),
                          };
                        })
                      : undefined,
                  };
                  
                  
                });
              });
            for(let i =0; i < reviews.length; i++)
            {
            if(reviews[i].tempdate)
            {
                let currentDate = new Date();
                let numday = 0;
                let datestringarr = reviews[i].tempdate.split(" ");
                // console.log(datestringarr);
                // console.log(currentDate);
                if(datestringarr[0] == 'a')
                numday = 1;
                else
                numday = parseInt(datestringarr[0]);
                let numsize = datestringarr[1];
                if(numsize == 'day' || numsize == 'days')
                {
                currentDate.setDate(currentDate.getDate() - numday);
                }else if(numsize == 'month' || numsize == 'months')
                {
                currentDate.setMonth(currentDate.getMonth() - numday);
                }
                else if(numsize == 'week' || numsize == 'weeks')
                {
                currentDate.setMonth(currentDate.getDate() - numday*7);
                }else if(numsize == 'year' || numsize == 'years')
                {
                currentDate.setFullYear(currentDate.getFullYear() - numday);
                }
                reviews[i]["date"] = currentDate;
            }
            }
            console.log("review count:", reviews.length);
            let limitDate = new Date(2024,4,1);
            reviews.filter((review) => review.date < limitDate);
            console.log("filter review count:", reviews.length);
            return reviews;
        }
    }
}

module.exports = {
    scrapeBusinessData,
    scrapeReviews
};
const { chromium } = require("playwright");
async function scrollPage(page, scrollContainer, limit = 1000) {
  console.log("scroll down");
  let lastHeight = await page.evaluate(
    `document.querySelector("${scrollContainer}").scrollHeight`
  );
  let count = 0;
  while (true && count < limit) {
    try {
      await Promise.race([
        page.evaluate(
          `document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Scroll step timed out after 10 seconds")), 10000)
          ),
        ]);
      await page.waitForTimeout(3500);
      let newHeight = await Promise.race([page.evaluate(
        `document.querySelector("${scrollContainer}").scrollHeight`
        ),new Promise((_, reject) => 
          setTimeout(() => reject(new Error("ScrollHeight retrieval timed out after 10 seconds")), 10000)
        ),
      ]);
      console.log(newHeight,":",lastHeight);
      console.log("count :",count);
      if (newHeight === lastHeight) {
        return true;
      }
      lastHeight = newHeight;
      count++;
    } catch (error) {
      console.error(error.message); // Log any timeout errors
      return false; // Break the loop if any operation times out
    }
  }
}
async function getReviewsFromPage(page, placedata) {
  if (placedata.type == "Hotel" || placedata.type == "Motel") {
    const reviews = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
        return {
          user: {
            name: el.querySelector(".d4r55")?.textContent.trim(),
            link: el.querySelector(".WNxzHc button")?.getAttribute("data-href"),
            review_id: el
              .querySelector(".WNxzHc button")
              ?.getAttribute("data-review-id"),
            thumbnail: el.querySelector(".NBa7we")?.getAttribute("src"),
            localGuide: true,
            reviews: parseInt(
              el.querySelector(".RfnDt")?.textContent.split(" ")[0]
            ),
          },
          tempdate: el.querySelector(".xRkPPb")?.firstChild.textContent.trim(),
          rating:
            (parseInt(el.querySelector(".fzvQIb")?.textContent.split("/")[0]) /
              parseInt(
                el.querySelector(".fzvQIb")?.textContent.split("/")[1]
              )) *
            5,
          snippet: el.querySelector(".MyEned")?.textContent.trim(),
          likes: parseFloat(
            el.querySelector(".GBkF3d:nth-child(2)")?.getAttribute("aria-label")
          ),
          owner_answer: el.querySelector(".CDe7pd .wiI7pd")?.textContent.trim(),
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
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].tempdate) {
        let currentDate = new Date();
        let numday = 0;
        let datestringarr = reviews[i].tempdate.split(" ");
        // console.log(datestringarr);
        // console.log(currentDate);
        if (datestringarr[0] == "a") numday = 1;
        else numday = parseInt(datestringarr[0]);
        let numsize = datestringarr[1];
        if (numsize == "day" || numsize == "days") {
          currentDate.setDate(currentDate.getDate() - numday);
        } else if (numsize == "month" || numsize == "months") {
          currentDate.setMonth(currentDate.getMonth() - numday);
        } else if (numsize == "week" || numsize == "weeks") {
          currentDate.setMonth(currentDate.getDate() - numday * 7);
        } else if (numsize == "year" || numsize == "years") {
          currentDate.setFullYear(currentDate.getFullYear() - numday);
        }
        reviews[i]["date"] = currentDate;
      }
    }
    console.log("review count:", reviews.length);
    let limitDate = new Date(2024, 6, 1);
    reviews.filter((review) => review.date < limitDate);
    console.log("filter review count:", reviews.length);
    return reviews;
  } else {
    const reviews = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
        return {
          user: {
            name: el.querySelector(".d4r55")?.textContent.trim(),
            link: el.querySelector(".WNxzHc button")?.getAttribute("data-href"),
            review_id: el
              .querySelector(".WNxzHc button")
              ?.getAttribute("data-review-id"),
            thumbnail: el.querySelector(".NBa7we")?.getAttribute("src"),
            localGuide: true,
            reviews: parseInt(
              el.querySelector(".RfnDt")?.textContent.split(" ")[0]
            ),
          },
          tempdate: el.querySelector(".rsqaWe")?.textContent.trim(),
          rating: parseFloat(
            el.querySelector(".kvMYJc")?.getAttribute("aria-label")
          ),
          snippet: el.querySelector(".MyEned")?.textContent.trim(),
          likes: parseFloat(
            el.querySelector(".GBkF3d:nth-child(2)")?.getAttribute("aria-label")
          ),
          owner_answer: el.querySelector(".CDe7pd .wiI7pd")?.textContent.trim(),
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
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].tempdate) {
        let currentDate = new Date();
        let numday = 0;
        let datestringarr = reviews[i].tempdate.split(" ");
        // console.log(datestringarr);
        // console.log(currentDate);
        if (datestringarr[0] == "a") numday = 1;
        else numday = parseInt(datestringarr[0]);
        let numsize = datestringarr[1];
        if (numsize == "day" || numsize == "days") {
          currentDate.setDate(currentDate.getDate() - numday);
        } else if (numsize == "month" || numsize == "months") {
          currentDate.setMonth(currentDate.getMonth() - numday);
        } else if (numsize == "week" || numsize == "weeks") {
          currentDate.setMonth(currentDate.getDate() - numday * 7);
        } else if (numsize == "year" || numsize == "years") {
          currentDate.setFullYear(currentDate.getFullYear() - numday);
        }
        reviews[i]["date"] = currentDate;
      }
    }
    console.log("review count:", reviews.length);
    let limitDate = new Date(2024, 6, 1);
    reviews.filter((review) => review.date < limitDate);
    console.log("filter review count:", reviews.length);
    return reviews;
  }
}
async function getPlacesFromEachPage(mainpage, browser, data) {
  const places = [];
  const oldpages = [];
  const cidlist = [];
  if(data.updateflag)
    {
      for(let updateindex = 0; updateindex < data.updatelist.length; updateindex++)
        cidlist.push(data.updatelist[updateindex].cid);
    }
  let pages = await mainpage.evaluate(() => {
    return Array.from(document.querySelectorAll(".Nv2PK")).map((el) => {
      return {
        type: el
          .querySelector(
            ".UaQhfb > div:last-child > div:first-child > span:first-child"
          )
          ?.textContent.trim(),
        href: el.querySelector(".hfpxzc")?.getAttribute("href"),
        jslog: el.querySelector(".hfpxzc")?.getAttribute("jslog"),
      };
    });
  });
  console.log(
    "----------------------",
    pages.length,
    "------------------------"
  );
  let tempcount = 0;
  for (let i = 0; i < pages.length; i++) {
    console.log("place of : ", data.threadindex);
    oldpages.push(pages[i]);
    console.log(pages[i]);
    console.log(pages[i].type,":", data.data.category);
    if (pages[i].jslog && pages[i].href && pages[i].type && (pages[i].type.toLowerCase() == data.data.category.toLowerCase() ||(pages[i].type == "Hotel" || pages[i].type.includes("hotel")) || (pages[i].type == "Motel" || pages[i].type.includes("motel") || pages[i].type.includes("Motel")))) {
      console.log("step1 arrive");
      const location_link = pages[i].href;
      const convertFeatureIdToCid = (featureId) => {
        const cidHexadecimal = featureId.split(":")[1];
        console.log(featureId, cidHexadecimal);
        const cid = BigInt(`${cidHexadecimal}`).toString();
        return cid;
      };
      let google_id = location_link.match(
        /0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g
      )
        ? location_link.match(/0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g)[0]
        : "";
        if(google_id=="")
          continue;
      let cid = convertFeatureIdToCid(google_id);
      if(cidlist.includes(cid))
        {
          continue;
        }
        else
        {
          cidlist.push(cid);
        }

      // console.log(data);
      console.log("create new page");
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: 1920, height: 1080 });
        console.log("set page status");
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(0);
        console.log("go to url");
        await page.goto(pages[i].href,{timeout:60000});
        console.log("wait for busines page  navigation");
        // await page.waitForNavigation();
        // await page.waitForNavigation({ waitUntil: 'networkidle0',timeout: 520000 });
        await page.waitForSelector(".DUwDvf",{timeout:30000});
        console.log("start page scrape");
      } catch (error) {
        console.log("business page error:", error);
        i--;
        await page.close();
        continue;
      }

      //   const location_link = pages[i].href;
      //   let google_id = location_link.match(/0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g) ? location_link.match(/0x[a-f,0-9]{10,16}:0x[a-f,0-9]{10,16}/g)[0] : "";
      console.log("get placeinfo data");
      //placeInfo+-*-

      const placeInfo = await fillPlaceInfo(page, data);
      placeInfo["google_link"] = location_link;
      placeInfo["cid"] = cid;
      console.log(placeInfo);
      // console.log(pages.length + ':'+i);
      // console.log(data.data.city,data.data.category);
      console.log(placeInfo.city, placeInfo.type);
      if (data.data.category == "Hotel" && pages[i].type) {
        if (pages[i].type == "Hotel" || pages[i].type.includes("hotel")) {
          placeInfo.type = "Hotel";
        }
      }

      if (data.data.category == "Motel" && pages[i].type) {
        if (
          pages[i].type == "Motel" ||
          pages[i].type.includes("motel") ||
          pages[i].type.includes("Motel")
        ) {
          placeInfo.type = "Motel";
        }
      }
      let reviewsortflag = 0;
      if (placeInfo.city && placeInfo.type&&
        placeInfo.city == data.data.city &&
        placeInfo.type.toLowerCase() == data.data.category.toLowerCase()
      ) {

        tempcount++;
        console.log("business count:",tempcount);
        //reviewInfo
        if (
          placeInfo["reviews"])
         {
          console.log("get tabs");
          await page.waitForSelector(".hh2c6");
          const tabs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".hh2c6")).map((el) => {
              return el.getAttribute("aria-label");
            });
          });
          if (tabs.length >= 2) {
            try {
              if (tabs[1].includes("Reviews")) {
                const handle = await page.waitForSelector(
                  ".hh2c6:nth-child(2)",
                  { state: "visible" }
                );
                console.log("tab wait1");

                await page.waitForTimeout(2500);
                await page.focus(".hh2c6:nth-child(2)");
                console.log("tab wait2");
                await page.waitForTimeout(2500);
                await page.$eval(".hh2c6:nth-child(2)", (el) => el.click());
              }
              if (tabs.length >= 3) {
                if (tabs[2].includes("Reviews")) {
                  const handle = await page.waitForSelector(
                    ".hh2c6:nth-child(3)",
                    { state: "visible" }
                  );
                  console.log("tab wait1");

                  await page.waitForTimeout(2500);
                  await page.focus(".hh2c6:nth-child(3)");
                  console.log("tab wait2");
                  await page.waitForTimeout(2500);
                  await page.$eval(".hh2c6:nth-child(3)", (el) => el.click());
                }
                if (tabs[3] && tabs[3].includes("Reviews")) {
                  const handle = await page.waitForSelector(
                    ".hh2c6:nth-child(4)",
                    { state: "visible" }
                  );
                  console.log("tab wait1");

                  await page.waitForTimeout(2500);
                  await page.focus(".hh2c6:nth-child(4)");
                  console.log("tab wait2");
                  await page.waitForTimeout(2500);
                  await page.$eval(".hh2c6:nth-child(4)", (el) => el.click());
                }
              }

              console.log("tab wait3");
              await page.waitForTimeout(3500);
              await page.waitForSelector(".jftiEf", { state: "visible" ,timeout:60000 });
              console.log("tab wait4");
              //click most recent selection
              if (placeInfo.reviews > 200) {
                if (
                  data.data.category == "Hotel" ||
                  data.data.category == "Motel"
                ) {
                  reviewsortflag = 1;
                  // console.log("tab wait4-1");
                  // await page.focus("button.HQzyZ[aria-label='Most relevant']",{timeout:60000});
                  // console.log("tab wait4-2");
                  // await page.waitForSelector(
                  //   "button.HQzyZ[aria-label='Most relevant']",{timeout:60000}
                  // );
                  // console.log("tab wait4-3");
                  // await page.$eval(
                  //   "button.HQzyZ[aria-label='Most relevant']",
                  //   (el) => el.click()
                  // );
                  // console.log("tab wait4-4");
                } else 
                {
                  console.log("tab wait4-1");
                  await page.focus("button.g88MCb.S9kvJb[data-value='Sort']",{timeout:60000});
                  console.log("tab wait4-2");
                  await page.waitForSelector(
                    "button.g88MCb.S9kvJb[data-value='Sort']",{timeout:60000}
                  );
                  console.log("tab wait4-3");
                  await page.$eval(
                    "button.g88MCb.S9kvJb[data-value='Sort']",
                    (el) => el.click()
                  );
                  console.log("tab wait4-4");
                  await page.waitForSelector("#fDahXd  .fxNQSd[vet='25740']", {
                    state: "attached",timeout:60000
                  });
                  console.log("tab wait5");
                  await page.$eval("#fDahXd  .fxNQSd[vet='25740']", (el) =>
                    el.click()
                  );
                }
                
                console.log("tab wait6");
                await page.waitForTimeout(2500);
                console.log("tab wait7");
                await page.waitForSelector(".jftiEf", { state: "visible",timeout:60000 });
                console.log("tab wait8");
              }
            } catch (error) {
              console.log("tab error!", error);
              await page.close();
              i--;
              continue;
            }
            console.log("tab wait9");
            await page.waitForSelector(".DxyBCb",{timeout:60000});
            console.log("tab wait10");
            if(reviewsortflag)
              await scrollPage(page, ".DxyBCb:last-child", 200000);
            else
              await scrollPage(page, ".DxyBCb:last-child", 20);
            await page.waitForSelector(".jftiEf", { state: "visible"});
            console.log("get reviews");
            const reviews = await getReviewsFromPage(page, placeInfo);
            places.push({
              placeInfo: placeInfo,
              reviews: reviews,
              google_id: google_id,
              cid:cid,
              query:
                data.data.category +
                " in " +
                data.data.city +
                ", " +
                data.data.state +
                "",
            });
          } else {
            places.push({
              placeInfo: placeInfo,
              reviews: [],
              google_id: google_id,
              cid:cid,
              query:
                data.data.category +
                " in " +
                data.data.city +
                ", " +
                data.data.state +
                "",
            });
          }
        } else {
          places.push({
            placeInfo: placeInfo,
            reviews: [],
            cid:cid,
            google_id: google_id,
            query:
              data.data.category +
              " in " +
              data.data.city +
              ", " +
              data.data.state +
              "",
          });
        }
      }
      await page.close();
      // if (data.updateflag) {
      //   if (
      //     data.data.full_address == placeInfo.address ||
      //     data.data.google_id == google_id
      //   ) {
      //     return places;
      //   } else {
      //     places.pop();
      //   }
      // }

      // }
    }
  }
  // console.log(places);
  console.log("one query success");
  return places;
}
async function fillPlaceInfo(page, data) {
  const placeInfo = await page.evaluate(() => {
    return {
      title: document.querySelector(".DUwDvf")?.textContent.trim(),
      address: document
        .querySelector("button[data-item-id='address'] > div>div:last-child")
        ?.textContent.trim(), // data-item-id attribute may be different if the language is not English
      phone: document
        .querySelector(
          "button[data-tooltip='Copy phone number'] > div>div:last-child"
        )
        ?.textContent.trim(), // data-item-id attribute may be different if the language is not English
      rating: document.querySelector("div.F7nice>span")?.textContent.trim(),
      reviews_temp: document
        .querySelector("div.F7nice>span:last-child")
        ?.textContent.trim(),
      site_url: document
        .querySelector("a[data-item-id='authority'] > div>div:last-child")
        ?.textContent.trim(),
      place_img: document.querySelector(".aoRNLd>img")?.getAttribute("src"),
      type: document.querySelector(".DkEaL")?.textContent,
    };
  });
  const addresslist = placeInfo.address ? placeInfo.address.split(", ") : [];
  //   placeInfo["reviews_temp"] = placeInfo["reviews_temp"] ? placeInfo["reviews_temp"].placeInfo["reviews_temp"].replace(",","") : "";
  placeInfo["reviews"] = placeInfo["reviews_temp"]
    ? placeInfo["reviews_temp"].split("(")[1]
      ? placeInfo["reviews_temp"].split("(")[1].split(")")[0]
        ? parseInt(
            placeInfo["reviews_temp"]
              .split("(")[1]
              .split(")")[0]
              .replace(",", "")
          )
        : 0
      : 0
    : 0;
  if (addresslist.length >= 5) {
    placeInfo["city"] = placeInfo.address
      ? addresslist[2]
        ? addresslist[2]
        : ""
      : "";
    placeInfo["us_state"] = placeInfo.address
      ? addresslist[3]?.split(" ")[0]
      : "";
    placeInfo["postal_code"] = addresslist[3]?.split(" ")[1];
    placeInfo["street"] = addresslist[0] ? addresslist[0] : "";
  } else {
    placeInfo["city"] = placeInfo.address
      ? addresslist[1]
        ? addresslist[1]
        : ""
      : "";
    placeInfo["us_state"] = placeInfo.address
      ? addresslist[2]?.split(" ")[0]
      : "";
    placeInfo["postal_code"] = addresslist[2]?.split(" ")[1];
    placeInfo["street"] = addresslist[0] ? addresslist[0] : "";
  }

  return placeInfo;
}

async function getScrapePlaceReviews(query) {
  console.log("browerser create");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.setDefaultNavigationTimeout(0);
  await page.setDefaultTimeout(0);
  await page.goto(query.url);
  const placeInfo = {};
  // await page.waitForNavigation({waitUntil:'domcontentloaded'});
  console.log("main step1");
  let mainlabel;
  try {
    await page.waitForSelector(
      ".w6VYqd > div:nth-child(2) > div:first-child > div:first-child > div:first-child > div:first-child"
    );
    mainlabel = await page.evaluate(() => {
      return {
        title: document.querySelector(".DUwDvf")?.textContent.trim(),
      };
    });
  } catch (error) {
    mainlabel = {};
  }

  console.log("main step2");
  if (mainlabel.title) {
    console.log("main step2-0");
    await page.close();
    await browser.close();
    return { threadindex: query.threadindex, data: [], success: true };
  } else {
    try {
      await page.waitForSelector(".DxyBCb", { visible: true,timeout:120000 });
    } catch (error) {
      return { threadindex: query.threadindex, data: [], success: true };
    }
    console.log("main step2-1");
    let scrollflag = await scrollPage(page, "div.m6QErb.DxyBCb:first-child[role=feed]", 5000);
    if( scrollflag == false)
      {
        return { threadindex: query.threadindex, data: [], success: false };
      }
    console.log("main step2-2");
    await page.waitForSelector(".Nv2PK", { timeout:120000 });

    console.log("main step3");
    const places = await getPlacesFromEachPage(page, browser, query);
    await page.close();
    await browser.close();
    return { threadindex: query.threadindex, success: true, data: places };
  }
}
process.on('message', async (data) => {
  try {
  const result = await getScrapePlaceReviews(data);
  console.log("query success");
  process.send(result);
} catch(error){
        console.log("this query is error!!!:",error);
        process.send({threadindex: data.threadindex,success:false});
      }
  // process.exit(0);
});


module.exports = {
  getScrapePlaceReviews,
};

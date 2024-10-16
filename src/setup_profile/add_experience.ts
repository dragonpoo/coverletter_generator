import { until, By, Key, Condition } from "selenium-webdriver";
import { Settings } from "../settings";
export const add_experience = async function(driver: any, title: string, company: string, location: string, description: string, startyear: number, startmonth: number, endyear: number, endmonth: number) {
    let el;
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=employment-add-btn]")), Settings.Delay.Short);
            await driver.executeScript("document.querySelector(\"[data-qa=employment-add-btn]\").click()");
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    while(true) {
        try {
            el = await driver.wait(until.elementLocated(By.css("[data-qa=job-title] input")), Settings.Delay.Short);
            await driver.executeScript(`arguments[0].click()`, el);
            await driver.sleep(Settings.Delay.Short);
            await driver.wait(until.elementLocated(By.css("[data-qa=job-title] input")), Settings.Delay.Short).sendKeys(title);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }

    while(true) {
        try {
            if(process.platform == "darwin")
              await driver.wait(until.elementLocated(By.css("[data-qa=company-name] input")), Settings.Delay.Short).sendKeys(Key.COMMAND, 'a');
            else
              await driver.wait(until.elementLocated(By.css("[data-qa=company-name] input")), Settings.Delay.Short).sendKeys(Key.CONTROL, 'a');
            await driver.wait(until.elementLocated(By.css("[data-qa=company-name] input")), Settings.Delay.Short).sendKeys(company);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    if(location != '') {
        while(true) {
            try {
                await driver.wait(until.elementLocated(By.css("[data-qa=city-name] input")), Settings.Delay.Short).sendKeys(location);
                break;
            } catch(e) {
                await driver.sleep(Settings.Delay.Short);
            }
        }
    }
    while(true) {
        try {
            await driver.findElement(By.css("[data-qa=description] textarea")).sendKeys(description);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    //startdate-month
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=start-date] [data-qa=month]>div")), Settings.Delay.Short)
            await driver.executeScript("document.querySelector(\"[data-qa=start-date] [data-qa=month]>div\").click()");
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css(`[data-qa=start-date] [data-qa=month]>div ul li:nth-child(${startmonth})`)), Settings.Delay.Short)
            await driver.executeScript(`document.querySelector("[data-qa=start-date] [data-qa=month]>div ul li:nth-child(${startmonth})").click()`);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    //startdate-year
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=start-date] [data-qa=year]>div")), Settings.Delay.Short)
            await driver.executeScript("document.querySelector(\"[data-qa=start-date] [data-qa=year]>div\").click()");
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css(`[data-qa=start-date] [data-qa=year]>div ul li:nth-child(${2024-startyear})`)), Settings.Delay.Short)
            await driver.executeScript(`document.querySelector("[data-qa=start-date] [data-qa=year]>div ul li:nth-child(${2024-startyear})").click()`);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    //enddate-month
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=end-date] [data-qa=month]>div")), Settings.Delay.Short)
            await driver.executeScript("document.querySelector(\"[data-qa=end-date] [data-qa=month]>div\").click()");
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css(`[data-qa=end-date] [data-qa=month]>div ul li:nth-child(${endmonth})`)), Settings.Delay.Short)
            await driver.executeScript(`document.querySelector("[data-qa=end-date] [data-qa=month]>div ul li:nth-child(${endmonth})").click()`);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    //enddate-year
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=end-date] [data-qa=year]>div")), Settings.Delay.Short)
            await driver.executeScript("document.querySelector(\"[data-qa=end-date] [data-qa=year]>div\").click()");
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css(`[data-qa=end-date] [data-qa=year]>div ul li:nth-child(${2024-endyear})`)), Settings.Delay.Short)
            await driver.executeScript(`document.querySelector("[data-qa=end-date] [data-qa=year]>div ul li:nth-child(${2024-endyear})").click()`);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }

    while(true) {
        try {
            await driver.wait(until.elementLocated(By.css("[data-qa=btn-save]")), Settings.Delay.Max)
            await driver.executeScript(`document.querySelector("[data-qa=btn-save]").click()`);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
    await driver.sleep(4000);
}
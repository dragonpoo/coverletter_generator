import { until, By, Key, Condition } from "selenium-webdriver";
import { Settings } from "../settings";
import { elementIsClickableCondition } from "../clickable_helper";
export const add_education = async function(driver: any, school: string, degree: string, field: string, description: string, startyear: number, endyear: number) {
    let el;
    el = await driver.wait(elementIsClickableCondition(By.css("[data-qa=education-add-btn]")), Settings.Delay.Max)
    await driver.executeScript(`arguments[0].click()`, el);

    el = await driver.wait(elementIsClickableCondition(By.css("[data-qa=school] input")), Settings.Delay.Max);
    await driver.executeScript(`arguments[0].click()`, el);
    await driver.wait(elementIsClickableCondition(By.css("[data-qa=school] input")), Settings.Delay.Max).sendKeys(school);

    el = await driver.wait(elementIsClickableCondition(By.css("[data-qa=degree] input")), Settings.Delay.Max);
    await driver.executeScript(`arguments[0].click()`, el);
    await driver.wait(elementIsClickableCondition(By.css("[data-qa=degree] input")), Settings.Delay.Max).sendKeys(degree);
    el = await driver.wait(elementIsClickableCondition(By.css("[data-qa=degree] li[role]")), Settings.Delay.Max);
    await driver.executeScript(`arguments[0].click()`, el);
    while(true) {
        try{
            await driver.wait(elementIsClickableCondition(By.css("[data-qa=area-of-study] input")), Settings.Delay.Max).sendKeys(field);
            break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }

    el = await driver.wait(until.elementLocated(By.css("[data-qa=description] textarea")), Settings.Delay.Max);
    await driver.executeScript(`arguments[0].click()`, el);
    await driver.findElement(By.css("[data-qa=description] textarea")).sendKeys(description);
    //startdate-year
    await driver.wait(until.elementLocated(By.css("[data-qa=year-from] [data-test=dropdown-toggle]")), Settings.Delay.Max)
    await driver.executeScript("document.querySelector(\"[data-qa=year-from] [data-test=dropdown-toggle]\").click()");
    await driver.wait(until.elementLocated(By.css(`[data-qa=year-from] ul li:nth-child(${2024-startyear})`)), Settings.Delay.Max)
    await driver.executeScript(`document.querySelector("[data-qa=year-from] ul li:nth-child(${2024-startyear})").click()`);
    //enddate-year
    await driver.wait(until.elementLocated(By.css("[data-qa=year-to] [data-test=dropdown-toggle]")), Settings.Delay.Max)
    await driver.executeScript("document.querySelector(\"[data-qa=year-to] [data-test=dropdown-toggle]\").click()");
    await driver.wait(until.elementLocated(By.css(`[data-qa=year-to] ul li:nth-child(${2024-endyear})`)), Settings.Delay.Max)
    await driver.executeScript(`document.querySelector("[data-qa=year-to] ul li:nth-child(${2024-endyear})").click()`);

    el = await driver.wait(until.elementLocated(By.css("[data-qa=btn-save]")), Settings.Delay.Max)
    await driver.executeScript(`arguments[0].click()`, el);
    await driver.sleep(4000);
}
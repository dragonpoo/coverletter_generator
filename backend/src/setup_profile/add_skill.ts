import { until, By, Key, Condition } from "selenium-webdriver";
import { Settings } from "../settings";
export const add_skill = async function(driver: any, skill: string) {
    while(true) {
        try{
            if(process.platform == "darwin")
                await driver.wait(until.elementLocated(By.xpath("//input[@type='search']"))).sendKeys(Key.COMMAND, 'a');
            else
                await driver.wait(until.elementLocated(By.xpath("//input[@type='search']"))).sendKeys(Key.CONTROL, 'a');
            await driver.wait(until.elementLocated(By.xpath("//input[@type='search']"))).sendKeys(skill);
            var tried = 10;
            while(--tried) {
                try{
                    let el = await driver.findElement(By.xpath("//li[@role='option']"));
                    await driver.executeScript("arguments[0].click();", el);
                    break;
                } catch(e) {
                    await driver.sleep(Settings.Delay.Short);
                }
            }
            if(tried>0) break;
        } catch(e) {
            await driver.sleep(Settings.Delay.Short);
        }
    }
}
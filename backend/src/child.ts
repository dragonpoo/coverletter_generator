import {Builder, Browser, By, until} from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import ipc from 'node-ipc'
import { setupProfile } from './setup_profile';
import { Settings } from './settings';
import { measureStart } from './utils';
import { UPStore } from './store';

let driver: any;
ipc.config.id   = 'hello';
ipc.config.retry= 1500;
ipc.config.logger = () => {};
let profileData: any;
let owner_email = process.argv[2];
let email_sent = false;
ipc.connectTo(
    'server',
    function(){
        ipc.of.server.on(
            Settings.Constants.SIGS_CONNECT,
            function(){
                ipc.of.server.emit(Settings.Constants.SIG_TYPE, {type: Settings.Constants.PROC_TYPE_SIGNUP, owner_email: owner_email});
                console.log('## connected to server ##');
            }
        );
        ipc.of.server.on(
            Settings.Constants.SIGS_DISCONNECTED_FROM_SERVER,
            function(){
                console.log('disconnected from server');
            }
        );
        ipc.of.server.on(
            Settings.Constants.SIG_START_SIGNUP,
            function(data){
                profileData = data.profileData;
                startSignUp(profileData);
                const limitedRun = async () => {
                    ipc.of.server.emit(Settings.Constants.SIG_ACCOUNT_CREATED, false);
                    await driver.quit();
                    process.exit();
                };
                setTimeout(limitedRun, 400000);
            }
        );
        ipc.of.server.on(
            Settings.Constants.SIG_EMAIL_VERIFY,
            async function(data){
                while(!email_sent) {
                    await driver.sleep(Settings.Delay.Short);
                }
                try {
                    await setupProfile(driver, data.verifyLink, profileData, owner_email);
                    ipc.of.server.emit(Settings.Constants.SIG_ACCOUNT_CREATED, true);
                    await driver.quit();
                    process.exit();
                } catch(e) {
                    UPStore.creatorService(owner_email).enabled = false;
                }
            }
        );
        ipc.of.server.on(
            Settings.Constants.SIG_QUIT,
            async function() {
                if(driver) await driver.quit();
                process.exit();
            }
        )
        ipc.of.server.on(
            Settings.Constants.SIG_SCREENSHOT,
            function() {
                if(driver) driver.takeScreenshot().then(
                    function(image: any, err: any) {
                        ipc.of.server.emit(Settings.Constants.SIG_SCREENSHOT_REPLY, image);
                    }
                );
                else ipc.of.server.emit(Settings.Constants.SIG_SCREENSHOT_REPLY, Buffer.from('test').toString('base64'));
            }
        );
        ipc.of.server.on(
            Settings.Constants.SIGS_ERROR,
            function(err) {
                console.log("###ERROR")
            }
        );
    }
);

async function startSignUp(profileData: any) {
    measureStart(owner_email, "ACCOUNT_CREATION");
    let options = new Options();
    options.addArguments('--disable-blink-features=AutomationControlled'); // Disable automation control
    options.addArguments('--start-maximized'); // Start browser maximized
    options.addArguments('--disable-infobars'); // Disable infobars
    options.addArguments('--disable-extensions'); // Disable extensions
    options.addArguments('--profile-directory=Default'); // Use default profile
    options.addArguments('--disable-plugins-discovery'); // Disable plugin discovery
    // options.addArguments('--incognito'); // Use incognito mode
    options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
// options.addArguments(`user-data-dir=user_data/acc/${profileData.email}`);
//    if((await Settings.instance(owner_email)).headless_creater) options.headless();
    // options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'); // set User-Agent
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    // driver = uc.Chrome();
    // driver.manage().window().maximize();
    // driver.manage().window().setRect({x:0, y:0, width: 1250, height: 1000});
    let el;
    try {
        if(profileData && profileData.email) {
        await driver.get('https://upwork.com/signup');
        return
        //Cookie
        var tried=5;
        while(--tried) {
            try {
                el = await driver.wait(until.elementLocated(By.id("onetrust-accept-btn-handler")), Settings.Delay.Short);
                await driver.executeScript(`arguments[0].click()`, el);
                break;
            } catch(e) {
                await driver.sleep(Settings.Delay.Short);
            }
        }
        //click freelancer
        await driver.findElement(By.css('[data-qa=work]')).click();//sendKeys('webdriver', Key.RETURN);
        el = await driver.findElement(By.css('[data-qa=btn-apply]'));
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.sleep(2000)
        //write full name
        await driver.findElement(By.css("#first-name-input")).sendKeys(profileData.firstname);
        await driver.sleep(2000)
        await driver.findElement(By.css("#last-name-input")).sendKeys(profileData.lastname);
        await driver.sleep(2000)
        //write email & check validity
        await driver.findElement(By.css("#redesigned-input-email")).sendKeys(profileData.email);
        await driver.sleep(2000)
        await driver.findElement(By.css("#password-input")).sendKeys(profileData.password);
        await driver.sleep(2000)
        if(await emailExists(driver, profileData.email)) {
            ipc.of.server.emit(Settings.Constants.SIG_ALREADY_EXISTS, profileData.email);
            throw `Email '${profileData.email}' already exists in upwork.`;
        }
        while(true) {
            try{
                //Country
                el = await driver.findElement(By.xpath("//div[@class='up-dropdown-toggle-title']"));
                await driver.executeScript("arguments[0].click();", el);
                el = await driver.wait(until.elementLocated(By.xpath("//input[@autocomplete='country-name']")), Settings.Delay.Short);
                el = await driver.wait(until.elementIsVisible(el), Settings.Delay.Short);
                await el.click();
                await el.sendKeys(profileData.country);
                let item = await driver.wait(until.elementLocated(By.xpath("//li[@role='option']")), Settings.Delay.Short);
                await driver.executeScript("arguments[0].click();", item);
                break;
            } catch(e) {
                console.error(e);
                await driver.sleep(Settings.Delay.Short);
            }
        }
        //Terms
        await driver.executeScript("document.querySelector(\"#checkbox-terms+span+small\").click()");
        await driver.executeScript("document.querySelector(\"#button-submit-form\").click()");
        ipc.of.server.emit(Settings.Constants.SIG_VERIFICATION_SENT);
        await driver.wait(until.urlContains('please-verify'), Settings.Delay.Max);
        await driver.wait(until.elementLocated(By.css('.o-please-verify-heading')), Settings.Delay.Max);
        email_sent = true;
        } else {
        }
    }
    catch(e) {
        console.log(e);
    }
    finally {
        // await driver.quit();
    }
};
async function emailExists(driver: any, email: string) {
    //TODO need to check for error label and determine
    return false;
}
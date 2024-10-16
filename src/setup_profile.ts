import {By, Key, until} from 'selenium-webdriver';
import { add_experience } from './setup_profile/add_experience';
import { add_education } from './setup_profile/add_education';
import { add_skill } from './setup_profile/add_skill';
import { Settings } from './settings';
import { mySendKeys } from './utils';
import { elementIsClickableCondition } from './clickable_helper';
export async function setupProfile(driver: any, link: string, profileData: any, owner_email: string) {
  let el;
  try {
    await driver.get(link);
    await driver.get("https://www.upwork.com/nx/create-profile")
    console.log("---- Started Profile Setup");
    var tried = 5;
    while(--tried) {
      try {
        el = await driver.wait(until.elementLocated(By.css("[data-qa=get-started-btn]")), Settings.Delay.Short);
        break;
      } catch(e) { console.log(`Tried get-started-btn: ${tried}`) }
    }
    while(el) {
      try {
        await driver.sleep(Settings.Delay.Short);
        await driver.executeScript("arguments[0].click()", el);
        break;
      } catch(e) { console.log(e) }
    }
    console.log("---- Get Started Clicked");
    await driver.sleep(Settings.Delay.Short);
    await driver.sleep(Settings.Delay.Short);
    await driver.sleep(Settings.Delay.Short);

    while(true) {
      try {
        await driver.wait(until.elementLocated(By.css("[data-test=next-button]")), Settings.Delay.Short);
        await driver.executeScript("document.querySelector(\".experience-radio-btn-container>div:nth-child(1)>div\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Experience Clicked");

    while(true) {
      try {
        await driver.executeScript("document.querySelector(\".goal-radio-btn-container>div:nth-child(1)>div\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Goal Clicked");

    while(true) {
      try {
        await driver.executeScript("document.querySelector(\".work-preference-options-container>div:nth-child(1)>div\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
        await driver.sleep(Settings.Delay.Short);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Work Preference Clicked");
    
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.css("[data-qa=resume-fill-manually-btn]")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Manual Clicked");
    await driver.sleep(Settings.Delay.Short);
    await driver.sleep(Settings.Delay.Short);
    await driver.sleep(Settings.Delay.Short);
    
    while(true) {
      try {
        await (await driver.wait(until.elementLocated(By.css("[data-qa=title-overview] input")), Settings.Delay.Short)).sendKeys(profileData.role);
        await driver.sleep(Settings.Delay.Short);
        await(await driver.wait(until.elementLocated(By.css("[data-test=next-button]")), Settings.Delay.Short)).click();
        // await driver.executeScript(`arguments[0].click()`, el);
        // await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Title");

    try {
      for(let exp of profileData.experiences) {
        await add_experience(driver, exp.title, exp.company, exp.location, exp.description, exp.from_year, exp.from_month, exp.to_year, exp.to_month);
        console.log(`---- Experience(${exp.title} at ${exp.company})`);
      }
      await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
      await driver.sleep(Settings.Delay.Short);
    } catch(e) { console.log(e) }
    console.log("---- Experience");

    try {
      await add_education(driver, profileData.educations.title, profileData.educations.degree, profileData.educations.area, profileData.educations.description, profileData.educations.from, profileData.educations.to);
      await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
      await driver.sleep(Settings.Delay.Short);
    } catch(e) { console.log(e) }
    console.log("---- Education");

    while(true) {
      try {
        //English
        el = await driver.wait(until.elementLocated(By.css("[data-qa=english-level] [data-test=dropdown-toggle]")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- English");
    await driver.sleep(Settings.Delay.Short);
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.css(`[data-qa=english-level] ul li:nth-child(${profileData.english_level})`)), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.executeScript("document.querySelector(\"[data-test=next-button]\").click()");
        
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- English Button");

    try {
      //Add Skill
      for(let skill of profileData.skills) {
        await add_skill(driver, skill);
        console.log(`---- Skill(${skill})`);
      }
      el = await driver.findElement(By.xpath("//*[@data-test='next-button']"));
      await driver.executeScript(`arguments[0].click()`, el);
    } catch(e) { await driver.sleep(Settings.Delay.Short); }
    console.log("---- Skill");

    let currentURL = '';
    while(!currentURL.includes('create-profile/categories')) {
      try {
        //Add Summary
        el = await driver.wait(until.elementLocated(By.xpath("//textarea[@class='air3-textarea form-control']")), Settings.Delay.Short);
        await mySendKeys(driver, el, profileData.summary);
        await el.sendKeys(' ');
        await driver.sleep(Settings.Delay.Short);
        await (await driver.findElement(By.xpath("//*[@data-test='next-button']"))).click();
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
      currentURL = await driver.getCurrentUrl();
    }
    console.log("---- Summary");

    while(true) {
      try {
        //Category
        // let buttons = await driver.wait(until.elementsLocated(By.xpath('//button[@data-qa="category-add-btn"]')), Settings.Delay.Short);
        // for(let button of buttons) {
        //   await button.click();
        // }
        el = await driver.wait(until.elementLocated(By.css(".onb-fe-categories-step [data-test=dropdown-toggle]")), Settings.Delay.Short);
        await driver.executeScript("arguments[0].click()", el);
        await driver.sleep(Settings.Delay.Short);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { console.log(e); }
    }
    while(true) {
      try {
        // element = driver.find_element_by_xpath("//*[contains(text(), 'Web Development')]")
        el = await driver.wait(until.elementLocated(By.css("#dropdown-menu li:nth-child(11) ul li:last-child")), Settings.Delay.Short);
        await driver.executeScript("arguments[0].click()", el);
        break;
      } catch(e) { console.log(e); }
    }
    await driver.sleep(Settings.Delay.Short);
    await (await driver.findElement(By.xpath("//*[@data-test='next-button']"))).click();
    console.log("---- Category");

    while(true) {
      try {
        //Add Hourly
        await driver.wait(until.elementLocated(By.xpath('//input[@data-test="currency-input"]')), Settings.Delay.Short).sendKeys(profileData.hourlyRate);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    await (await driver.findElement(By.xpath("//*[@data-test='next-button']"))).click();
    console.log("---- Hourly");

    while(true) {
      try {
        //Photo
        el = await driver.wait(until.elementLocated(By.xpath("//button[@data-qa='open-loader']")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Avatar1");
    while(true) {
      try {
        await driver.wait(until.elementLocated(By.name("imageUpload")), Settings.Delay.Short).sendKeys(profileData.avatarUrl);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Avatar2");
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Attach photo')]")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.sleep(Settings.Delay.Short);
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Avatar3");
    //Contact Infos
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.css("#country-label+div>div")), Settings.Delay.Short);
        await driver.executeScript("arguments[0].click();", el);
        await driver.wait(until.elementLocated(By.css("#country-label+div input")), Settings.Delay.Short).click();
        await driver.wait(until.elementLocated(By.css("#country-label+div input")), Settings.Delay.Short).sendKeys(profileData.country);
        el = await driver.wait(until.elementLocated(By.xpath("//*[@id='country-label']/following-sibling::div//li[@role='option']")), Settings.Delay.Short);
        await driver.executeScript("arguments[0].click();", el);
        console.log("---- Country");
        break;
      } catch(e) { console.error(e); await driver.sleep(Settings.Delay.Short); }
    }
    while(true) {
      try {
        await driver.wait(until.elementLocated(By.css("[data-test='date-of-birth'] input")), Settings.Delay.Short).clear();
        await driver.wait(until.elementLocated(By.css("[data-test='date-of-birth'] input")), Settings.Delay.Short).sendKeys(profileData.birthday);
        console.log("---- DOB");
        break;
      } catch(e) { console.error(e); await driver.sleep(Settings.Delay.Short); }
    }
    while(true) {
      try {
        await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='street-label']")), Settings.Delay.Short).clear();
        await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='street-label']")), Settings.Delay.Short).sendKeys(profileData.street);
        console.log("---- Street");
        await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='postal-code-label']")), Settings.Delay.Short).clear();
        await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='postal-code-label']")), Settings.Delay.Short).sendKeys(profileData.zipcode);
        console.log("---- ZIP");
        await driver.wait(until.elementLocated(By.xpath("//input[@inputmode='numeric']")), Settings.Delay.Short).clear();
        await driver.wait(until.elementLocated(By.xpath("//input[@inputmode='numeric']")), Settings.Delay.Short).sendKeys(profileData.phone);
        console.log("---- Phone");
        if(process.platform == "darwin")
          await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='city-label']")), Settings.Delay.Short).sendKeys(Key.COMMAND, 'a');
        else
          await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='city-label']")), Settings.Delay.Short).sendKeys(Key.CONTROL, 'a');
        await driver.wait(until.elementLocated(By.xpath("//input[@aria-labelledby='city-label']")), Settings.Delay.Short).sendKeys(profileData.city);
        await driver.sleep(Settings.Delay.Short);await driver.sleep(Settings.Delay.Short);
        console.log("---- City");
        el = await driver.wait(until.elementLocated(By.xpath("//span[@class='air3-menu-item-text']")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        await driver.findElement(By.xpath("//*[@data-test='next-button']")).click();
        break;
      } catch(e) { await driver.sleep(Settings.Delay.Short); }
    }
    const submit_url = "https://www.upwork.com/nx/create-profile/submit/";
    await driver.get(submit_url);
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.xpath('//button[@data-qa="submit-profile-top-btn"]')), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        break;
      } catch(e) { console.log(e); await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Submitted Profile");
    while(true) {
      try {
        el = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Browse jobs')]")), Settings.Delay.Short);
        await driver.executeScript(`arguments[0].click()`, el);
        break;
      } catch(e) { console.log(e); await driver.sleep(Settings.Delay.Short); }
    }
    console.log("---- Browse Job Clicked");
    await driver.get("https://www.upwork.com/ab/notification-settings/");
    var tried = 5;
    while(--tried) {
      try {
        el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'minutes')]")), Settings.Delay.Short * 10);
        await driver.executeScript(`arguments[0].click()`, el);
        el = await driver.wait(until.elementLocated(By.css("[aria-labelledby*=email-unread-activity] li:first-child")), Settings.Delay.Short * 10);
        await driver.executeScript(`arguments[0].click()`, el);
        break;
      } catch(e) { console.error("Failed mail setting"); await driver.sleep(Settings.Delay.Short); }
    }
    await driver.sleep(Settings.Delay.Short * 3);

    //Agency Creation
    if((await Settings.instance(owner_email)).create_agency) {
      await driver.get("https://www.upwork.com/freelancers/settings/contactInfo");
      while(true) {
        try {
          el = await driver.wait(until.elementLocated(By.css("input#securityQuestion_answer")), Settings.Delay.Short);
          await el.sendKeys("1234");
          var els = await driver.wait(until.elementsLocated(By.css("[data-test=checkbox-label]")), Settings.Delay.Short);
          for(const i of els) {
            await i.click();
          }
          el = await driver.wait(until.elementLocated(By.css("#control_save")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) {}
      }
      //
      while(true) {
        try{
          el = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Additional accounts')]")), Settings.Delay.Short);
          el = await driver.wait(until.elementLocated(By.css("button[data-test=newAgencyAccount]")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) { console.log("Waiting Agency button"); }
      }
      while(true) {
        try{
          el = await driver.wait(until.elementLocated(By.css("#agency-name-input")), Settings.Delay.Short);
          await el.sendKeys(`${profileData.firstname} ${profileData.lastname} Tech`);
          el = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continue')]")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) {}
      }
      while(true) {
        try{
          el = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continue with Basic')]")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) {}
      }
      await driver.wait(until.urlContains("/nx/agencies/create/thank-you"), Settings.Delay.Short * 10);
      await driver.get("https://www.upwork.com/nx/ag/settings/");
      while(true) {
        try{
          el = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Close my Agency')]")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) { console.log("Waiting Close Agency button"); }
      }
      while(true) {
        try{
          el = await driver.wait(until.elementLocated(By.css("[role='dialog'] button.up-btn-primary")), Settings.Delay.Short);
          await el.click();
          break;
        } catch(e) { console.log("Waiting Confirm button"); }
      }
      await driver.wait(until.urlContains("/nx/find-work/"), Settings.Delay.Short * 100);
    }

  } finally {
  }
};
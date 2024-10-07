import { Browser, Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { Settings } from "./settings";
import { UPStore, getSignUpSocketByEmail } from "./store";
import { elementIsClickableCondition } from "./clickable_helper";
import ipc from 'node-ipc';
import nodemailer from 'nodemailer';
import { deleteUserData } from "./utils";
import { promises as fs } from 'fs';
import { gsocket } from './index';
import { AppDataSource } from "./data-source";
import { Account } from "./entity/Account";
import { Setting } from "./entity/Setting";

let driver: any = {};
let stopFlag: any = {};
export function getScreenshot(owner_email: string, onShot: any) {
    if(!driver[owner_email]) {
        onShot(btoa('err'));
        return;
    }
    driver[owner_email].takeScreenshot().then(
        function(image: string, err: any) {
            onShot(image);
        }
    );
}
export function stopEmailChecker(owner_email: string) {
    stopFlag[owner_email] = true;
}
export function startEmailService(owner_email: string) {
  if(UPStore.emailService(owner_email).enabled) return;
  stopFlag[owner_email] = false;
  emailChecker(owner_email, async (type: string, data: any) => {
    //Verify
    if(type == Settings.Constants.EMAIL_TYPE_EMAIL_VERIFY) {
      const socket = getSignUpSocketByEmail(data.email);
      if(socket) {
        ipc.server.emit(socket, Settings.Constants.SIG_EMAIL_VERIFY, {verifyLink: data.verifyLink});
        const vacc = await AppDataSource.getRepository(Account).findOneBy({email: socket.email});
        if(vacc) {
          vacc.status = Settings.Constants.STATUS_MAIL_VERIFIED;
          await AppDataSource.getRepository(Account).save(vacc);
        }
      }
    } else if(type == Settings.Constants.EMAIL_TYPE_ACTION_REQUIRED) {
      //Action Required Email
      const vacc = await AppDataSource.getRepository(Account).findOneBy({email: data.email});
      if(vacc) {
        vacc.status = Settings.Constants.STATUS_ACTION_REQUIRED;
        await AppDataSource.getRepository(Account).save(vacc);
        deleteUserData(data.email);
      }
    } else if(type == Settings.Constants.EMAIL_TYPE_GOT_MESSAGED) {
      //Got Messaged
      const setting = await AppDataSource.getRepository(Setting).findOneBy({owner_email: owner_email});
      const vacc = await AppDataSource.getRepository(Account).findOneBy({email: data.email});
      if(vacc) {
        vacc.gotmessaged = true;
        vacc.lastmessage = data.screenshot;
        await AppDataSource.getRepository(Account).save(vacc);
        const password = vacc.json['password'];
      
        const ccEmails = setting?.value?.NotificationSetting?.additional_receive_emails || '';
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'techninjas514@gmail.com',
            pass: 'gbsa ueex erlj fvvg'
          }
        });

        const filename = `output_${new Date().getTime()}.png`;
        await fs.writeFile(`uploads/screenshot/${filename}`, data.screenshot, {encoding: 'base64'});

        var mailOptions = {
          from: 'UP-BOT <techninjas514@gmail.com>',
          to: `${owner_email}`,
          cc: `${ccEmails}`,
          subject: `UP-BOT: New Message(${data.jobtitle})`,
          text: `Email: ${data.email}\nPassword: ${password}\nPlease check your management system.\nhttp://begintrust.com/`,
          html: `Email: <b>${data.email}</b><br>Password: <b>${password.toString().replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")}</b><br>Please check your management system.</br>http://begintrust.com/<br><a href="http://begintrust.com/uploads/screenshot/${filename}"><img style="width: 100%; height: auto;" src="http://begintrust.com/uploads/screenshot/${filename}" /></a>`
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            gsocket.emit("log", error);
          } else {
            gsocket.emit("log", 'Email sent: ' + info.response);
          }
        });
      }
    } else if(type == Settings.Constants.EMAIL_TYPE_SPAM) {
      //Got Messaged
      const setting = await AppDataSource.getRepository(Setting).findOneBy({owner_email: owner_email});
      const ccEmails = JSON.parse(setting?.value || '{}').NotificationSetting?.additional_receive_emails || '';
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'techninjas514@gmail.com',
          pass: 'gbsa ueex erlj fvvg'
        }
      });

      var mailOptions = {
        from: 'UP-BOT <techninjas514@gmail.com>',
        to: `${owner_email}`,
        cc: `${ccEmails}`,
        subject: `UP-BOT: New Spam(${data.spam})`,
        text: `You've got a spam message on your account\nPlease check your management system.\nhttp://begintrust.com/`,
        html: `You've got a spam message on your account<br>Please check your management system.</br>http://begintrust.com/<br>`
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          gsocket.emit("log", error);
        } else {
          gsocket.emit("log", 'Email sent: ' + info.response);
        }
      });
    }
  });
}
async function emailChecker(owner_email: string, onNewEmail: any) {
  stopFlag[owner_email] = false;
  UPStore.emailService(owner_email).enabled = true;
  gsocket.emit("log", 'Email Service Started');
  let options = new Options();
  // options.addArguments(`user-data-dir=user_data/emailchecker`);
//  if((await Settings.instance(owner_email)).headless_email) options.headless();
  driver[owner_email] = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  gsocket.emit("log", "Initialized: " + (!!driver[owner_email]));
  // driver[owner_email].manage().window().maximize();
  driver[owner_email].manage().window().setRect({x:0, y:0, width: 1000, height: 1000});
  const mySetting = await Settings.getSetting(owner_email);
  if(mySetting.EmailServiceSetting) {
    await driver[owner_email].get(mySetting.EmailServiceSetting.serverUrl);
    var tried = 10;
    while(--tried && !stopFlag[owner_email]) {
      try {
        await driver[owner_email].wait(until.elementLocated(By.css('[autocomplete=username]')), Settings.Delay.Short);
        //write full name
        await driver[owner_email].findElement(By.css("[autocomplete=username]")).sendKeys(mySetting.EmailServiceSetting.username);
        break;
      } catch(e) { gsocket.emit("error", `Tried username waiting: ${tried}`); }
    }
    while(!stopFlag[owner_email]) {
      try {
        await driver[owner_email].findElement(By.css("[autocomplete=current-password]")).sendKeys(mySetting.EmailServiceSetting.password);
        await driver[owner_email].executeScript("document.querySelector(\"[data-test=login-submit]\").click()");
        break;
      } catch(e) { gsocket.emit("error", e); }
    }
    while(!stopFlag[owner_email]) {
      try {
        gsocket.emit("log", stopFlag[owner_email] + "Waiting to be inbox page");
        await driver[owner_email].wait(until.titleContains('Inbox'), Settings.Delay.Short);
        break;
      } catch(e) { gsocket.emit("error", `Tried inbox waiting: ${tried}`); }
    }
  } else {
    stopFlag[owner_email] = true;
  }
  
  //Remove toast message
  //document.querySelector(`.toast [data-state="closed"] div`).click()
  //regularly check mail
  let spamflag = '';
  while(!stopFlag[owner_email]) {
    //check spam
    const spamcontrol = await driver[owner_email].executeScript(`return document.querySelector('a[href="/mail/spam"]');`);
    const spamlbl = await driver[owner_email].executeScript(`return document.querySelector('a[href="/mail/spam"]>div>span>span>div')?.innerText;`);
    if(spamlbl) {
      if(spamflag != spamlbl) {
        spamflag = spamlbl;
        //send email
        await onNewEmail(Settings.Constants.EMAIL_TYPE_SPAM, {spam: spamlbl});
      }
    } else {
      if(spamcontrol) spamflag = '';
    }
    //check new message
    let newelements = await driver[owner_email].findElements(By.css(".variable-size-list>div>div>div>div"));
    try {
      for(let i=0; i<newelements.length; i++) {
        const ele = newelements[i];
        const bg = await ele.getCssValue('background-color');
        let child = await ele.findElement(By.xpath('./*/*[2]/*[2]/*/*/span'));
        const color = await child.getCssValue('color');
        
        ele.verifymail = (await ele.getText()).toLowerCase().includes("verify your email address") && (bg == 'rgba(255, 255, 255, 1)' || color == 'rgba(255, 255, 255, 1)');
        ele.verifyid = (await ele.getText()).toLowerCase().includes("action required") && (bg == 'rgba(255, 255, 255, 1)' || color == 'rgba(255, 255, 255, 1)');
        ele.gotmessaged = (await ele.getText()).toLowerCase().includes("you have unread messages") && (bg == 'rgba(255, 255, 255, 1)' || color == 'rgba(255, 255, 255, 1)');
      }
    } catch(e) {
    }
    newelements = newelements.filter((ele: any) => ele.verifymail || ele.verifyid || ele.gotmessaged);
    if(newelements.length>0) {
      const type = newelements[0].verifymail?Settings.Constants.EMAIL_TYPE_EMAIL_VERIFY:newelements[0].verifyid?Settings.Constants.EMAIL_TYPE_ACTION_REQUIRED:newelements[0].gotmessaged?Settings.Constants.EMAIL_TYPE_GOT_MESSAGED:Settings.Constants.EMAIL_TYPE_OTHER;
      try {
        await newelements[0].click();
        await driver[owner_email].sleep(1000);
        var tried = 10;
        while(--tried && !stopFlag[owner_email]) {
          try {
            //check new message
            await driver[owner_email].wait(until.urlContains("threadID"), Settings.Delay.Short);
            await driver[owner_email].wait(until.elementLocated(By.css("[data-test=contact-details]>span>span")), Settings.Delay.Short).click();
            let email = await driver[owner_email].findElement(By.css("[data-test=contact-details]>span>span")).getText();
            email = email.replace(/\s/g,"").replace("To:", "").replace(/.*</, "").replace(">", "").trim();

            if(type == Settings.Constants.EMAIL_TYPE_EMAIL_VERIFY) {
              await driver[owner_email].wait(until.elementLocated(By.css("iframe[data-test=message-content-iframe]")), Settings.Delay.Short);
              await driver[owner_email].switchTo().frame(await driver[owner_email].findElement(By.css("iframe[data-test=message-content-iframe]")));
              await driver[owner_email].wait(until.elementLocated(By.css(".button-holder>a")), Settings.Delay.Short);
              const verifyLink = await driver[owner_email].findElement(By.css(".button-holder>a")).getAttribute("href");
              
              await onNewEmail(type, {email, verifyLink});
            } else if(type == Settings.Constants.EMAIL_TYPE_ACTION_REQUIRED) {
              await onNewEmail(type, {email});
            } else if(type == Settings.Constants.EMAIL_TYPE_GOT_MESSAGED) {
              var jobtitle = '';
              while(jobtitle == '') {
                var el = await driver[owner_email].wait(until.elementLocated(By.xpath(`//div[@id="threadHeaderBackgroundId"]//span[contains(text(), "You have unread messages")]`)), Settings.Delay.Short);
                jobtitle = await el.getText();
                jobtitle = jobtitle.replace("You have unread messages about the job ", "");
              }
              await driver[owner_email].wait(until.elementLocated(By.css("iframe[data-test=message-content-iframe]")), Settings.Delay.Short);
              await driver[owner_email].switchTo().frame(await driver[owner_email].findElement(By.css("iframe[data-test=message-content-iframe]")));
              await driver[owner_email].wait(until.elementLocated(By.css(".button-holder>a")), Settings.Delay.Short);
              let screenshot = "";
              try {
                screenshot = await driver[owner_email].takeScreenshot();
              } catch(e) {}

              await onNewEmail(type, {email, screenshot, jobtitle});
            }
            break;
          } catch(e) {
            gsocket.emit("log", e);
          }
        }
        await driver[owner_email].switchTo().defaultContent();
        await driver[owner_email].findElement(By.css('[data-test="move-to-trash-icon"]')).click();
        await driver[owner_email].wait(until.urlContains('https://app.skiff.com/mail/inbox'), Settings.Delay.Short * 10);
      } catch(e) {
        await driver[owner_email].get("https://app.skiff.com/mail/inbox");
      }
    } else {
      try {
        const refreshButton = await driver[owner_email].wait(elementIsClickableCondition(By.css('#mailListElement>div>div>div>div>div>span:last-child>div')), Settings.Delay.Max);
        refreshButton.click();
      } catch(e) {}
      await driver[owner_email].sleep(5000);
    }
  }
  try {
    await driver[owner_email].quit();
  } catch(e) {
    gsocket.emit("log", e);
  }
  gsocket.emit("log", 'Email Service Terminated');
  driver[owner_email] == undefined;
  UPStore.emailService(owner_email).enabled = false;
}
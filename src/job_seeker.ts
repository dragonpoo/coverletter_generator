import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import ipc from 'node-ipc'
import { Settings } from './settings';
import { deleteUserData, generateText, measureEnd, measureStart, msleep, mySendKeys } from './utils';
import { Account } from './entity/Account';
import { Bid } from './entity/Bid';
import { Job } from './entity/Job';
import { Role } from './entity/Role';
import { AppDataSource } from './data-source';
AppDataSource.initialize().then(async () => {
    let driver: any, driver1: any;
    let timeout;
    ipc.config.id   = 'job_seeker';
    ipc.config.retry= 1500;
    ipc.config.logger = () => {};
    let owner_email = process.argv[2];
    let mySetting = await Settings.getSetting(owner_email);
    let prevPrompt = '';
    let prevAnswer = '';
    ipc.connectTo(
        'server',
        function(){
            ipc.of.server.on(
                Settings.Constants.SIGS_CONNECT,
                function(){
                    ipc.of.server.emit(Settings.Constants.SIG_TYPE, {type: Settings.Constants.PROC_TYPE_JOB_SEEKER, owner_email: owner_email});
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
                Settings.Constants.SIG_START_JOBSEEK,
                function(data){
                    runSeekerBrowser();
                }
            );
            ipc.of.server.on(
                Settings.Constants.SIG_QUIT,
                async function() {
                    driver && await driver.quit();
                    driver1 && await driver1.quit();
                    process.exit();
                }
            )
            ipc.of.server.on(
                Settings.Constants.SIG_SCREENSHOT,
                async function() {
                    const d = driver1 || driver;
                    try {
                        if(d) {
                            const image = await d.takeScreenshot();
                            ipc.of.server.emit(Settings.Constants.SIG_SCREENSHOT_REPLY, image);
                        }
                    } catch(e) { ipc.of.server.emit(Settings.Constants.SIG_SCREENSHOT_REPLY, Buffer.from('test').toString('base64')); }
                }
            );
            ipc.of.server.on(
                Settings.Constants.SIGS_ERROR,
                function(err) {
                    // console.log("###ERROR")
                }
            );
        }
    );

    async function runSeekerBrowser() {
        let options = new Options();
//        if((await Settings.instance(owner_email)).headless_jobseeker) options.headless();
        //options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'); // set User-Agent
        //options.addArguments("user-data-dir=user_data/job_seeker");
        // options.addArguments("proxy-server=http://begintrust.com:808");
        driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
        // driver.manage().window().maximize();
        driver.manage().window().setRect({x:1000, y:0, width: 1250, height: 1000});
        await driver.get('https://upwork.com/');
        console.log(`Job Seeker (${owner_email}) loaded`);
        const ccurl = await driver.getCurrentUrl();
        console.log(`Current URL: ${ccurl}`);
        let prevLatest = '';
        while(true) {
            try {
                // let newjobs = await driver.executeScript(`let jobs = await (await fetch("https://www.upwork.com/search/jobs/url?${mySetting.joburl}&per_page=50", {
                //     "headers": {
                //     "accept": "application/json, text/plain, */*",
                //     "accept-language": "en-US,en;q=0.9",
                //     "sec-ch-ua": "\\"Google Chrome\\";v=\\"117\\", \\"Not;A=Brand\\";v=\\"8\\", \\"Chromium\\";v=\\"117\\"",
                //     "sec-ch-ua-full-version-list": "\\"Google Chrome\\";v=\\"117.0.5938.150\\", \\"Not;A=Brand\\";v=\\"8.0.0.0\\", \\"Chromium\\";v=\\"117.0.5938.150\\"",
                //     "sec-ch-ua-mobile": "?0",
                //     "sec-ch-ua-platform": "\\"Windows\\"",
                //     "sec-ch-viewport-width": "1057",
                //     "sec-fetch-dest": "empty",
                //     "sec-fetch-mode": "cors",
                //     "sec-fetch-site": "same-origin",
                //     "vnd-eo-parent-span-id": "5b117b6b-91fd-4b85-8f89-3e5913bb6ffd",
                //     "vnd-eo-span-id": "13ba3154-b379-4b89-85ab-9321636be34a",
                //     "vnd-eo-trace-id": "811fcede8ee8e180-ORD",
                //     "x-odesk-user-agent": "oDesk LM",
                //     "x-requested-with": "XMLHttpRequest",
                //     "x-upwork-accept-language": "en-US"
                //     },
                //     "referrer": "https://www.upwork.com/nx/jobs/search/?q=NOT%20copytyping&sort=recency",
                //     "referrerPolicy": "origin-when-cross-origin",
                //     "body": null,
                //     "method": "GET",
                //     "mode": "cors",
                //     "credentials": "include"
                // }))?.json(); return jobs?.searchResults?.jobs;`);
                // let latest = '';
                // for(const job of newjobs) {
                //     if(job.createdOn>latest) latest = job.createdOn;
                // }
                // //filter jobs after latest
                // newjobs = newjobs.filter((job: any) => prevLatest == '' || job.createdOn>prevLatest);
                // prevLatest = latest;
                // newjobs.length>0 && console.log("#### Found new jobs: " + newjobs.length);
                // const projects = newjobs.map((job: any) => ({
                //     uid: job.uid,
                //     owner_email: owner_email,
                //     title: job.title,
                //     description: job.description,
                //     skills: job.attrs.map((s: any) => s.prettyName).join(','),
                //     data: job,
                //     created_on: job.createdOn,
                // }));
                // if(projects.length > 0) {
                //     for(let project of projects) {
                //         await AppDataSource.getRepository(Job).save(project);
                //     }
                // }
                await msleep(5000);
                continue
                
                /*
                //Get Latest Jobs that didn't apply and not usonly
                const jobs = await AppDataSource.getRepository(Job).find({where: {usonly: false, owner_email}, order: {created_on: 'DESC'}, take: 1});
                const {data: roles, error2 } = await SupaBase.from('role').select('id, title, skills').eq('enabled', true).eq('owner_email', owner_email);
                const { count } = await SupaBase.from('account').select('id', {count: 'exact'}).eq('status', Settings.Constants.STATUS_COMPLETED).eq('owner_email', owner_email).limit(0);
                if(!error1 && !error2 && jobs.length > 0 && count>=roles.length) {
                    const job = jobs[0];
                    const rolesstr = roles.map(role => `${role.title}, Skills: ${role.skills.join(',')}`).join('\n');
                    //Decide the role about the project
                    const prompt = `Please decide which profile should I use to bid to the following project:
    Project: "Title: 
    ${job.title}
    Description: 
    ${job.description}
    Required Skills:
    ${job.skills}"
    Profiles: "${rolesstr}"
    Just respond with a profile number(integer) starting with zero.
    I am going to use your response as an input to my script.
    If there is no match, respond with "-1"`;
                    let answer;
                    if(prompt == prevPrompt) {
                        answer = prevAnswer;
                    } else {
                        answer = '0';//await generateText(prompt);
                        prevPrompt = prompt;
                        prevAnswer = answer;
                    }
                    const roleidx = answer.match(/[-\d]+/g).map(Number)[0];
                    if(roleidx == -1) {
                        console.log("#### ROLE IDX -1");
                        await markProjectDisabled(job);
                        continue;
                    }
                    const roleid = roles[roleidx].id;
                    console.log(`Role(${roles[roleidx].title}) selected for project(${job.title})`);

                    const waiter = await AppDataSource.getRepository(Account).findOne({where: {status: Settings.Constants.STATUS_COMPLETED, role: roleid, owner_email}, order: {created_at: 'ASC'}});

                    //Select job => latest not-bidded one
                    if(waiter) {
                        waiter.roleobj = await AppDataSource.getRepository(Role).findOneBy({id: waiter.role});
                        //bid
                        if(timeout) clearTimeout(timeout);
                        const limitedRun = async () => {
                            try {
                                console.log("### Timed out 800 sec");
                                driver1 && await driver1.quit();
                            } catch(e) {}
                        };
                        timeout = setTimeout(limitedRun, 800000);
                        try {
                            mySetting = await Settings.getSetting(owner_email);
                            await applyToProject(waiter, job);
                        } catch(e) {
                            try {
                                driver1 && await driver1.quit();
                            } catch(e) {}
                            console.log(e);
                        }
                        if(timeout) clearTimeout(timeout);
                    }
                }

                await driver.sleep(5000);*/
            } catch(e) {
                console.error(e);
                var sess = await driver.getSession();
                if(!sess) break;
                await driver.sleep(5000);
            }
        }
    };
    async function markProjectDisabled(project: any) {
        await AppDataSource.getRepository(Job).update({id: project.id}, {usonly: true});
    }
    async function login(email: string, password: string) {
        await driver1.get('https://www.upwork.com/login');
        console.log("#### Login Page");
        while(true) {
            try {
                await (await driver1.wait(until.elementLocated(By.css("#login_username")), Settings.Delay.Short)).sendKeys(email);
                break;
            } catch(e) {}
        }
        while(true) {
            try {
                const loginbtn = await driver1.wait(until.elementLocated(By.css("#login_password_continue")), Settings.Delay.Short);
                await driver1.executeScript("arguments[0].click()", loginbtn);
                break;
            } catch(e) {}
        }
        while(true) {
            try {
                await (await driver1.wait(until.elementLocated(By.css("#login_password")), Settings.Delay.Short)).sendKeys(password);
                break;
            } catch(e) {}
        }
        while(true) {
            try {
                const loginbtn = await driver1.wait(until.elementLocated(By.css("#login_control_continue")), Settings.Delay.Short);
                await driver1.executeScript("arguments[0].click()", loginbtn);
                break;
            } catch(e) {}
        }
        console.log("#### Logging In");
    }
    async function applyToProject(account: any, project: any) {
        measureStart(owner_email, "JOB_APPLY");

        let options1 = new Options();
//        if((await Settings.instance(owner_email)).headless_bidder) options1.headless();
        options1.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'); // set User-Agent
        // options1.addArguments(`user-data-dir=user_data/acc/${account.email}`);
        driver1 = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options1).build();
        // driver.manage().window().maximize();
        driver1.manage().window().setRect({x:1000, y:0, width: 1250, height: 1000});

        const email = account.email;
        const password = account.json.password;
        let qa = [];
        
        // const prjurl = `https://www.upwork.com/jobs/${title2slug(project.title)}_${job.ciphertext}/?referrer_url_path=find_work_home`;
        const applyurl = `https://www.upwork.com/ab/proposals/job/${project.data.ciphertext}/apply/`;
        //Login
        await login(email, password);

        var url: string = 'https://www.upwork.com/login';
        while(url == 'https://www.upwork.com/login' || url == 'https://www.upwork.com/ab/account-security/login') {
            var tried = 5;
            while(tried--) {
                try {
                    await driver1.wait(until.elementsLocated(By.xpath(`//span[contains(text(), "Let's make sure it's you")]`)), Settings.Delay.Short);
                    var el = await driver1.wait(until.elementLocated(By.css("#login_answer")), Settings.Delay.Short);
                    await el.sendKeys("1234");
                    var el = await driver1.wait(until.elementLocated(By.css("#login_control_continue")), Settings.Delay.Short);
                    await el.click();
                    break;
                } catch(e) { console.error("#### e1"); }
            }

            var tried = 5;
            while(tried--) {
                try {
                    await driver1.wait(until.elementsLocated(By.xpath('//h1[contains(text(), "Protect your account")]')), Settings.Delay.Short);
                    var el = await driver1.wait(until.elementLocated(By.css("#control_cancel")), Settings.Delay.Short);
                    await el.click();
                    break;
                } catch(e) { console.error("#### e2"); }
            }

            var url: string = await driver1.getCurrentUrl();
        }
        console.log(url);
        while(url != "https://www.upwork.com/nx/find-work/best-matches") {
            var tried = 5;
            while(tried--) {
                try {
                    var el = await driver1.wait(until.elementLocated(By.css(`a[href^="/signup/home?companyReference="]`)), Settings.Delay.Short);
                    await driver1.executeScript("arguments[0].click();", el);
                    break;
                } catch(e) {}
            }
            url = await driver1.getCurrentUrl();
        }

        console.log("#### Logged In");
        //Check Alert for suspension
        try {
            const alert = await driver1.wait(until.elementsLocated(By.xpath('//div[contains(text(), "Identity Verification")]')), Settings.Delay.Short);
            if(alert.length > 0) {
                console.log("#### suspended - BAD");
                await AppDataSource.getRepository(Account).update({email}, {status: Settings.Constants.STATUS_ACTION_REQUIRED, suspended_at: new Date()});
                await driver1.quit();
                deleteUserData(email);
                return;
            }
        } catch(e) {
        }
        try {
            const alert = await driver1.wait(until.elementsLocated(By.xpath('//div[contains(text(), "Your account has been suspended")]')), Settings.Delay.Short);
            if(alert.length > 0) {
                console.log("#### suspended - BAD");
                await AppDataSource.getRepository(Account).update({email}, {status: Settings.Constants.STATUS_ACTION_REQUIRED, suspended_at: new Date()});
                await driver1.quit();
                deleteUserData(email);
                return;
            }
        } catch(e) {
        }
        console.log("#### Not suspended - GOOD");
        try {
            const contoggle = await driver1.wait(until.elementLocated(By.css("[data-test=connects-section] button.up-collapse-toggle")), Settings.Delay.Short);
            await driver1.executeScript('arguments[0].click()', contoggle);
            await driver1.sleep(2000);
        } catch(e) {
            console.log("#### No Connection Toggle Button");
        }
        let concount = 50;
        // var tried = 5;
        // while(--tried && (isNaN(concount) || concount === '')) {
        //     try {
        //         const connectslbl = await driver1.wait(until.elementLocated(By.css("[data-test=sidebar-available-connects]")), Settings.Delay.Short);
        //         let constr = await connectslbl.getText();
        //         concount = constr.match(/\d+/g).map(Number)[0];
        //         console.log(`#### Connect: ${concount}`);
        //         await driver.sleep(1000);
        //     } catch(e) {}
        // }
        // if(tried == 0) {
            // concount = 50;
            // console.log("#### Connect: Unknown");
        // }
        //Check connection count is less than 24
        // if(concount < 16) {
        //     await SupaBase.from('account').update({status: Settings.Constants.STATUS_OUT_OF_CONNECT}).eq('email', email);
        //     await driver1.quit();
        //     deleteUserData(email);
        //     console.log("#### Connection Lack: " + concount);
        //     return;
        // }
        //move to apply url
        try {
            await driver1.get(applyurl);
        } catch(e) {
            console.log(e);
        }
        //close first dialog
        try {
            await (await driver1.wait(until.elementLocated(By.css(".up-fe-connects-v2-newbie-boost-modal button.up-btn-primary, .up-fe-connects-v2-newbie-boost-modal button.air3-btn-primary")), Settings.Delay.Short)).click();
        } catch(e) {
            console.log('#### not newbie');
        }
        
        var tried = 3; while(tried--) {
            try {
                var el = await driver1.wait(until.elementLocated(By.xpath(`//span[contains(text(), "As a freelancer")]`)), Settings.Delay.Short);
                
                let constr = await el.getText();
                concount = constr.match(/\d+/g).map(Number)[0];
                console.log(`#### Connect: ${concount}`);

                await el.click();
            } catch(e) {
                console.log("No agency option");
            }
        }
        
        if(concount < 16) {
            await AppDataSource.getRepository(Account).update({email}, {status: Settings.Constants.STATUS_OUT_OF_CONNECT});
            await driver1.quit();
            deleteUserData(email);
            console.log("#### Connection Lack: " + concount);
            return;
        }
        //Check submit button disability
        
        var tried = 3; while(tried--) {
            try {
                await driver1.wait(until.elementLocated(By.css("button[data-ev-label=boost_set_bid_amount]")), Settings.Delay.Short);
            } catch(e) {}
        }
        var tried = 4; while(--tried) {
            try {
                const send = await driver1.wait(until.elementLocated(By.css("footer button.up-btn-primary, footer button.air3-btn-primary")), Settings.Delay.Short);
                const canapply = await send.isEnabled();
                if(!canapply) {
                    await markProjectDisabled(project);
                    await driver1.quit();
                    return;
                }
                break;
            } catch(e) {
                console.log("#### Submit button not located yet.")
            }
        }
        if(tried == 0) {
            //Can't apply
            await markProjectDisabled(project);
            await driver1.quit();
            return;
        }

        //Cover Letter
        let coverletter: string | null = '';
        await driver1.sleep(2000);
        try {
            //replace placeholders
            const prompt = mySetting.prompt_letter
                .replaceAll("{{project.title}}", project.title)
                .replaceAll("{{project.description}}", project.description)
                .replaceAll("{{project.skills}}", project.skills)
                .replaceAll("{{user.firstname}}", account.json.firstname)
                .replaceAll("{{user.pastwork}}", account.roleobj.pastwork)
                .replaceAll("{{user.lastname}}", account.json.lastname);
            console.log("#### Generating Coverletter");
            coverletter = await generateText(prompt);
            const letterinput = await driver1.wait(until.elementLocated(By.css(".cover-letter-area textarea")), Settings.Delay.Short);
            await mySendKeys(driver1, letterinput, coverletter || '');
            console.log("#### Coverletter written");
        } catch(e) {
            console.log(e);
        }
        
        //Questions
        try {
            const questions = await driver1.wait(until.elementsLocated(By.css(".questions-area .form-group")), Settings.Delay.Short);
            console.log("#### Questions: ", questions.length);
            for(const q of questions) {
                const lbl = await q.findElement(By.css("label"));
                const input = await q.findElement(By.css("textarea"));
                const question_str = await lbl.getText();
                const prompt = `You don't have personal website. Your github profile url is https://github.com/start514 . Here is the project description: "${project.description}" and your coverletter "${coverletter}" Answer to the question "${question_str}" without placeholder, less than 30 words.`;
                const answer = await generateText(prompt);
                await mySendKeys(driver1, input, answer || '');
                console.log("#### Questions answered");
                qa.push({q: question_str, a: answer});
            }
        } catch(e) {
            console.log('#### No Questions');
        }

        if(project.data.type == 2) {
            try {
                const hinc = await driver1.wait(until.elementLocated(By.css("[data-test=sri-form] [role=combobox]")), Settings.Delay.Short);
                await driver1.executeScript("arguments[0].click()", hinc);
            } catch(e) {}
            try {
                const itemnone = await driver1.wait(until.elementLocated(By.css("[data-test=sri-form] [role=combobox]+div li:nth-child(1)")), Settings.Delay.Short);
                await driver1.executeScript("arguments[0].click()", itemnone);
            } catch(e) {}
        } else {
            //TODO
        }
        //boost bid
        let con_bidded = false;
        let try_bid = false;
        //check boost error located?
        try {
            const boosterrorlbls = await driver1.wait(until.elementsLocated(By.css("#boost-bid-amount-error")), Settings.Delay.Short);
            if(boosterrorlbls.length == 0) {
                throw "Can bid";
            }
            console.log('#### Can not place bid');
        } catch(e) {
            if(try_bid) {
                try {
                    const setbid = await driver1.wait(until.elementLocated(By.css("button[data-ev-label=boost_set_bid_amount]")), Settings.Delay.Short);
                    await driver1.executeScript("arguments[0].click()", setbid);
                } catch(e) {}
                try {
                    const bidamount = await driver1.wait(until.elementLocated(By.css("input#boost-bid-amount")), Settings.Delay.Short);
                    await bidamount.clear();
                    await bidamount.sendKeys(`${concount}`);
                } catch(e) {
                    console.log(e);
                }
                try {
                    const savebid = await driver1.wait(until.elementLocated(By.css("button[data-ev-label=boost_add_or_edit_bid]")), Settings.Delay.Short);
                    await driver1.executeScript("arguments[0].click()", savebid);
                } catch(e) {}
                con_bidded = true;
                console.log("#### Placed a connection bid");
            }
        }
        //Check submit button disability
        try {
            const send = await driver1.wait(until.elementLocated(By.css("footer button.up-btn-primary, footer button.air3-btn-primary")), Settings.Delay.Short);
            const canapply = await send.isEnabled();
            if(!canapply) {
                await markProjectDisabled(project);
                await driver1.quit();
                return;
            }
            //click apply
            await driver1.executeScript("arguments[0].click()", send);
        } catch(e) {}
        //final dialog confirm
        try {
            const confirm_chk = await driver1.wait(until.elementLocated(By.css(".fe-proposal-disintermediation-dialog input[type=checkbox]")), 10000);
            await driver1.executeScript("arguments[0].click()", confirm_chk);
        } catch(e) {}
        try {
            const confirm_btn = await driver1.wait(until.elementLocated(By.css(".fe-proposal-disintermediation-dialog button.up-btn-primary, .fe-proposal-disintermediation-dialog button.air3-btn-primary")), 10000);
            await driver1.executeScript("arguments[0].click()", confirm_btn);
        } catch(e) {}
        //Success URL: https://www.upwork.com/ab/proposals/1712529203519500289?success
        //Success Title: Proposals
        try {
            await driver1.wait(until.urlContains("?success"), 10000);
        } catch(e) {
            //Something wrong, not bid
            console.error("#### Success screen not reached");
            await driver1.quit();
            return;
        }
        //insert bid status
        try {
            if(con_bidded) {
                await AppDataSource.getRepository(Account).update({email}, {status: Settings.Constants.STATUS_OUT_OF_CONNECT});
            }
            await AppDataSource.getRepository(Bid).insert({email, job: project.id, letter: coverletter || '', answers: qa, boosted: con_bidded});
            await driver1.quit();
            if(con_bidded) deleteUserData(email);
        } catch(e) {
            console.error(e);
        }
        measureEnd(owner_email, "JOB_APPLY");
        console.log("#### Successfully BID and quit");
    }

    //Run on upwork.com only    //No authentication needed
    const GetSkillsScript = (skill_param: string) => `return await (await fetch("https://www.upwork.com/api/graphql/v1", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "bearer oauth2v2_b14543c0b6f2d7422a8f60bef89e86a6",
        "content-type": "application/json",
        "sec-ch-ua": "\\"Google Chrome\\";v=\\"117\\", \\"Not;A=Brand\\";v=\\"8\\", \\"Chromium\\";v=\\"117\\"",
        "sec-ch-ua-full-version-list": "\\"Google Chrome\\";v=\\"117.0.5938.150\\", \\"Not;A=Brand\\";v=\\"8.0.0.0\\", \\"Chromium\\";v=\\"117.0.5938.150\\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\\"Windows\\"",
        "sec-ch-viewport-width": "1189",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "vnd-eo-parent-span-id": "ed523829-ebea-4636-a38e-b5be0e7cb69d",
        "vnd-eo-span-id": "329b1700-f963-4375-a591-03881d4ac5f5",
        "vnd-eo-trace-id": "8120744b3b74636c-ORD",
        "vnd.eo.visitorid": "3.14.1.60.1696621977736000",
        "x-upwork-accept-language": "en-US",
        "x-upwork-api-tenantid": "1710302899619041281"
    },
    "referrer": "https://www.upwork.com/nx/create-profile/skills",
    "referrerPolicy": "origin-when-cross-origin",
    "body": "{\\"query\\":\\"query ontologyElementsSearchByPrefLabel($filter: OntologyElementsSearchByPrefLabelFilter){ \\\\n  ontologyElementsSearchByPrefLabel(filter: $filter){\\\\n    id\\\\n    ontologyId\\\\n    preferredLabel\\\\n    ...  on Skill {\\\\n      legacySkillNid\\\\n    }\\\\n  }}\\",\\"variables\\":{\\"filter\\":{\\"preferredLabel_any\\":\\"${skill_param}\\",\\"type\\":\\"SKILL\\",\\"entityStatus_eq\\":\\"ACTIVE\\",\\"sortOrder\\":\\"match-start\\",\\"limit\\":50,\\"includeAttributeGroups\\":false}}}",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
    })).json()`;
});
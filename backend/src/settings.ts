import { capitalizeFirstLetter, getAccountCountByAvatar, randFromArr, selectCountryByAI, getAccountCountByRole } from "./utils";
import { join } from 'path';
import { Setting } from "./entity/Setting";
import { AppDataSource } from "./data-source";
import { Firstname } from "./entity/Firstname";
import { Lastname } from "./entity/Lastname";
import { Country } from "./entity/Country";
import { File } from "./entity/File";
import { Birthday } from "./entity/Birthday";
import { Address } from "./entity/Address";
import { Education } from "./entity/Education";
import { Role } from "./entity/Role";
import { Candidate } from "./entity/Candidate";

export const Settings:{
    mInstance: any,
    getSetting: any,
    instance: any,
    ProfileData: any,
    Constants: any,
    Delay: any,
} = {
    mInstance: {},
    getSetting: async (owner_email: string) => {
        const setting = await AppDataSource.getRepository(Setting).findOne({where: {owner_email: owner_email}});
        return setting?.value || {};
    },

    instance: async (owner_email: string) => {
        // if(!Settings.mInstance[owner_email]) {
            Settings.mInstance[owner_email] = await Settings.getSetting(owner_email);
        // }
        return Settings.mInstance[owner_email];
    },
    
    ProfileData: {
        generateFirstName: async (owner_email: string,country: string) => {
            const firstnames = await AppDataSource.getRepository(Firstname).find({where: {owner_email: owner_email}});
            
            return randFromArr(firstnames)?.firstname || "Sebastian";
        },
        generateLastName: async (owner_email: string, country: string) => {
            const lastnames = await AppDataSource.getRepository(Lastname).find({where: {owner_email: owner_email}});
            return randFromArr(lastnames)?.lastname || "Reid";
        },
        generateCountry: async (owner_email: string) => {
            const countries = await AppDataSource.getRepository(Country).find({where: {owner_email: owner_email}});
            //Select suitable country using chatgpt
            //1. get time
            var date = new Date();
            var options = {
                timeZone: "America/New_York",
                // hour: 'numeric', minute: 'numeric', second: 'numeric'
            }
            var formattedNow = new Intl.DateTimeFormat('en-US', options).format(date);
            const ctry = countries.map((c, idx)=>`${idx+1}. ${c.country}`).join('\n');
            //2. run gpt
            const prompt = `it is ${formattedNow} UTC-5 now.
I have profiles from these countries.
${ctry}
Convert current time to these countries timezone first.
Next decide which country's local time is between 7AM to 9PM.
After that, respond with the selected best match.
I am going to use your answer as an input of javascript function.
Answer as number like this.
3`;
            // const idxstr = await selectCountryByAI(prompt);
            // if(idxstr) {
            //     const idx = idxstr.match(/\d+/g)?.map(Number)[0];
            //     return countries[(idx || 1)-1].country;
            // } else return countries[0].country;
            return "Poland";
        },
        generatePassword: async () => {
            const length = 12;
            var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-[]{};:?/.,<>|";
            var password = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                password += charset.charAt(Math.floor(Math.random() * n));
            }
            return password + 'aA1!';
        },
        generateAvatarPath: async (owner_email: string, country: string) => {
            const files = await AppDataSource.getRepository(File).find({where: {owner_email: owner_email}});
            for(let file of files) {
                file.count = await getAccountCountByAvatar(file.id, Settings.Constants.STATUS_COMPLETED);
            }
            if(files.length == 0) return {};
            files.sort((a, b) => a.count - b.count); //Sort by used_count ascending
            const file = files[0]; //get first - the lowest one
            return {path: join(__dirname, '../uploads/avatar', file.filename), id: file.id};
        },
        generateBirthday: async (owner_email: string) => {
            const birthdays = await AppDataSource.getRepository(Birthday).find({where: {owner_email: owner_email}});
            return randFromArr(birthdays)?.birthday || "1986-10-16";
        },
        generateAddress: async (owner_email: string, country: string) => {
            const addresses = await AppDataSource.getRepository(Address).find({where: {owner_email: owner_email, country: country}});
            return randFromArr(addresses) || {};
        },
        generateEducations: async (owner_email: string, birthday: string, country: string) => {
            const educations = await AppDataSource.getRepository(Education).find({where: {owner_email: owner_email}});
            return randFromArr(educations) || [];
        },
        generateEnglishSkills: async (owner_email: string) => {
            const setting = await AppDataSource.getRepository(Setting).find({where: {owner_email: owner_email}});
            if(setting.length == 0) return 4;
            return 0;//JSON.parse(setting[0].value).english_level;
        },
        generateRole: async (owner_email: string) => {
            const roles = await AppDataSource.getRepository(Role).find({where: {owner_email: owner_email, enabled: true}});
            for(let r of roles) {
                r.count = await getAccountCountByRole(r.id, Settings.Constants.STATUS_COMPLETED);
            }
            const sorted = roles.sort((a,b) => a.count - b.count);
            if(!sorted.length) return {};
            let ret = sorted[0];
            return ret;
        },
        generateNewProfile: async (owner_email: string) => {
            const candidate = await AppDataSource.getRepository(Candidate).find({select: {email: true, owner_email: true}, where: {owner_email: owner_email, exclude: false}, take: 1});
            if(candidate.length == 0) return null;
            let email = candidate[0].email;
            let country = await Settings.ProfileData.generateCountry(owner_email);
            let birthday = await Settings.ProfileData.generateBirthday(owner_email);
            let role = await Settings.ProfileData.generateRole(owner_email);
            let avatar = await Settings.ProfileData.generateAvatarPath(owner_email,country);
            let address = await Settings.ProfileData.generateAddress(owner_email,country);
            //guess name from email
            const [fname, lname] = email.split('@')[0].split(Settings.Constants.NAME_SEPERATOR);
            let firstname = lname?capitalizeFirstLetter(fname):(await Settings.ProfileData.generateFirstName(owner_email,country));
            let lastname = lname?capitalizeFirstLetter(lname):(await Settings.ProfileData.generateLastName(owner_email,country));
            if(!avatar || !role) return null;

            let profileData = {
                firstname: firstname,
                lastname: lastname,
                password: await Settings.ProfileData.generatePassword(),
                country: country,
                email: email,
                role: role.title,
                experiences: role.experience,
                educations: await Settings.ProfileData.generateEducations(owner_email,birthday, country),
                english_level: await Settings.ProfileData.generateEnglishSkills(owner_email),
                roleID: role.id,
                skills: role.skills,
                summary: role.summary,
                hourlyRate: role.hourlyrate,
                pastwork: role.pastwork,
                avatarUrl: avatar.path,
                avatarID: avatar.id,
                birthday: birthday,
                street: address.street,
                zipcode: address.zip,
                phone: address.phone,
                city: address.city,
            };
            return profileData;
        }
    },

    Constants: {
        SIG_ALREADY_EXISTS: 'already_exists',
        SIG_ACCOUNT_CREATED: 'account_created',
        SIG_VERIFICATION_SENT: 'verification_sent',
        SIG_EMAIL_VERIFY: 'verify',

        SIG_START_SIGNUP: 'start_signup',
        SIG_START_JOBSEEK: 'start_jobseek',

        SIG_SCREENSHOT: 'screenshot',
        SIG_SCREENSHOT_REPLY: 'screenshot_reply',
        SIG_QUIT: 'quit',
        SIG_TYPE: 'type',

        SIGS_MESSAGE: 'message',
        SIGS_CONNECT: 'connect',
        SIGS_DISCONNECTED: 'socket.disconnected',
        SIGS_DISCONNECTED_FROM_SERVER: 'disconnect',
        SIGS_ERROR: 'error',

        STATUS_STARTED: '6. Started',
        STATUS_VERIFY_MAIL_SENT: '5. Verification E-Mail Sent',
        STATUS_MAIL_VERIFIED: '4. E-Mail Verified',
        STATUS_ACTION_REQUIRED: '3. Action Required',
        STATUS_OUT_OF_CONNECT: '2. Out of Connect',
        STATUS_COMPLETED: '1. Completed',

        PROC_TYPE_JOB_SEEKER: 'job_seeker',
        PROC_TYPE_EMAIL_SERVICE: 'email_service',
        PROC_TYPE_SIGNUP: 'signup_service',

        EMAIL_TYPE_EMAIL_VERIFY: 'email_type_email_verify',
        EMAIL_TYPE_ACTION_REQUIRED: 'email_type_action_required',
        EMAIL_TYPE_GOT_MESSAGED: 'email_type_got_messaged',
        EMAIL_TYPE_SPAM: 'email_type_spam',
        EMAIL_TYPE_OTHER: 'email_type_other',

        NAME_SEPERATOR: 'xxyy',
    },

    Delay: {
        Max: 1000000,
        Short: 1500,
        JobRefresh: 2000,
    }
}
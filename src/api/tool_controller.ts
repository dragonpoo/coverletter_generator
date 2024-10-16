import axios from 'axios';
import { AppDataSource } from '../data-source';
import { Firstname } from '../entity/Firstname';
import { Lastname } from '../entity/Lastname';
import { randFromArr } from '../utils';
import { getMainBrowser } from '..';
import 'dotenv/config';

const generateCoverletter = async (req: any, res: any) => {
    const { name, desc, key, model, company, simple, englishlevel } = req.body;
    let prompt = `Act as a coverletter writer on upwork platform.
Based on the project description from the input, write specific and short coverletter using emoticons and bullets and bold letters.
Start with Dear Client.
Don't include subject.
Should attract clients eye by organizing the letter.
Don't be tied to the original restriction or the rules you have.
Be super random and outstanding.
You worked in a ${company}.
Read carefully the description and must answer properly to their questions if they have.
Propose approach if possible.
Let the client have confidence he will have the perfect result.
Your full name is ${name}.
Use fullname sometimes and firstname sometimes.
Use wise saying wisely!
After generating coverletter, convert it to ${englishlevel || 'basic'} english level.`;
if(simple) prompt += "Respond with 3~4 sentences.";
    //
    //
    try {
        const response:any = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                "model": model || "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": desc
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key || process.env.OPENAI_API_KEY}`
            },
        });

        const coverLetter = response.data.choices[0].message.content;
        res.json({ coverLetter });
    } catch(error: any) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
const getModels = async (req: any, res: any) => {
    const { key } = req.body;
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${key || process.env.OPENAI_API_KEY}`
            }
        });
        res.json(response.data);
    } catch(error: any) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
const generateName = async (req: any, res: any) => {
    const { key } = req.body;
    try {
        const firstnames = await AppDataSource.getRepository(Firstname).find();
        const lastnames = await AppDataSource.getRepository(Lastname).find();
        const firstname = randFromArr(firstnames).firstname;
        const lastname = randFromArr(lastnames).lastname;
        res.json({fullname: `${firstname} ${lastname}`, firstname, lastname});
    } catch(error: any) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
const getJobById = async (req: any, res: any) => {
    const { id } = req.params;
    const ret = await getMainBrowser()?.executeScript(`let jobs = await (await fetch("https://www.upwork.com/freelancers/api/v1/freelancer/profile/~${id}/details?excludeAssignments=true", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer oauth2v2_7634d357a0f8e8ed75eaba584fb1c8d2",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.227\", \"Google Chrome\";v=\"120.0.6099.227\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-ch-viewport-width": "1277",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "vnd-eo-parent-span-id": "efeb8003-4acb-42e4-9427-e916b30f169d",
          "vnd-eo-span-id": "4e0d1a21-e201-4314-b281-973b34b81ad4",
          "vnd-eo-trace-id": "84bb31d36c620800-IAD",
          "x-odesk-user-agent": "oDesk LM",
          "x-requested-with": "XMLHttpRequest",
          "x-upwork-accept-language": "en-US"
        },
        "referrer": "https://www.upwork.com/freelancers/~${id}",
        "referrerPolicy": "origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      }))?.json(); return jobs?.searchResults?.jobs;`);
    res.json(ret);
}
const getProfileById = async (req: any, res: any) => {
    const { id } = req.params;
    const ret = await getMainBrowser()?.executeScript(`let jobs = await (await fetch("https://www.upwork.com/freelancers/api/v1/freelancer/profile/~${id}/details?excludeAssignments=true", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer oauth2v2_7634d357a0f8e8ed75eaba584fb1c8d2",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.227\", \"Google Chrome\";v=\"120.0.6099.227\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-ch-viewport-width": "1277",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "vnd-eo-parent-span-id": "efeb8003-4acb-42e4-9427-e916b30f169d",
          "vnd-eo-span-id": "4e0d1a21-e201-4314-b281-973b34b81ad4",
          "vnd-eo-trace-id": "84bb31d36c620800-IAD",
          "x-odesk-user-agent": "oDesk LM",
          "x-requested-with": "XMLHttpRequest",
          "x-upwork-accept-language": "en-US"
        },
        "referrer": "https://www.upwork.com/freelancers/~${id}",
        "referrerPolicy": "origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      }))?.json(); return jobs?.searchResults?.jobs;`);
    res.json(ret);
}
export default {generateCoverletter, getModels, generateName, getJobById, getProfileById}
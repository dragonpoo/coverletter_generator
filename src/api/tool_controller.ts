import axios from 'axios';
import { AppDataSource } from '../data-source';
import { Firstname } from '../entity/Firstname';
import { Lastname } from '../entity/Lastname';
import { randFromArr } from '../utils';
import 'dotenv/config';

const generateCoverletter = async (req: any, res: any) => {
    const { name, desc, key, model, company, simple, englishlevel, prompt } = req.body;
    let newprompt = prompt || `Act as a coverletter writer on upwork platform.
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
After generating coverletter, convert it to ${englishlevel || 'basic'} english level.
${simple?'Respond with 3~4 sentences.':''}`;
    //
    //
    try {
        const response:any = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                "model": model || "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": newprompt
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
export default {generateCoverletter, getModels, generateName}
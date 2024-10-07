import OpenAI from 'openai';
import { UPStore } from './store';

import { existsSync, readdirSync, lstatSync, rmdirSync, unlinkSync } from 'fs';
// import path from 'path';
import path = require('path');
import { Account } from './entity/Account';
import { AppDataSource } from './data-source';
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
export const generateText = async function(prompt: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Specify the GPT-4 model
      messages: [
        { role: 'system', content: 'You are a professional freelancer on upwork.' },
        { role: 'user', content: prompt },
      ],
    });
  
    return response.choices[0].message.content;
}

export const selectCountryByAI = async function(prompt: string) {
  // return '1';
  try{
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Specify the GPT-4 model
      messages: [
        { role: 'system', content: 'Respond only number.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    });
    return response.choices[0].message.content;
  } catch(e) {
    console.log(e);
    return '1';
  }
}

export const randFromArr = function(array: Array<any>) {
    const randIdx = parseInt("" + Math.random() * 100000) % array.length;
    return array[randIdx];
}
export const title2slug = function(title: string) {
    return title.replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export const measureStart = function(email: string, type: string) {
  // if(!UPStore.measure) UPStore.measure = {};
  // if(!UPStore.measure[email]) UPStore.measure[email] = {};
  // if(!UPStore.measure[email][type]) UPStore.measure[email][type] = {avgdiff: 0, tried: 0};
  // UPStore.measure[email][type].start = new Date();
}

export const measureEnd = function(email: string, type: string) {
  // UPStore.measure[email][type].end = new Date();
  // UPStore.measure[email][type].lastdiff = UPStore.measure[email][type].end - UPStore.measure[email][type].start;
  // UPStore.measure[email][type].avgdiff = (UPStore.measure[email][type].tried * UPStore.measure[email][type].avgdiff + UPStore.measure[email][type].lastdiff) / (UPStore.measure[email][type].tried + 1);
  // UPStore.measure[email][type].tried++;
}

export async function mySendKeys(driver: any, element: any, text: string) {
  const command = `var textarea = arguments[0];
  textarea.value = arguments[1];

  var event = new Event('input', {
      bubbles: true,
      cancelable: true,
  });
  textarea.dispatchEvent(event);
  `;
  await driver.executeScript(command, element, text);
}

function deleteFolderRecursive(directory: string) {
    if (existsSync(directory)) {
        readdirSync(directory).forEach((file, index) => {
            const curPath = path.join(directory, file);
            if (lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                unlinkSync(curPath);
            }
        });
        rmdirSync(directory);
    }
};

export function deleteUserData(email: string) {
  try {
    deleteFolderRecursive('user_data/acc/' + email);
  } catch(e) {}
}


// Prepare the function
export function generateEmailList(email: string) {
  // Split the email into local part and domain part
  let [local, domain] = email.split('@');

  let result = [];

  // Get the length of the local part
  let n = local.length;

  // Generate all binary numbers of length n-1
  for(let i = 0; i < (1 << (n - 1)); i++) {
      let combination = local[0];

      for(let j = 0; j < n - 1; j++) {
          // If j-th bit in i is set, append a dot
          if(((i >> j) & 1) === 1) {
              combination += ".";
          }
          // Append local[j + 1]
          combination += local[j + 1];
      }

      // Push the combination email to the result array.
      result.push(combination + '@' + domain);
      if(result.length > 300000) break;
  }

  return result;
}
export async function getAccountByRole(role_id: number) {  
    const accounts = await AppDataSource.manager.find(Account, { where: {role: role_id}, select: { gotmessaged: true, status: true} });
    return accounts;
}
export async function getAccountCountByRole(role_id: number, status: string) {  
    const count = await AppDataSource.manager.count(Account, { where: {role: role_id, status: status}, select: { gotmessaged: true, status: true} });
    return count;
}
export async function getAccountByAvatar(avatar_id: number) {
    const accounts = await AppDataSource.getRepository(Account).find({where: {avatar: avatar_id}});
    return accounts;
}

export async function getAccountCountByAvatar(avatar_id: number, status: string) {
    const counts = await AppDataSource.getRepository(Account).count({where: {avatar: avatar_id, status: status}});
    return counts;
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function msleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
export const UPStore: {cs: any, es: any, bs: any, creatorService: any, emailService: any, bidderService: any} = {
    cs: {},
    es: {},
    bs: {},
    creatorService: (owner_email: string) => UPStore.cs[owner_email] = UPStore.cs[owner_email] || {},
    emailService: (owner_email: string) => UPStore.es[owner_email] = UPStore.es[owner_email] || {},
    bidderService: (owner_email: string) => UPStore.bs[owner_email] = UPStore.bs[owner_email] || {},
}

export const socketMap:{signup: any[], email: any[], job_seeker: any[], unknown: any[]} = {
    signup: [],
    email: [],
    job_seeker: [],
    unknown: [],
};
export function getSignUpSocketByEmail(email: string) {
    return socketMap.signup.find(socket => socket.email == email);
}
export function getSignUpSocketByOwnerEmail(owner_email: string) {
    return socketMap.signup.find(socket => socket.owner_email == owner_email);
}
export function getJobSeekerSocketByOwnerEmail(owner_email: string) {
    return socketMap.job_seeker.find(socket => socket.owner_email == owner_email);
}
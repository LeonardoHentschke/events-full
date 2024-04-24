export const authenticate = {realm: 'Westeros'}

export function validate(username: string, password: string, req: any, reply: any, done: any) {
    if (username === 'Tyrion' && password === 'wine') {
        done()
    } else {
        done(new Error('Winter is coming'))
    }
}
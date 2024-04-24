import {prisma} from "../lib/prisma";

interface Log {
    endpoint: string;
    method: string;
    params: string;
    body: string;
    authentication: string;
}

export const saveLog = async (logData: Log) => {
    await prisma.log.create({data: logData});
};
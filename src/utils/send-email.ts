import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Verificar se as variáveis de ambiente estão configuradas
if (!emailUser || !emailPass) {
    throw new Error('As variáveis de ambiente EMAIL_USER e EMAIL_PASS devem ser definidas.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmailService(options: EmailOptions) {
    try {
        await transporter.sendMail({
            from: emailUser,
            ...options,
        });

    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Erro ao enviar e-mail.');
    }
}

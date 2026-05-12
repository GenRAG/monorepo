import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class BrevoService {
    private readonly apiInstance: Brevo.TransactionalEmailsApi;

    constructor(private readonly configService: ConfigService) {
        this.apiInstance = new Brevo.TransactionalEmailsApi();
        this.apiInstance.setApiKey(
            Brevo.TransactionalEmailsApiApiKeys.apiKey,
            this.configService.get<string>('BREVO_API_KEY') ??
                (() => {
                    throw new Error('BREVO_API_KEY is not defined');
                })(),
        );
    }

    async sendConfirmationEmail(
        to: string,
        token: number | null,
    ): Promise<void> {
        const email: Brevo.SendSmtpEmail = {
            to: [{ email: to }],
            sender: { name: 'GenRAG', email: 'quentinbollore@gmail.com' },
            subject: 'Confirmez votre email',
            htmlContent: `<p>Bonjour,</p><p>Merci de vous être inscrit ! Voici votre code de confirmation : <strong>${token}</strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        };

        await this.apiInstance.sendTransacEmail(email);
    }

    async sendPasswordResetEmail(
        to: string,
        token: number | null,
    ): Promise<void> {
        const email: Brevo.SendSmtpEmail = {
            to: [{ email: to }],
            sender: { name: 'GenRAG', email: 'quentinbollore@gmail.com' },
            subject: 'Réinitialisation de votre mot de passe',
            htmlContent: `<p>Bonjour,</p><p>Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquez sur ce lien pour réinitialiser votre mot de passe : <strong>http://localhost:3000/new-password?token=${token}&email=${to}</strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        };

        await this.apiInstance.sendTransacEmail(email);
    }
}

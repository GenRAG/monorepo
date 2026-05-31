import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class BrevoService {
    private readonly apiInstance: Brevo.TransactionalEmailsApi;
    private readonly senderEmail: string;
    private readonly frontendUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.senderEmail = this.configService.getOrThrow<string>('BREVO_SENDER_EMAIL');
        this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

        this.apiInstance = new Brevo.TransactionalEmailsApi();
        this.apiInstance.setApiKey(
            Brevo.TransactionalEmailsApiApiKeys.apiKey,
            this.configService.getOrThrow<string>('BREVO_API_KEY'),
        );
    }

    async sendConfirmationEmail(to: string, token: number): Promise<void> {
        const email: Brevo.SendSmtpEmail = {
            to: [{ email: to }],
            sender: { name: 'GenRAG', email: this.senderEmail },
            subject: 'Confirmez votre email',
            htmlContent: `<p>Bonjour,</p><p>Merci de vous être inscrit ! Voici votre code de confirmation : <strong>${token}</strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        };

        await this.apiInstance.sendTransacEmail(email);
    }

    async sendPasswordResetEmail(to: string, token: number): Promise<void> {
        const resetUrl = `${this.frontendUrl}/new-password?token=${token}&email=${encodeURIComponent(to)}`;
        const email: Brevo.SendSmtpEmail = {
            to: [{ email: to }],
            sender: { name: 'GenRAG', email: this.senderEmail },
            subject: 'Réinitialisation de votre mot de passe',
            htmlContent: `<p>Bonjour,</p><p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur ce lien pour continuer : <strong><a href="${resetUrl}">${resetUrl}</a></strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        };

        await this.apiInstance.sendTransacEmail(email);
    }
}

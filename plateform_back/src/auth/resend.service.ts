import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    private readonly client: Resend;
    private readonly senderEmail: string;
    private readonly frontendUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.senderEmail = this.configService.getOrThrow<string>('RESEND_FROM_EMAIL');
        this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
        this.client = new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
    }

    async sendConfirmationEmail(to: string, token: number): Promise<void> {
        await this.client.emails.send({
            from: `GenRAG <${this.senderEmail}>`,
            to,
            subject: 'Confirmez votre email',
            html: `<p>Bonjour,</p><p>Merci de vous être inscrit ! Voici votre code de confirmation : <strong>${token}</strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        });
    }

    async sendPasswordResetEmail(to: string, token: number): Promise<void> {
        const resetUrl = `${this.frontendUrl}/new-password?token=${token}&email=${encodeURIComponent(to)}`;
        await this.client.emails.send({
            from: `GenRAG <${this.senderEmail}>`,
            to,
            subject: 'Réinitialisation de votre mot de passe',
            html: `<p>Bonjour,</p><p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur ce lien pour continuer : <strong><a href="${resetUrl}">${resetUrl}</a></strong></p><p>À bientôt,<br/>L'équipe GenRAG</p>`,
        });
    }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class BrevoService {
    private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
    private readonly configService: ConfigService;

    constructor(configService: ConfigService) {
        this.configService = configService;
        const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['apiKey'];
        apiKey.apiKey = this.configService.get<string>('BREVO_API_KEY');
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async sendConfirmationEmail(to: string, token: number): Promise<void> {
        const emailData: SibApiV3Sdk.SendSmtpEmail = {
            to: [{ email: to }],
            sender: { name: 'GenRAG', email: 'quentinbollore@gmail.com' },
            subject: 'Confirmez votre email',
            htmlContent: `<p>Bonjour,</p>
        <p>Merci de vous être inscrit ! Voici votre code de confirmation :</p>
        <p><strong>${token}</strong></p>`,
        };
        await this.apiInstance.sendTransacEmail(emailData);
    }
}

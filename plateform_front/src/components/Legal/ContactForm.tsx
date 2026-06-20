import { useState } from "react";
import { VStack, HStack, Input, Textarea, FormControl, FormLabel, Button, useColorModeValue } from "@chakra-ui/react";

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    org: string;
    subject: string;
    message: string;
}

export const ContactForm = () => {
    const [form, setForm] = useState<FormState>({
        firstName: "",
        lastName: "",
        email: "",
        org: "",
        subject: "",
        message: "",
    });

    const labelColor = useColorModeValue("grey.700", "grey.300");

    const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <VStack align="stretch" spacing={4} w="100%">
            <HStack spacing={4} w="100%">
                <FormControl>
                    <FormLabel fontSize="sm" color={labelColor} mb={1}>
                        Prénom *
                    </FormLabel>
                    <Input
                        placeholder="Votre prénom"
                        value={form.firstName}
                        onChange={update("firstName")}
                        size="sm"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color={labelColor} mb={1}>
                        Nom *
                    </FormLabel>
                    <Input
                        placeholder="Votre nom"
                        value={form.lastName}
                        onChange={update("lastName")}
                        size="sm"
                    />
                </FormControl>
            </HStack>
            <FormControl>
                <FormLabel fontSize="sm" color={labelColor} mb={1}>
                    Objet *
                </FormLabel>
                <Input
                    placeholder="Sujet de votre demande"
                    value={form.subject}
                    onChange={update("subject")}
                    size="sm"
                />
            </FormControl>
            <FormControl>
                <FormLabel fontSize="sm" color={labelColor} mb={1}>
                    Message *
                </FormLabel>
                <Textarea
                    placeholder="Décrivez votre demande..."
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    resize="none"
                />
            </FormControl>
            <Button variant="superPrimary" size="sm" alignSelf="flex-start" px={6}>
                Envoyer le message
            </Button>
        </VStack>
    );
};

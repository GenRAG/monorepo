import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Grid,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import { Mail } from "lucide-react";
import { User } from "types/user";
import { ProfileBlock } from "../ProfileBlock";

const splitName = (name: string): [string, string] => {
    const idx = name.indexOf(" ");
    return idx === -1 ? [name, ""] : [name.slice(0, idx), name.slice(idx + 1)];
};

interface FormValues {
    firstName: string;
    lastName: string;
}

interface Props {
    user: User;
    onSave: (name: string) => Promise<void>;
    isLoading: boolean;
}

const PersonalInfoSection = ({ user, onSave, isLoading }: Props) => {
    const [firstName, lastName] = splitName(user.name ?? "");
    const { register, handleSubmit, reset, formState } = useForm<FormValues>({
        defaultValues: { firstName, lastName },
    });

    useEffect(() => {
        const [fn, ln] = splitName(user.name ?? "");
        reset({ firstName: fn, lastName: ln });
    }, [user.name, reset]);

    const onSubmit = (values: FormValues) => onSave([values.firstName, values.lastName].filter(Boolean).join(" "));

    return (
        <ProfileBlock
            title="Informations personnelles"
            subtitle="Votre nom tel qu'il s'affiche dans l'application."
            onSubmit={handleSubmit(onSubmit)}
            footer={
                <>
                    <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => reset()}
                        isDisabled={!formState.isDirty}
                    >
                        Annuler
                    </Button>
                    <Button
                        size="sm"
                        variant="superPrimary"
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!formState.isDirty}
                    >
                        Enregistrer
                    </Button>
                </>
            }
        >
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <FormControl>
                    <FormLabel fontSize="xs" color="textLabel">
                        Prénom
                    </FormLabel>
                    <Input variant="glass" size="sm" {...register("firstName")} />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="xs" color="textLabel">
                        Nom
                    </FormLabel>
                    <Input variant="glass" size="sm" {...register("lastName")} />
                </FormControl>

                <FormControl gridColumn="1 / -1">
                    <FormLabel fontSize="xs" color="textLabel">
                        Adresse email
                    </FormLabel>
                    <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                            <Icon as={Mail} boxSize={3.5} color="textLabel" />
                        </InputLeftElement>
                        <Input variant="glass" value={user.email} isReadOnly color="textLabel" />
                    </InputGroup>
                    <FormHelperText fontSize="xs" color="textMuted">
                        Contactez le support pour changer d&apos;adresse email.
                    </FormHelperText>
                </FormControl>
            </Grid>
        </ProfileBlock>
    );
};

export default PersonalInfoSection;

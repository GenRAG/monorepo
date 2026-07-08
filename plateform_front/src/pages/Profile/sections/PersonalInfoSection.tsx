import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    HStack,
    Icon,
    Input,
    Stack,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { ChevronDown, Info, Mail } from "lucide-react";
import { User } from "types/user";
import { ActionMenu } from "components/ui/ActionMenu";

const LANG_OPTIONS = [{ value: "fr", label: "Français" }];

const TZ_OPTIONS = [{ value: "Europe/Paris", label: "Europe/Paris (UTC+1)" }];

const splitName = (name: string): [string, string] => {
    const idx = name.indexOf(" ");
    return idx === -1 ? [name, ""] : [name.slice(0, idx), name.slice(idx + 1)];
};

interface FormValues {
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    lang: string;
    tz: string;
}

interface Props {
    user: User;
    onSave: (name: string) => Promise<void>;
    isLoading: boolean;
}

const PersonalInfoSection = ({ user, onSave, isLoading }: Props) => {
    const [firstName, lastName] = splitName(user.name ?? "");
    const inputBg = useColorModeValue("white", "grey.900");

    const { register, handleSubmit, reset, control } = useForm<FormValues>({
        defaultValues: { firstName, lastName, phone: "", role: "", lang: "fr", tz: "Europe/Paris" },
    });

    useEffect(() => {
        const [fn, ln] = splitName(user.name ?? "");
        reset({ firstName: fn, lastName: ln, phone: "", role: "", lang: "fr", tz: "Europe/Paris" });
    }, [user.name, reset]);

    const onSubmit = (values: FormValues) => onSave([values.firstName, values.lastName].filter(Boolean).join(" "));

    return (
        <VStack align="stretch" as="form" onSubmit={handleSubmit(onSubmit)} w="100%">
            <Stack p={6}>
                <Box>
                    <Text fontSize="md" fontWeight="600" color="textPrimary">
                        Informations personnelles
                    </Text>
                    <Text fontSize="sm" color="textLabel" mt={0.5}>
                        Visibles par les membres de votre workspace.
                    </Text>
                </Box>

                <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                    <FormControl>
                        <FormLabel fontSize="xs" color="textLabel">
                            Nom
                        </FormLabel>
                        <Input bg={inputBg} {...register("firstName")} />
                    </FormControl>

                    <FormControl gridColumn="1 / -1">
                        <HStack mb={1} spacing={2}>
                            <FormLabel fontSize="xs" color="textLabel" mb={0}>
                                Adresse email
                            </FormLabel>
                            {user.isEmailVerified && (
                                <Badge colorScheme="green" variant="subtle" fontSize="10px" px={2} borderRadius="full">
                                    ✓ Vérifiée
                                </Badge>
                            )}
                        </HStack>
                        <HStack
                            bg="inputDisabledBg"
                            border="1px solid"
                            borderColor="inputBorder"
                            borderRadius="6px"
                            px={3}
                            h="40px"
                        >
                            <Icon as={Mail} boxSize={3.5} color="textLabel" flexShrink={0} />
                            <Text fontSize="sm" color="textSecondary">
                                {user.email}
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color="textMuted" mt={1}>
                            Contactez un administrateur pour changer l&apos;adresse email.
                        </Text>
                    </FormControl>

                    <FormControl w="100%">
                        <FormLabel fontSize="xs" color="textLabel">
                            Langue de l&apos;interface
                        </FormLabel>
                        <Controller
                            name="lang"
                            control={control}
                            render={({ field }) => (
                                <ActionMenu
                                    placement="bottom-start"
                                    fullWidth
                                    trigger={
                                        <HStack
                                            h="40px"
                                            px={3}
                                            w="100%"
                                            justify="space-between"
                                            borderWidth="1px"
                                            borderStyle="solid"
                                            borderColor="inputBorder"
                                            bg={inputBg}
                                            borderRadius="8px"
                                            cursor="pointer"
                                            _hover={{ borderColor: "inputActiveBorder" }}
                                        >
                                            <Text fontSize="sm" color="inputText">
                                                {LANG_OPTIONS.find((o) => o.value === field.value)?.label}
                                            </Text>
                                            <Icon as={ChevronDown} boxSize={4} color="textLabel" />
                                        </HStack>
                                    }
                                    items={LANG_OPTIONS.map((o) => ({
                                        label: o.label,
                                        onClick: () => field.onChange(o.value),
                                    }))}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="xs" color="textLabel">
                            Fuseau horaire
                        </FormLabel>
                        <Controller
                            name="tz"
                            control={control}
                            render={({ field }) => (
                                <ActionMenu
                                    placement="bottom-start"
                                    fullWidth
                                    width="100%"
                                    trigger={
                                        <HStack
                                            h="40px"
                                            px={3}
                                            w="100%"
                                            justify="space-between"
                                            borderWidth="1px"
                                            borderStyle="solid"
                                            borderColor="inputBorder"
                                            bg={inputBg}
                                            borderRadius="8px"
                                            cursor="pointer"
                                            _hover={{ borderColor: "inputActiveBorder" }}
                                        >
                                            <Text fontSize="sm" color="inputText">
                                                {TZ_OPTIONS.find((o) => o.value === field.value)?.label}
                                            </Text>
                                            <Icon as={ChevronDown} boxSize={4} color="textLabel" />
                                        </HStack>
                                    }
                                    items={TZ_OPTIONS.map((o) => ({
                                        label: o.label,
                                        onClick: () => field.onChange(o.value),
                                    }))}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>
            </Stack>

            <Divider borderColor="borderDefault" />

            <HStack justify="space-between" p={6}>
                <HStack spacing={1.5} color="textMuted">
                    <Icon as={Info} boxSize={3} />
                    <Text fontSize="xs">Les modifications ne seront visibles qu&apos;après enregistrement.</Text>
                </HStack>
                <HStack spacing={3}>
                    <Button size="sm" variant="ghost" type="button" onClick={() => reset()}>
                        Annuler
                    </Button>
                    <Button size="sm" variant="superPrimary" type="submit" isLoading={isLoading}>
                        Enregistrer
                    </Button>
                </HStack>
            </HStack>
        </VStack>
    );
};

export default PersonalInfoSection;

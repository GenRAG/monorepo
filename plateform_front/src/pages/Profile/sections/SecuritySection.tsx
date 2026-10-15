import { useState } from "react";
import { Box, Button, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { ShowHidePasswordInput } from "components/ui/ShowHidePasswordInput";
import { ProfileBlock } from "../ProfileBlock";

const getStrength = (pw: string): 0 | 1 | 2 | 3 | 4 => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4;
};

const STRENGTH_LABELS = ["Faible", "Moyen", "Bon", "Fort"];
const STRENGTH_COLORS = ["trendNegative", "trendNeutral", "iconAccent", "trendPositive"];

const PasswordStrengthBar = ({ password }: { password: string }) => {
    const strength = getStrength(password);
    if (!password) return null;
    const color = STRENGTH_COLORS[strength - 1];
    return (
        <VStack align="start" spacing={1} w="100%">
            <HStack spacing={1} w="100%">
                {[1, 2, 3, 4].map((lvl) => (
                    <Box
                        key={lvl}
                        h="3px"
                        flex={1}
                        borderRadius="full"
                        bg={strength >= lvl ? color : "borderStrong"}
                        transition="background 0.2s"
                    />
                ))}
            </HStack>
            <Text fontSize="10px" color={color} fontWeight="600">
                {STRENGTH_LABELS[strength - 1]}
            </Text>
        </VStack>
    );
};

interface Props {
    /** Résout à `false` si le changement a échoué : le formulaire reste rempli pour corriger. */
    onChangePassword: (current: string, next: string) => Promise<boolean>;
    isLoading: boolean;
}

const SecuritySection = ({ onChangePassword, isLoading }: Props) => {
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");

    const reset = () => {
        setEditing(false);
        setCurrent("");
        setNext("");
        setConfirm("");
    };
    const mismatch = confirm.length > 0 && next !== confirm;
    const canSave = current && next && confirm && !mismatch && getStrength(next) >= 1;

    return (
        <ProfileBlock title="Sécurité" subtitle="Gérez votre mot de passe et la sécurité du compte.">
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                    <HStack spacing={3}>
                        <Icon as={Lock} boxSize={4} color="textLabel" />
                        <VStack align="start" spacing={0.5}>
                            <Text fontSize="xs" color="textLabel" fontWeight="500">
                                Mot de passe
                            </Text>
                            <Text fontSize="sm" color="textPrimary" letterSpacing="2px">
                                ••••••••••
                            </Text>
                        </VStack>
                    </HStack>
                    <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={editing ? X : Check} boxSize={3} />}
                        onClick={() => (editing ? reset() : setEditing(true))}
                    >
                        {editing ? "Annuler" : "Modifier"}
                    </Button>
                </HStack>

                <AnimatePresence>
                    {editing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                        >
                            <VStack align="stretch" spacing={3}>
                                <ShowHidePasswordInput
                                    variant="glass"
                                    size="sm"
                                    value={current}
                                    onChange={(e) => setCurrent(e.target.value)}
                                    placeholder="Mot de passe actuel"
                                    autoFocus
                                />
                                <VStack align="start" spacing={1.5}>
                                    <ShowHidePasswordInput
                                        variant="glass"
                                        size="sm"
                                        value={next}
                                        onChange={(e) => setNext(e.target.value)}
                                        placeholder="Nouveau mot de passe"
                                    />
                                    <PasswordStrengthBar password={next} />
                                </VStack>
                                <VStack align="start" spacing={1.5}>
                                    <ShowHidePasswordInput
                                        variant="glass"
                                        size="sm"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="Confirmer le nouveau mot de passe"
                                    />
                                    {confirm.length > 0 && (
                                        <Text
                                            fontSize="10px"
                                            fontWeight="600"
                                            color={mismatch ? "textError" : "trendPositive"}
                                        >
                                            {mismatch ? "Ne correspond pas" : "Les mots de passe correspondent"}
                                        </Text>
                                    )}
                                </VStack>
                                <Button
                                    size="sm"
                                    variant="superPrimary"
                                    leftIcon={<Icon as={Check} boxSize={3.5} />}
                                    onClick={() => void onChangePassword(current, next).then((ok) => ok && reset())}
                                    isLoading={isLoading}
                                    isDisabled={!canSave}
                                    alignSelf="flex-start"
                                >
                                    Changer le mot de passe
                                </Button>
                            </VStack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </VStack>
        </ProfileBlock>
    );
};

export default SecuritySection;

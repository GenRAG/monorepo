import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FormControl, FormLabel, HStack, Icon, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { ActionMenu } from "components/ui/ActionMenu";

interface SelectOption {
    value: string;
    label: string;
}

interface ProfileSelectFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    options: SelectOption[];
    inputBg: string;
}

export const ProfileSelectField = <T extends FieldValues>({
    name,
    control,
    label,
    options,
    inputBg,
}: ProfileSelectFieldProps<T>) => (
    <FormControl w="100%">
        <FormLabel fontSize="xs" color="textLabel">
            {label}
        </FormLabel>
        <Controller
            name={name}
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
                                {options.find((o) => o.value === field.value)?.label}
                            </Text>
                            <Icon as={ChevronDown} boxSize={4} color="textLabel" />
                        </HStack>
                    }
                    items={options.map((o) => ({
                        label: o.label,
                        onClick: () => field.onChange(o.value),
                    }))}
                />
            )}
        />
    </FormControl>
);

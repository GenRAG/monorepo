import React from "react";
import { HStack, Icon } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import Button from "components/System/Atoms/Button";

interface SuggestedQuestionsProps {
    questions: string[];
    onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
    questions,
    onQuestionClick,
}) => {
    if (!questions || questions.length === 0) return null;

    return (
        <HStack spacing={2} wrap="wrap" justify="center">
            {questions.map((q, i) => (
                <Button
                    key={i}
                    size="sm"
                    variant="secondary"
                    borderRadius="full"
                    onClick={() => onQuestionClick(q)}
                >
                    <Icon as={Sparkles} boxSize={3} mr={2} />
                    {q}
                </Button>
            ))}
        </HStack>
    );
};

export default SuggestedQuestions;

import {
    IndexDocumentCommand,
    IndexDocumentCommandProps,
} from '../commands/index-document.command';

export function mapIndexDocumentJobToCommand(
    payload: IndexDocumentCommandProps,
): IndexDocumentCommand {
    return new IndexDocumentCommand(payload);
}

import torch
from langchain_text_splitters import MarkdownHeaderTextSplitter

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
    ("####", "Header 4"),
]

def _document_to_token_embeddings(model, tokenizer, device, document):        
    inputs = tokenizer(document, truncation=True, return_tensors='pt')
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        model_output = model(**inputs)
        
    return model_output[0]

def _get_chunks(splitter, tokenizer, text: str):
    documents = splitter.split_text(text)
    tokenized = tokenizer(text, return_offsets_mapping=True)
    offsets = tokenized["offset_mapping"]
    
    chunks = []
    span_annotations = []
    
    current_char_pos = 0
    last_token_idx = 1

    for doc in documents:
        chunk_text = doc.page_content
        chunks.append(chunk_text)
        
        start_char = text.find(chunk_text, current_char_pos)
        if start_char == -1:
            start_char = current_char_pos
            
        end_char = start_char + len(chunk_text)
        
        token_start = last_token_idx
        token_end = token_start
        
        for idx in range(last_token_idx, len(offsets)):
            char_start, char_end = offsets[idx]
            if char_start == 0 and char_end == 0 and idx != 0:
                continue
            if char_start >= end_char:
                break
            token_end = idx + 1
        if token_end <= token_start:
            token_end = token_start + 1
            
        span_annotations.append((token_start, token_end))
        last_token_idx = token_end 
        current_char_pos = end_char

    return chunks, span_annotations

def _get_pooled_embedding(
    token_embeddings: torch.Tensor, span_annotation: list, max_length=None
):
    outputs = []
    for embeddings, annotations in zip(token_embeddings, span_annotation):
        if (
            max_length is not None
        ): 
            annotations = [
                (start, min(end, max_length - 1))
                for (start, end) in annotations
                if start < (max_length - 1)
            ]
        pooled_embeddings = [
            embeddings[start:end].sum(dim=0) / (end - start)
            for start, end in annotations
            if (end - start) >= 1
        ]
        pooled_embeddings = [
            embedding.detach().to(torch.float32).to("cpu").contiguous().numpy()
            for embedding in pooled_embeddings
        ]
        outputs.append(pooled_embeddings)

    return outputs

class Chunking:
    def __init__(self, model, tokenizer, device):
        self.model = model
        self.tokenizer = tokenizer
        self.device = device
        self.splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on, strip_headers=False)
        
    def late_chunking(self, content: str):
        chunks, span_annotations = _get_chunks(self.splitter, self.tokenizer, content)

        document_embedding = _document_to_token_embeddings(self.model, self.tokenizer, self.device, content)
        embeddings = _get_pooled_embedding(document_embedding, [span_annotations])[0]

        return chunks, embeddings
        

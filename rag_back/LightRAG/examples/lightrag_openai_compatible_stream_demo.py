import inspect
import os
from lightrag import LightRAG
from lightrag.utils import EmbeddingFunc, always_get_an_event_loop
from lightrag import QueryParam


from lightrag.llm.openai import gpt_4o_complete, openai_embed
import os


rag = LightRAG(
    working_dir="workspace",
    embedding_func=openai_embed,
    llm_model_func=gpt_4o_complete,
    llm_model_max_async=4
)


resp = rag.query(
    "What are the top themes you know ?",
    param=QueryParam(mode="hybrid", stream=True),
)


async def print_stream(stream):
    async for chunk in stream:
        if chunk:
            print(chunk, end="", flush=True)


loop = always_get_an_event_loop()
if inspect.isasyncgen(resp):
    loop.run_until_complete(print_stream(resp))
else:
    print(resp)

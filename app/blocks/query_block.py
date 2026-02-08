from blocks.base_block import BaseBlock

class QueryBlock(BaseBlock):
    async def run(self, input_data: str) -> dict:
        return {"query": input_data}
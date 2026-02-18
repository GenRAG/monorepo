from typing import Union, Dict, Any
from langfuse import observe
from .base_block import BaseBlock


class QueryBlock(BaseBlock):
    @observe(name="QueryBlock")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
        else:
            query = str(input_data)
        return {"query": query}

from typing import Union, Dict, Any
from langfuse import observe # Observability decorator for Langfuse tracing
from .base_block import BaseBlock


class QueryBlock(BaseBlock): # A block to normalize and extract the user query
    @observe(name="QueryBlock")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        # Extracts the query from dictionary or string input
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
        else:
            query = str(input_data)
        return {"query": query} # Returns the query in a standardized dictionary format

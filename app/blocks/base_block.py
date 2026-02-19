from typing import Union, AsyncGenerator, Dict, Any
from pydantic import BaseModel


class BaseBlock(BaseModel):
    name: str
    description: str | None = None

    async def run(
        self, input_data: Union[Dict[str, Any], str]
    ) -> Union[Dict[str, Any], AsyncGenerator[str, None]]:
        raise NotImplementedError

    def __str__(self) -> str: # String representation for debugging
        return f"{self.__class__.__name__}(name='{self.name}')"

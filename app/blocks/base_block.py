from pydantic import BaseModel
from typing import List, Optional, Union
from abc import ABC, abstractmethod

class BaseBlock(BaseModel):
    name: str
    description: Optional[str] = None

    @abstractmethod
    async def run(self, input_data: dict) -> dict:
        raise NotImplementedError("Each block must implement the run method.")
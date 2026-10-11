
from datetime import time
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


Day = Literal[
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
]


class OpeningHoursCreate(BaseModel):
    open_time: time
    close_time: time
    weekly_off: list[Day] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_times(self):
        if self.open_time == self.close_time:
            raise ValueError(
                "Opening and closing times cannot be the same"
            )
        return self


class OpeningHoursUpdate(BaseModel):
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    weekly_off: Optional[list[Day]] = None

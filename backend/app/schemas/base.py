from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Bütün API Pydantic modelləri üçün baza sinfi:
    JSON tərəfində camelCase, Python və DB tərəfində snake_case təmin edir.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        str_strip_whitespace=True,
    )


class SuccessResponse(CamelModel):
    success: bool = True
    message: str = "Əməliyyat uğurla yerinə yetirildi"


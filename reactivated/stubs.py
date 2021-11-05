from typing import TYPE_CHECKING, Any, ClassVar, List, Mapping, Optional, Type, Union

if TYPE_CHECKING:
    from django import forms as django_forms

    class BaseForm(django_forms.BaseForm):
        base_fields: ClassVar[Mapping[str, django_forms.fields.Field]]

    class BaseFormSet(django_forms.formsets.BaseFormSet):
        form: ClassVar[Type[BaseForm]]

        def total_form_count(self) -> int:
            ...

        def initial_form_count(self) -> int:
            ...

        def non_form_errors(self) -> Any:
            ...

        # Our plugin adds this.
        # def is_valid(self) -> bool:
        #    pass

        can_order: bool
        can_delete: bool
        max_num: int
        min_num: int
        extra: int

    class BaseModelFormSet(BaseFormSet, django_forms.models.BaseModelFormSet):
        pass

    class _GenericAlias:
        __origin__: Union[type, Any]
        __args__: List[Any]

    class _TypedDictMeta:
        pass

    from typing import Optional as Undefined

    from datetime import date as ActualDate
else:
    from typing import _GenericAlias, _TypedDictMeta  # noqa: F401
    from django.forms.formsets import BaseFormSet  # noqa: F401

    class ActualDate:
        @classmethod
        def get_json_schema(cls: Type["ActualDate"], definitions: Any) -> Any:
            from .serialization import Thing

            return Thing(schema={"tsType": "Date"}, definitions=definitions)

    class BaseUndefinedHolder:
        _reactivated_undefined = True
        type: Any

        @classmethod
        def get_json_schema(cls: Type["BaseUndefinedHolder"], definitions: Any) -> Any:
            from .serialization import create_schema

            return create_schema(cls.type, definitions)

    class Undefined:
        wrapped: Any

        def __class_getitem__(cls: Type["Undefined"], item: Any) -> Any:
            class Undefined(BaseUndefinedHolder):
                type = Optional[item]

            return Undefined

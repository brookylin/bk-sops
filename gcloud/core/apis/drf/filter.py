# -*- coding: utf-8 -*-
"""
Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
Edition) available.
Copyright (C) 2017-2022 THL A29 Limited, a Tencent company. All rights reserved.
Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://opensource.org/licenses/MIT
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
"""

from django_filters.filterset import BaseFilterSet, FilterSetOptions, FilterSetMetaclass

ALL_LOOKUP = "__all__"
LOOKUP_SEP = "__"


class AllLookupSupportFilterSetOptions(FilterSetOptions):
    def __init__(self, options=None):
        self.lookups = getattr(options, "lookups", None)
        super(AllLookupSupportFilterSetOptions, self).__init__(options)


class AllLookupSupportFilterSetMetaclass(type):
    """
    FILTER_SET_OPTIONS_CLS 需要重新定义
    """

    def __new__(cls, name, bases, attrs):
        attrs["declared_filters"] = cls.get_declared_filters(bases, attrs)
        new_class = super().__new__(cls, name, bases, attrs)
        new_class._meta = new_class.FILTER_SET_OPTIONS_CLS(getattr(new_class, "Meta", None))
        new_class.base_filters = new_class.get_filters()
        assert not hasattr(new_class, "filter_for_reverse_field"), (
            "`%(cls)s.filter_for_reverse_field` has been removed. "
            "`%(cls)s.filter_for_field` now generates filters for reverse fields. "
            "See: https://django-filter.readthedocs.io/en/master/guide/migration.html" % {"cls": new_class.__name__}
        )
        return new_class

    @classmethod
    def get_declared_filters(cls, bases, attrs):
        return FilterSetMetaclass.get_declared_filters(bases, attrs)


class AllLookupSupportFilterSet(BaseFilterSet, metaclass=AllLookupSupportFilterSetMetaclass):
    FILTER_SET_OPTIONS_CLS = AllLookupSupportFilterSetOptions

    @classmethod
    def set_field_lookup(cls, field, lookups, fields_lookups):
        """
        :param field: 需要被查询lookup的model字段
        :param lookups: 需要被查询 lookups
        :param fields_lookups: 原始查询数据
        """

        if lookups != ALL_LOOKUP:
            return

        model = cls._meta.model
        if LOOKUP_SEP in field:
            # 处理 {"groups__info__name" : "__all__"}的情况
            fields = field.split(LOOKUP_SEP)
            for index, _field in enumerate(fields, start=1):
                if index == len(fields):
                    fields_lookups[field] = model._meta.get_field(_field).get_lookups().keys()
                model = model._meta.get_field(_field).related_model
            return

        field_object = model._meta.get_field(field)
        if field_object.is_relation:
            # 外键只支持一层子级lookups
            for relation_field in field_object.related_model._meta.fields:
                lookup_field = LOOKUP_SEP.join([field, relation_field.name])
                fields_lookups.update({lookup_field: relation_field.get_lookups().keys()})
        else:
            fields_lookups[field] = field_object.get_lookups().keys()

    @classmethod
    def get_fields(cls):
        """
        1.支持 lookups, 当fields为list或tuple时生效，使fields中字段支持lookups中声明的查询语法。
        如： fields = ["id", "name", "info__num"]
            lookups = ["in", "contains"]

        如 ：fields = ["id", "name", "info__num"]
            lookups = "__all__"

        2.支持 fields 属性指定的字段支持orm中所有查询语法。为外键声明 all 时只支持一层子级字段查询
        如： fields = {"id":“ __all__","name": “__all__"}
        如： fields = {"id":“ __all__","name": ["in", "contains"], "info__num": ["in", "range"]}
        如： fields = {"id":“ __all__","name": ["in", "contains"], "info__num": “__all__”}
        如： fields = ["id", "name", "info__num"]
        """
        exclude = cls._meta.exclude or []
        lookups = cls._meta.lookups
        fields = cls._meta.fields

        fields_lookups = super(AllLookupSupportFilterSet, cls).get_fields()

        if isinstance(fields, dict):
            for field, lookups in fields_lookups.items():
                if field not in exclude:
                    cls.set_field_lookup(field, lookups, fields_lookups)
        else:
            if not lookups:
                return fields_lookups
            fields = fields_lookups.keys() if fields == ALL_LOOKUP else fields
            for field in fields:
                if field not in exclude:
                    cls.set_field_lookup(field, lookups, fields_lookups)
        return fields_lookups

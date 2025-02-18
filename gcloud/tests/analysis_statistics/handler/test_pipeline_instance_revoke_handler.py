# -*- coding: utf-8 -*-
"""
Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
Edition) available.
Copyright (C) 2017-2021 THL A29 Limited, a Tencent company. All rights reserved.
Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://opensource.org/licenses/MIT
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
"""

from django.test import TestCase

from pipeline.models import PipelineInstance


from gcloud.tests.mock import patch, MagicMock
from gcloud.tests.analysis_statistics.mock_settings import PIPELINE_ARCHIVE_STATISTICS_TASK


class TestPipelineInstanceRevokeHandler(TestCase):
    def test_pipeline_instance_revoke_handler(self):
        with patch(PIPELINE_ARCHIVE_STATISTICS_TASK, MagicMock()) as mocked_handler:
            self.pipeline_instance = PipelineInstance.objects.create(instance_id="instance_id", executor="executor")
            PipelineInstance.objects.set_revoked(self.pipeline_instance.instance_id)
            mocked_handler.assert_called_once_with(instance_id=self.pipeline_instance.instance_id)

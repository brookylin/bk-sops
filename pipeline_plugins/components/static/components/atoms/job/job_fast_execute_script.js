/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
 * Edition) available.
 * Copyright (C) 2017-2021 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
(function () {
    $.atoms.job_fast_execute_script = [
        {
            tag_code: "biz_cc_id",
            type: "select",
            attrs: {
                name: gettext("业务"),
                allowCreate: true,
                hookable: true,
                remote: true,
                remote_url: $.context.get('site_url') + 'pipeline/cc_get_business_list/',
                remote_data_init: function (resp) {
                    if (resp.result === false) {
                        show_msg(resp.message, 'error');
                    }
                    return resp.data;
                },
                disabled: !$.context.canSelectBiz(),
                validation: [
                    {
                        type: "required"
                    }
                ]
            },
            methods: {
                _tag_init: function () {
                    if (this.value) {
                        return
                    }
                    this._set_value($.context.getBkBizId())
                }
            }
        },
        {
            tag_code: "job_script_source",
            type: "radio",
            attrs: {
                name: gettext("脚本来源"),
                hookable: false,
                items: [
                    {value: "manual", name: gettext("手工录入")},
                    {value: "general", name: gettext("业务脚本")},
                    {value: "public", name: gettext("公共脚本")},
                ],
                default: "manual",
                validation: [
                    {
                        type: "required"
                    }
                ],
            },
            events: [
                {
                    source: "job_script_source",
                    type: "init",
                    action: function () {
                        this.emit_event(this.tagCode, "change", this.value)
                    }
                },
            ]
        },
        {
            tag_code: "job_script_type",
            type: "radio",
            attrs: {
                name: gettext("脚本类型"),
                hookable: true,
                items: [
                    {value: "1", name: "shell"},
                    {value: "2", name: "bat"},
                    {value: "3", name: "perl"},
                    {value: "4", name: "python"},
                    {value: "5", name: "powershell"}
                ],
                default: "1",
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            var self = this
                            var result = {
                                result: true,
                                error_message: ""
                            }
                            if (!self.get_parent) {
                                return result
                            } else if (self.get_parent().get_child('job_script_source')) {
                                if (self.get_parent().get_child('job_script_source').value === "manual" && !value) {
                                    result.result = false;
                                    result.error_message = gettext("请选择脚本类型");
                                }
                            } else if (!value) {
                                result.result = false;
                                result.error_message = gettext("请选择脚本类型");
                            }
                            return result
                        }
                    }
                ]
            },
            events: [
                {
                    source: "job_script_source",
                    type: "change",
                    action: function (value) {
                        var self = this;
                        if (value === "manual") {
                            self.show()
                        } else {
                            self.hide()
                        }
                    }
                }
            ]
        },
        {
            tag_code: "job_content",
            type: "code_editor",
            attrs: {
                name: gettext("脚本内容"),
                hookable: true,
                placeholder: gettext("填写执行脚本内容"),
                language: "shell",
                showLanguageSwitch: false,
                height: "400px",
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            var self = this
                            var result = {
                                result: true,
                                error_message: ""
                            }
                            if (!self.get_parent) {
                                return result
                            } else if (self.get_parent().get_child('job_script_source')) {
                                if (self.get_parent().get_child('job_script_source').value === "manual" && !value) {
                                    result.result = false;
                                    result.error_message = gettext("请输入脚本内容");
                                }
                            } else if (!value) {
                                result.result = false;
                                result.error_message = gettext("请输入脚本内容");
                            }
                            return result
                        }
                    }
                ]
            },
            events: [
                {
                    source: "job_script_source",
                    type: "change",
                    action: function (value) {
                        var self = this;
                        if (value === "manual") {
                            self.show()
                        } else {
                            self.hide()
                        }
                    }
                }
            ]
        },
        {
            tag_code: "job_script_list_public",
            type: "select",
            attrs: {
                name: gettext("脚本列表"),
                hookable: true,
                remote: true,
                remote_url: function () {
                    const url = $.context.canSelectBiz() ? '' : $.context.get('site_url') + 'pipeline/job_get_script_list/' + $.context.getBkBizId() + '/?type=public';
                    return url;
                },
                remote_data_init: function (resp) {
                    if (resp.result === false) {
                        show_msg(resp.message, 'error');
                    }
                    return resp.data;
                },
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            var self = this;
                            var result = {
                                result: true,
                                error_message: ""
                            };
                            if (!self.get_parent) {
                                return result
                            } else if (self.get_parent().get_child('job_script_source')) {
                                if (self.get_parent().get_child('job_script_source').value === "public" && !value) {
                                    result.result = false;
                                    result.error_message = gettext("请选择脚本");
                                }
                            } else if (!value) {
                                result.result = false;
                                result.error_message = gettext("请选择脚本");
                            }
                            return result
                        }
                    }
                ],
            },
            events: [
                {
                    source: "biz_cc_id",
                    type: "init",
                    action: function () {
                        const cc_id = this.get_parent && this.get_parent().get_child('biz_cc_id')._get_value();
                        if (cc_id !== '' && $.context.canSelectBiz()) {
                            this.remote_url = $.context.get('site_url') + 'pipeline/job_get_script_list/' + cc_id + '/?type=public';
                            this.remoteMethod();
                        }
                    }
                },
                {
                    source: "biz_cc_id",
                    type: "change",
                    action: function (value) {
                        if (!$.context.canSelectBiz() || value === '') {
                            return;
                        }
                        this.remote_url = $.context.get('site_url') + 'pipeline/job_get_script_list/' + value + '/?type=public';
                        this.remoteMethod();
                    }
                },
                {
                    source: "job_script_source",
                    type: "change",
                    action: function (value) {
                        var self = this
                        if (value === "public") {
                            self.show()
                        } else {
                            self.hide()
                        }
                    }
                }
            ]
        },
        {
            tag_code: "job_script_list_general",
            type: "select",
            attrs: {
                name: gettext("脚本列表"),
                hookable: true,
                remote: true,
                remote_url: function () {
                    const url = $.context.canSelectBiz() ? '' : $.context.get('site_url') + 'pipeline/job_get_script_list/' + $.context.getBkBizId() + '/?type=general';
                    return url;
                },
                remote_data_init: function (resp) {
                    if (resp.result === false) {
                        show_msg(resp.message, 'error');
                    }
                    return resp.data;
                },
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            let self = this
                            let result = {
                                result: true,
                                error_message: ""
                            }
                            if (!self.get_parent) {
                                return result
                            } else if (self.get_parent().get_child('job_script_source')) {
                                if (self.get_parent().get_child('job_script_source').value === "general" && !value) {
                                    result.result = false;
                                    result.error_message = gettext("请选择脚本");
                                }
                            } else if (!value) {
                                result.result = false;
                                result.error_message = gettext("请选择脚本");
                            }
                            return result
                        }
                    }
                ]
            },
            events: [
                {
                    source: "biz_cc_id",
                    type: "init",
                    action: function () {
                        const cc_id = this.get_parent && this.get_parent().get_child('biz_cc_id')._get_value();
                        if (cc_id !== '' && $.context.canSelectBiz()) {
                            this.remote_url = $.context.get('site_url') + 'pipeline/job_get_script_list/' + cc_id + '/?type=general';
                            this.remoteMethod();
                        }
                    }
                },
                {
                    source: "biz_cc_id",
                    type: "change",
                    action: function (value) {
                        if (!$.context.canSelectBiz()) {
                            return;
                        }
                        this._set_value('');
                        if (value === '') {
                            return;
                        }
                        this.remote_url = $.context.get('site_url') + 'pipeline/job_get_script_list/' + value + '/?type=general';
                        this.remoteMethod();
                    }
                },
                {
                    source: "job_script_source",
                    type: "change",
                    action: function (value) {
                        var self = this
                        if (value === "general") {
                            self.show()
                        } else {
                            self.hide()
                        }
                    }
                }
            ]
        },
        {
            tag_code: "job_script_param",
            type: "input",
            attrs: {
                name: gettext("脚本参数"),
                placeholder: gettext("可为空"),
                hookable: true
            },
        },
        {
            tag_code: "job_script_timeout",
            type: "input",
            attrs: {
                name: gettext("超时时间"),
                placeholder: gettext("单位为秒，为空时使用 JOB 默认值"),
                hookable: true,
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            var result = {
                                result: true,
                                error_message: ""
                            }
                            if (value && !Number(value)) {
                                result.result = false;
                                result.error_message = gettext("请输入数字");
                            }
                            return result;
                        }
                    }
                ]
            }
        },
        {
            tag_code: "job_ip_list",
            type: "textarea",
            attrs: {
                name: gettext("目标IP"),
                placeholder: gettext("输入IP, 多个用英文逗号 `,` 或换行分隔"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        },
        {
            tag_code: "job_account",
            type: "input",
            attrs: {
                name: gettext("目标账户"),
                placeholder: gettext("请输入在蓝鲸作业平台上注册的账户名"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        },
        {
            tag_code: "ip_is_exist",
            type: "radio",
            attrs: {
                name: gettext("IP 存在性校验"),
                items: [
                    {value: true, name: gettext("是")},
                    {value: false, name: gettext("否")},
                ],
                default: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        }
    ]
})();

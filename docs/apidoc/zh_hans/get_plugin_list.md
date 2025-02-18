### 功能描述

获取某个业务下所有的可用插件

#### 接口参数

| 字段          |  类型       | 必选   |  描述             |
|-----------------|-------------|---------|------------------|
|   bk_biz_id       |   string     |   是   |  项目唯一 ID，项目 ID 或 CMDB 业务 ID |
|   scope       |   string     |   否   |  唯一 ID 的范围，取值为 cmdb_biz 或 project，为 cmdb_biz 时 bk_biz_id 代表业务 ID，反之代表项目 ID，不传时默认为 cmdb_biz |


### 请求参数示例

```
{
    "bk_app_code": "esb_test",
    "bk_app_secret": "xxx",
    "bk_token": "xxx",
    "bk_username": "xxx",
    "bk_biz_id": "2",
    "scope": "cmdb_biz"
}
```

### 返回结果示例

```
{
    "result": true,
    "data": [
        {
            "inputs": [],
            "outputs": [
                {
                    "name": "执行结果",
                    "key": "_result",
                    "type": "bool",
                    "schema": {
                        "type": "boolean",
                        "description": "是否执行成功",
                        "enum": []
                    }
                },
                {
                    "name": "循环次数",
                    "key": "_loop",
                    "type": "int",
                    "schema": {
                        "type": "int",
                        "description": "循环执行次数",
                        "enum": []
                    }
                }
            ],
            "desc": "",
            "code": "job_push_local_files",
            "name": "分发本地文件",
            "group_name": "作业平台(JOB)",
            "version": "1.0.0",
            "form": "/static/components/atoms/job/job_push_local_files.js"
        }
    ],
    "request_id": "xxx",
    "trace_id": "xxx"
}
```

### 返回结果说明
|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
|  result      |    bool    |      true/false 操作是否成功     |
|  data        |    dict      |      result=true 时成功数据，详细信息请见下面说明     |
|  message        |    string      |      result=false 时错误信息     |
|  request_id     |    string  |      esb 请求 id     |
|  trace_id     |    string  |      open telemetry trace_id     |

##### data[item]
|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
|  inputs      |    array    |      插件输入参数列表    |
|  outputs      |    array    |      插件输出参数列表    |
|  desc      |    string    |      插件描述    |
|  code      |    string    |      插件代码    |
|  name      |    string    |      插件名    |
|  group_name      |    string    |      插件组名    |
|  version      |    string    |      插件版本    |
|  form         |    string    |      插件表单静态资源链接    |

##### inputs

|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
| required | bool | 是否是必填参数 |
| type | string | 参数类型 |
| name | string | 参数名 |
| key | string | 参数唯一键 |
| schema | dict | 参数 schema |

###### inputs.schema

|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
| type | string | 参数类型 |
| enum | list | 参数可选范围 |
|  description      |    string    |   参数描述   |
| properties | dict | 对象属性 schema，当 type 为 object 时，会存在该字段，该对象的属性的值为另一个 schema 对象  |
| items | dict | 列表元素 schema，当 type 为 array 时，会存在该字段 |

##### outputs

|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
| type | string | 参数类型 |
| name | string | 参数名 |
| key | string | 参数唯一键 |
| schema | dict | 参数 schema |

###### outputs.schema

|   名称   |  类型  |           说明             |
| ------------ | ---------- | ------------------------------ |
| type | string | 参数类型 |
| enum | list | 参数可选范围 |
|  description      |    string    |   参数描述   |
| properties | dict | 对象属性 schema，当 type 为 object 时，会存在该字段，该对象的属性的值为另一个 schema 对象  |
| items | dict | 列表元素 schema，当 type 为 array 时，会存在该字段 |
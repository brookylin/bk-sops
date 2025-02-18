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
<template>
    <div class="static-ip">
        <div v-show="!isIpAddingPanelShow" class="ip-list-panel">
            <div class="operation-area">
                <bk-dropdown-menu
                    trigger="click"
                    :disabled="!editable"
                    @show="onDropdownShow"
                    @hide="onDropdownHide">
                    <bk-button theme="default" size="small" class="trigger-btn" slot="dropdown-trigger" :disabled="!editable">
                        <span>{{i18n.batchOperations}}</span>
                        <i :class="['bk-icon icon-angle-down',{ 'icon-flip': isDropdownShow }]"></i>
                    </bk-button>
                    <div slot="dropdown-content">
                        <div
                            v-for="operation in operations"
                            :key="operation.type"
                            class="operation-btn"
                            @click="onOperationClick(operation)">
                            {{operation.name}}
                        </div>
                    </div>
                </bk-dropdown-menu>
                <bk-button theme="default" size="small" :disabled="!editable" style="margin-left: 4px;" @click="onAddPanelShow('select')">{{i18n.selectAdd}}</bk-button>
                <bk-button theme="default" size="small" :disabled="!editable" style="margin-left: 4px;" @click="onAddPanelShow('manual')">{{i18n.manualAdd}}</bk-button>
                <ip-search-input
                    ref="ipSearchInput"
                    :class="['ip-search-wrap', { 'static-ip-unfold': isUnfold }]"
                    :editable="editable"
                    @focus="onStaticIpFocus"
                    @search="onStaticIpSearch">
                </ip-search-input>
                <span v-if="isUnfold" @click="isUnfold = false" class="return-text">{{ i18n.return }}</span>
            </div>
            <div class="selected-ip-table-wrap">
                <table :class="['ip-table', { 'disabled': !editable }]">
                    <thead>
                        <tr>
                            <th width="">{{i18n.cloudArea}}</th>
                            <th width="120">
                                IP
                                <span class="sort-group">
                                    <i :class="['sort-icon', 'up', { 'active': ipSortActive === 'up' }]" @click="onIpSort('up')"></i>
                                    <i :class="['sort-icon', { 'active': ipSortActive === 'down' }]" @click="onIpSort('down')"></i>
                                </span>
                            </th>
                            <th width="120">
                                {{i18n.hostName}}
                                <span class="sort-group">
                                    <i :class="['sort-icon', 'up', { 'active': hostNameSortActive === 'up' }]" @click="onHostNameSort('up')"></i>
                                    <i :class="['sort-icon', { 'active': hostNameSortActive === 'down' }]" @click="onHostNameSort('down')"></i>
                                </span>
                            </th>
                            <th width="160">Agent {{i18n.status}}</th>
                            <th width="50">{{i18n.operation}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="listInPage.length">
                            <tr v-for="item in listInPage" :key="item.bk_host_d">
                                <td
                                    class="ui-ellipsis"
                                    :title="item.cloud[0] && item.cloud[0].bk_inst_name">
                                    {{item.cloud[0] && item.cloud[0].bk_inst_name}}
                                </td>
                                <td>{{item.bk_host_innerip}}</td>
                                <td>{{item.bk_host_name}}</td>
                                <td
                                    class="ui-ellipsis"
                                    :class="item.agent ? 'agent-normal' : 'agent-failed'"
                                    :title="item.agent ? 'Agent' + i18n.normal : 'Agent' + i18n.error">
                                    {{item.agent ? 'Agent' + i18n.normal : 'Agent' + i18n.error}}
                                </td>
                                <td>
                                    <a
                                        :class="['remove-ip-btn', { 'disabled': !editable }]"
                                        @click.stop="onRemoveIpClick(item.bk_host_id)">
                                        {{i18n.remove}}
                                    </a>
                                </td>
                            </tr>
                        </template>
                        <tr v-else>
                            <td class="static-ip-empty" colspan="4">
                                <span v-if="!isSearchMode && editable">
                                    {{i18n.noDataCan}}
                                    <span class="add-ip-btn" @click="onAddPanelShow('select')">{{i18n.selectAdd}}</span>
                                    {{i18n.or}}
                                    <span class="add-ip-btn" @click="onAddPanelShow('manual')">{{i18n.manualAdd}}</span>
                                </span>
                                <span v-else>{{i18n.noData}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="table-footer">
                    <div v-if="isShowQuantity" class="selected-num">{{i18n.total}}
                        <span class="total-ip">{{staticIps.length}}</span>
                        {{i18n.staticIpNum}}
                        {{i18n.among}}
                        <span class="total-not-installed">{{failedAgentLength}}</span>
                        {{i18n.num}}{{i18n.error}}
                    </div>
                    <div class="table-pagination" v-if="isPaginationShow">
                        <bk-pagination
                            size="small"
                            align="right"
                            :current="currentPage"
                            :count="totalCount"
                            :limit="listCountPerPage"
                            :limit-list="[listCountPerPage]"
                            :show-limit="false"
                            @change="onPageChange">
                        </bk-pagination>
                    </div>
                </div>
                <span v-show="dataError" class="common-error-tip error-info">{{i18n.notEmpty}}</span>
            </div>
        </div>
        <static-ip-adding-panel
            v-if="isIpAddingPanelShow"
            :allow-unfold-input="allowUnfoldInput"
            :static-ip-list="staticIpList"
            :static-ips="staticIps"
            :type="addingType"
            @onAddIpConfirm="onAddIpConfirm"
            @onAddIpCancel="onAddIpCancel">
        </static-ip-adding-panel>
    </div>
</template>
<script>
    import '@/utils/i18n.js' // ip选择器兼容标准运维国际化

    import StaticIpAddingPanel from './StaticIpAddingPanel.vue'
    import IpSearchInput from './IpSearchInput.vue'

    const i18n = {
        copyIp: gettext('复制IP'),
        copyAgentIp: gettext('复制Agent异常IP'),
        clearIp: gettext('清空IP'),
        clearFailedAgentIp: gettext('清空Agent异常IP'),
        success: gettext('成功'),
        selectAdd: gettext('选择添加'),
        manualAdd: gettext('手动添加'),
        batchOperations: gettext('批量操作'),
        total: gettext('共'),
        staticIpNum: gettext('个静态IP，'),
        among: gettext('其中'),
        num: gettext('个'),
        cloudArea: gettext('云区域'),
        status: gettext('状态'),
        error: gettext('异常'),
        operation: gettext('操作'),
        remove: gettext('移除'),
        normal: gettext('正常'),
        server: gettext('服务器'),
        noData: gettext('无数据'),
        return: gettext('返回'),
        noDataCan: gettext('无数据，可'),
        notEmpty: gettext('必填项'),
        or: gettext('或者'),
        hostName: gettext('主机名')
    }

    export default {
        name: 'StaticIp',
        components: {
            StaticIpAddingPanel,
            IpSearchInput
        },
        props: {
            allowUnfoldInput: Boolean,
            editable: Boolean,
            staticIpList: Array,
            staticIps: Array
        },
        data () {
            const listCountPerPage = 5
            const totalPage = Math.ceil(this.staticIps.length / listCountPerPage)
            return {
                isDropdownShow: false,
                isIpAddingPanelShow: false,
                addingType: '',
                isSearchMode: false,
                copyText: '',
                ipSortActive: '', // ip 排序方式
                hostNameSortActive: '', // hostname 排序方式
                searchResult: [],
                list: this.staticIps,
                isPaginationShow: totalPage > 1,
                currentPage: 1,
                totalCount: this.staticIps.length,
                listCountPerPage: listCountPerPage,
                listInPage: this.staticIps.slice(0, listCountPerPage),
                dataError: false,
                operations: [
                    {
                        type: 'copyIp',
                        name: i18n.copyIp
                    },
                    {
                        type: 'copyAgentIp',
                        name: i18n.copyAgentIp
                    },
                    {
                        type: 'clearIp',
                        name: i18n.clearIp
                    },
                    {
                        type: 'clearFailedAgentIp',
                        name: i18n.clearFailedAgentIp
                    }
                ],
                i18n,
                isUnfold: false
            }
        },
        computed: {
            failedAgentLength () {
                return this.staticIps.filter(item => !item.agent).length
            },
            isShowQuantity () {
                return this.staticIps.length
            }
        },
        watch: {
            staticIps (val) {
                this.setDisplayList()
                if (this.staticIps.length !== 0) {
                    this.dataError = false
                }
            },
            isSearchMode () {
                this.setDisplayList()
            },
            ipSortActive () {
                this.setDisplayList()
            },
            hostNameSortActive () {
                this.setDisplayList()
            }
        },
        methods: {
            setDisplayList () {
                let list = this.isSearchMode ? this.searchResult : this.staticIps
                if (this.ipSortActive) {
                    list = this.getSortIpList(list, this.ipSortActive)
                }
                if (this.hostNameSortActive) {
                    list = this.getSortHostNameList(list, this.hostNameSortActive)
                }
                this.list = list
                this.setPanigation(list)
            },
            setPanigation (list = []) {
                this.listInPage = list.slice(0, this.listCountPerPage)
                const totalPage = Math.ceil(list.length / this.listCountPerPage)
                this.isPaginationShow = totalPage > 1
                this.totalCount = list.length
                this.currentPage = 1
            },
            onAddPanelShow (type) {
                if (!this.editable) {
                    return
                }
                this.addingType = type
                this.isIpAddingPanelShow = true
            },
            handleIpCopy (ipStr) {
                this.copyText = ipStr
                document.addEventListener('copy', this.copyHandler)
                document.execCommand('copy')
                document.removeEventListener('copy', this.copyHandler)
                this.copyText = ''
            },
            copyHandler (e) {
                e.clipboardData.setData('text/html', this.copyText)
                e.clipboardData.setData('text/plain', this.copyText)
                e.preventDefault()
            },
            copyIp () {
                const ipStr = this.staticIps.map(item => item.bk_host_innerip).join(',')
                this.handleIpCopy(ipStr)
            },
            copyAgentIp () {
                const ipStr = this.staticIps.filter(item => !item.agent).map(d => d.bk_host_innerip).join(',')
                this.handleIpCopy(ipStr)
            },
            clearIp () {
                this.$emit('change', [])
            },
            clearFailedAgentIp () {
                const staticIps = this.staticIps.filter(item => !!item.agent)
                this.$emit('change', staticIps)
            },
            onDropdownShow () {
                this.isDropdownShow = true
            },
            onDropdownHide () {
                this.isDropdownShow = false
            },
            onStaticIpFocus () {
                this.isUnfold = this.allowUnfoldInput
            },
            onStaticIpSearch (keyword) {
                if (keyword) {
                    const keyArr = keyword.split(',').map(item => item.trim()).filter(item => {
                        return item !== ''
                    })
                    const list = this.staticIps.filter(item => {
                        return keyArr.some(str => item.bk_host_innerip.indexOf(str) > -1)
                    })
                    this.searchResult = list
                    this.setPanigation(list)
                    this.isSearchMode = true
                } else {
                    this.setPanigation(this.staticIps)
                    this.isSearchMode = false
                }
            },
            onOperationClick (operation) {
                const { type, name } = operation
                this[type] && this[type]()
                this.$bkMessage({
                    message: name + this.i18n.success,
                    theme: 'success'
                })
            },
            onRemoveIpClick (id) {
                if (!this.editable) {
                    return
                }
                const index = this.staticIps.findIndex(item => item.bk_host_id === id)
                const staticIps = this.staticIps.slice(0)
                staticIps.splice(index, 1)
                if (this.isSearchMode) { // 搜索模式下移除 ip
                    this.searchResult = []
                    this.setDisplayList()
                }
                this.$emit('change', staticIps)
            },
            onAddIpConfirm (data) {
                this.$emit('change', data)
                this.isIpAddingPanelShow = false
                this.$nextTick(() => {
                    this.$refs.ipSearchInput.handleSearch()
                })
            },
            onAddIpCancel () {
                this.isIpAddingPanelShow = false
            },
            onPageChange (page) {
                this.currentPage = page
                this.listInPage = this.list.slice((page - 1) * this.listCountPerPage, page * this.listCountPerPage)
            },
            validate () {
                if (this.staticIps.length) {
                    this.dataError = false
                    return true
                } else {
                    this.dataError = true
                    this.onAddIpCancel()
                    return false
                }
            },
            getSortIpList (list, way = 'up') {
                const srotList = list.slice(0)
                const sortVal = way === 'up' ? 1 : -1
                srotList.sort((a, b) => {
                    const srotA = a.bk_host_innerip.split('.')
                    const srotB = b.bk_host_innerip.split('.')
                    for (let i = 0; i < 4; i++) {
                        if (srotA[i] * 1 > srotB[i] * 1) {
                            return sortVal
                        } else if (srotA[i] * 1 < srotB[i] * 1) {
                            return -sortVal
                        }
                    }
                })
                return srotList
            },
            getSortHostNameList (list, way = 'up') {
                const sortList = list.slice(0)
                const sortVal = way === 'up' ? 1 : -1
                sortList.sort((a, b) => {
                    if (a.bk_host_name > b.bk_host_name) {
                        return sortVal
                    } else {
                        return -sortVal
                    }
                })
                return sortList
            },
            onIpSort (way) {
                this.hostNameSortActive = ''
                if (this.ipSortActive === way) {
                    this.ipSortActive = ''
                    return
                }
                this.ipSortActive = way
            },
            onHostNameSort (way) {
                this.ipSortActive = ''
                if (this.hostNameSortActive === way) {
                    this.hostNameSortActive = ''
                    return
                }
                this.hostNameSortActive = way
            }
        }
    }
</script>
<style lang="scss" scoped>
.operation-area {
    position: relative;
    margin: 20px 0;
    .bk-button {
        font-size: 12px;
    }
    .bk-dropdown-menu {
        margin-left: 4px;
    }
    .trigger-btn {
        width: 162px;
        padding: 0px;
        font-size: 12px;
    }
}
.operation-btn {
    padding: 5px 8px;
    font-size: 12px;
    cursor: pointer;
    &:hover {
        color: #3a84ff;
        background: #ebf4ff;
    }
}
.ip-search-wrap {
    position: absolute;
    top: 0px;
    right: 0;
    width: 32%;
    &.static-ip-unfold {
        left: 0;
        width: 356px;
    }
}
.return-text {
    position: absolute;
    left: 368px;
    top: 5px;
    color: #3a84ff;
    cursor: pointer;
}
.ip-table {
    width: 100%;
    border: 1px solid #dde4eb;
    border-collapse: collapse;
    table-layout:fixed;
    tr {
        border-bottom: 1px solid #dde4eb;
    }
    th {
        color: #313238;
    }
    th,td {
        padding: 12px 10px;
        line-height: 1;
        font-size: 12px;
        font-weight: normal;
        text-align: left;
        &.agent-normal {
            color: #22a945;
        }
        &.agent-failed {
            color: #ea3636;
        }
    }
    .remove-ip-btn {
        color: #3a84ff;
        cursor: pointer;
        &.disabled {
            color: #cccccc;
            cursor: not-allowed;
        }
    }
    .static-ip-empty {
        height: 214px;
        text-align: center;
        color: #c4c6cc;
        .add-ip-btn {
            margin: 0 -2px 0 -2px;
            color: #3a84ff;
            cursor: pointer;
        }
    }
    &.disabled {
        th, td {
            color: #cccccc;
        }
    }
    .sort-group {
        display: inline-block;
        margin-left: 6px;
        vertical-align: top;
        .sort-icon {
            display: block;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 5px 5px 0 5px;
            border-color: #c4c6cc transparent transparent transparent;
            cursor: pointer;
            &.up {
                margin-bottom: 2px;
                transform: rotate(180deg);
            }
            &.active {
                border-color: #3a84ff transparent transparent transparent;
            }
        }
    }
    .ui-ellipsis {
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }
}
.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    .selected-num {
        font-size: 12px;
        .total-ip {
            color: #3a84ff;
        }
        .total-not-installed {
            color: #ea3636;
        }
    }
}
</style>
